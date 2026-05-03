import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  LogOut,
} from 'lucide-react';
import { useCanvas } from '../hooks/useCanvas';
import { useWebSocket } from '../hooks/useWebSocket';
import { Toolbar } from '../components/Toolbar';
import { TopBar } from '../components/TopBar';
import type { DrawingAction, Tool, User } from '../types/appTypes';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function WhiteboardPage() {
  console.log("WhiteboardPage rendering...");
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get('username') || 'Anonymous';
  const actionParam = searchParams.get('action') || 'join';
  
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [color, setColor] = useState('#ededed');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState<{ id: string, x: number, y: number, initialText?: string } | null>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [activeAction, setActiveAction] = useState<DrawingAction | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [remoteActiveActions, setRemoteActiveActions] = useState<Record<string, DrawingAction>>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const startPos = useRef({ x: 0, y: 0 });
  const currentPoints = useRef<{ x: number, y: number }[]>([]);

  const {
    canvasRef,
    previewCanvasRef,
    redraw,
    drawPreview,
    clearPreview
  } = useCanvas({
    actions,
    remoteActiveActions,
    selectedActionId,
    theme
  });

  const {
    userId,
    isConnected,
    error,
    sendDraw,
    sendDrawStep,
    sendMove,
    sendUndo,
    sendClear,
    onDraw,
    onDrawStep,
    onMove,
    onUndo,
    onClear,
    onUsers
  } = useWebSocket(roomId || '', username, actionParam);

  useEffect(() => {
    onDraw((action) => setActions(prev => [...prev, action]));
    onDrawStep((action) => setRemoteActiveActions(prev => ({ ...prev, [action.userId]: action })));
    onMove((action) => {
      setActions(prev => prev.map(a => a.actionId === action.actionId ? action : a));
    });
    onUndo((uid) => {
      setActions(prev => {
        const newActions = [...prev];
        for (let i = newActions.length - 1; i >= 0; i--) {
          if (newActions[i].userId === uid) {
            newActions.splice(i, 1);
            break;
          }
        }
        return newActions;
      });
    });
    onClear(() => {
      setActions([]);
      setRemoteActiveActions({});
    });
    onUsers((updatedUsers) => setUsers(updatedUsers));
  }, [onDraw, onDrawStep, onMove, onUndo, onClear, onUsers]);

  useEffect(() => {
    redraw(panOffset);
  }, [actions, remoteActiveActions, selectedActionId, panOffset, theme, redraw]);

  const getPointerPos = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: clientX - rect.left - panOffset.x,
      y: clientY - rect.top - panOffset.y,
    };
  }, [panOffset, canvasRef]);

  const isPointInAction = (pos: { x: number, y: number }, action: DrawingAction) => {
    if (action.tool === 'pen' || action.tool === 'eraser') {
      if (!action.points) return false;
      return action.points.some(p => Math.sqrt(Math.pow(p.x - pos.x, 2) + Math.pow(p.y - pos.y, 2)) < 10);
    }
    if (action.startX === undefined || action.startY === undefined || action.endX === undefined || action.endY === undefined) return false;
    const x = Math.min(action.startX, action.endX);
    const y = Math.min(action.startY, action.endY);
    const w = Math.abs(action.startX - action.endX);
    const h = Math.abs(action.startY - action.endY);
    
    if (action.tool === 'line') {
      const d1 = Math.sqrt(Math.pow(pos.x - action.startX, 2) + Math.pow(pos.y - action.startY, 2));
      const d2 = Math.sqrt(Math.pow(pos.x - action.endX, 2) + Math.pow(pos.y - action.endY, 2));
      const lineLen = Math.sqrt(Math.pow(action.startX - action.endX, 2) + Math.pow(action.startY - action.endY, 2));
      return d1 + d2 >= lineLen - 0.1 && d1 + d2 <= lineLen + 0.1;
    }
    
    return pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h;
  };

  const getResizeHandle = (pos: { x: number; y: number }, action: DrawingAction) => {
    const handleSize = 10;
    const handles: Record<string, { x: number; y: number }> = {};
    if (action.tool === 'line') {
      handles.start = { x: action.startX!, y: action.startY! };
      handles.end = { x: action.endX!, y: action.endY! };
    } else {
      handles.nw = { x: action.startX!, y: action.startY! };
      handles.ne = { x: action.endX!, y: action.startY! };
      handles.sw = { x: action.startX!, y: action.endY! };
      handles.se = { x: action.endX!, y: action.endY! };
    }

    for (const [id, h] of Object.entries(handles)) {
      const dist = Math.sqrt(Math.pow(pos.x - h.x, 2) + Math.pow(pos.y - h.y, 2));
      if (dist < handleSize * 2) return id;
    }
    return null;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    startPos.current = pos;

    if (activeTool === 'select') {
      if (selectedActionId) {
        const action = actions.find(a => a.actionId === selectedActionId);
        if (action) {
          const handle = getResizeHandle(pos, action);
          if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
            setIsDrawing(true);
            return;
          }
        }
      }
      
      const clickedAction = [...actions].reverse().find(action => isPointInAction(pos, action));
      if (clickedAction) {
        setSelectedActionId(clickedAction.actionId || null);
        setIsDrawing(true);
        return;
      }

      setSelectedActionId(null);
      setIsDrawing(true);
      return;
    }

    if (activeTool === 'hand') {
      const clickedAction = [...actions].reverse().find(action => isPointInAction(pos, action));
      if (clickedAction) {
        setSelectedActionId(clickedAction.actionId || null);
        setIsDrawing(true);
        return;
      }
      return;
    }

    if (activeTool === 'text') {
      const clickedAction = [...actions].reverse().find(action => action.tool === 'text' && isPointInAction(pos, action));
      if (clickedAction) {
        setTextInput({ id: clickedAction.actionId!, x: clickedAction.startX!, y: clickedAction.startY!, initialText: clickedAction.text });
        setIsBold(clickedAction.isBold || false);
        setIsItalic(clickedAction.isItalic || false);
        setTextAlign(clickedAction.textAlign || 'left');
        return;
      }
      const id = Date.now().toString();
      setTextInput({ id, x: pos.x, y: pos.y });
      return;
    }

    setIsDrawing(true);
    currentPoints.current = [pos];
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPointerPos(e);

    if (activeTool === 'select') {
      if (isResizing && selectedActionId) {
        setActions(prev => prev.map(a => {
          if (a.actionId === selectedActionId) {
            const updated = { ...a };
            if (resizeHandle === 'se') { updated.endX = pos.x; updated.endY = pos.y; }
            else if (resizeHandle === 'nw') { updated.startX = pos.x; updated.startY = pos.y; }
            else if (resizeHandle === 'ne') { updated.endX = pos.x; updated.startY = pos.y; }
            else if (resizeHandle === 'sw') { updated.startX = pos.x; updated.endY = pos.y; }
            else if (resizeHandle === 'start') { updated.startX = pos.x; updated.startY = pos.y; }
            else if (resizeHandle === 'end') { updated.endX = pos.x; updated.endY = pos.y; }
            return updated;
          }
          return a;
        }));
        return;
      }
      
      let moveX = 0; let moveY = 0;
      if ('movementX' in e) { moveX = (e as any).movementX; moveY = (e as any).movementY; }
      else if ('touches' in e && (e as any).lastTouch) {
        const touch = (e as any).touches[0];
        moveX = touch.clientX - (e as any).lastTouch.x;
        moveY = touch.clientY - (e as any).lastTouch.y;
        (e as any).lastTouch = { x: touch.clientX, y: touch.clientY };
      }
      if (moveX !== 0 || moveY !== 0) setPanOffset(prev => ({ x: prev.x + moveX, y: prev.y + moveY }));
      return;
    }

    if (activeTool === 'hand' && selectedActionId) {
      const dx = pos.x - startPos.current.x;
      const dy = pos.y - startPos.current.y;
      setActions(prev => prev.map(a => {
        if (a.actionId === selectedActionId) {
          const updated = { ...a };
          if (updated.startX !== undefined) updated.startX += dx;
          if (updated.startY !== undefined) updated.startY += dy;
          if (updated.endX !== undefined) updated.endX += dx;
          if (updated.endY !== undefined) updated.endY += dy;
          if (updated.points) updated.points = updated.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
          return updated;
        }
        return a;
      }));
      startPos.current = pos;
      return;
    }

    if (activeTool === 'pen' || activeTool === 'eraser') {
      currentPoints.current.push(pos);
      const action: DrawingAction = {
        type: 'draw',
        tool: activeTool,
        color,
        strokeWidth,
        userId: userId || '',
        points: currentPoints.current,
      };
      drawPreview(action, panOffset);
      if (currentPoints.current.length >= 2) {
        sendDrawStep({ ...action, points: currentPoints.current.slice(-2) });
      }
    } else if (activeTool !== 'text') {
      const action: DrawingAction = {
        type: 'draw',
        tool: activeTool,
        color,
        strokeWidth,
        userId: userId || '',
        startX: startPos.current.x,
        startY: startPos.current.y,
        endX: pos.x,
        endY: pos.y,
      };
      setActiveAction(action);
      drawPreview(action, panOffset);
    }
  };

  const endDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setIsResizing(false);
    setResizeHandle(null);

    if (activeTool === 'select' || activeTool === 'hand') {
      if (selectedActionId) {
        const action = actions.find(a => a.actionId === selectedActionId);
        if (action) sendMove(action);
      }
      return;
    }

    if (activeAction) {
      const action = { ...activeAction, actionId: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9) };
      setActions(prev => [...prev, action]);
      sendDraw(action);
      setActiveAction(null);
    } else if (currentPoints.current.length > 0) {
      const action: DrawingAction = {
        type: 'draw',
        tool: activeTool,
        color,
        strokeWidth,
        userId: userId || '',
        points: [...currentPoints.current],
        actionId: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
      };
      setActions(prev => [...prev, action]);
      sendDraw(action);
      currentPoints.current = [];
    }
    clearPreview();
  }, [isDrawing, activeTool, activeAction, selectedActionId, actions, sendDraw, sendMove, clearPreview, color, strokeWidth, userId]);

  const submitText = (text: string, state: any) => {
    if (!text.trim()) { setTextInput(null); return; }
    const action: DrawingAction = {
      type: 'draw',
      tool: 'text',
      color,
      strokeWidth,
      userId: userId || '',
      startX: state.x,
      startY: state.y,
      text,
      isBold,
      isItalic,
      textAlign,
      actionId: state.id
    };
    setActions(prev => {
      const filtered = prev.filter(a => a.actionId !== state.id);
      return [...filtered, action];
    });
    sendDraw(action);
    setTextInput(null);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my C-Board',
          text: `Join me on C-Board to collaborate!`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          setIsShareModalOpen(true);
        }
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="h-screen w-screen bg-background relative select-none overflow-hidden text-foreground" data-theme={theme}>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />
      <canvas
        ref={previewCanvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className={cn(
          "absolute inset-0 z-10 w-full h-full touch-none",
          activeTool === 'hand' ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
        )}
      />

      <TopBar 
        roomId={roomId || ''} 
        users={users} 
        isConnected={isConnected}
        theme={theme}
        onToggleTheme={toggleTheme}
        onShare={handleShare} 
        onLeave={() => setIsLeaveModalOpen(true)}
        currentUserId={userId || ''}
      />
      
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        theme={theme}
        isBold={isBold}
        setIsBold={setIsBold}
        isItalic={isItalic}
        setIsItalic={setIsItalic}
        textAlign={textAlign}
        setTextAlign={setTextAlign}
        onUndo={() => {
          sendUndo();
          setActions(prev => {
            const newActions = [...prev];
            for (let i = newActions.length - 1; i >= 0; i--) {
              if (newActions[i].userId === (userId || '')) {
                newActions.splice(i, 1);
                break;
              }
            }
            return newActions;
          });
        }}
        onClear={() => { sendClear(); setActions([]); }}
      />

      {/* Text Input Modal */}
      {textInput && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="glass-panel p-6 rounded-3xl shadow-2xl w-full max-w-lg mx-4 border border-foreground/10">
            <div className="flex items-center gap-2 mb-4 border-b border-foreground/5 pb-4">
              <button onClick={() => setIsBold(!isBold)} className={cn("p-2 rounded-xl transition-all", isBold ? "bg-primary text-white" : "text-foreground/40 hover:bg-foreground/5")}>
                <Bold size={16} />
              </button>
              <button onClick={() => setIsItalic(!isItalic)} className={cn("p-2 rounded-xl transition-all", isItalic ? "bg-primary text-white" : "text-foreground/40 hover:bg-foreground/5")}>
                <Italic size={16} />
              </button>
            </div>
            <textarea
              autoFocus
              defaultValue={textInput.initialText}
              className="w-full bg-transparent outline-none text-foreground placeholder-foreground/20 font-medium resize-none min-h-[120px]"
              placeholder="Enter your text here..."
              style={{ fontSize: `${strokeWidth * 4}px`, fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', textAlign }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitText(e.currentTarget.value, textInput); }
                else if (e.key === 'Escape') setTextInput(null);
              }}
            />
            <div className="flex justify-end mt-4">
              <button onClick={() => {
                const txt = document.querySelector('textarea')?.value;
                if (txt) submitText(txt, textInput);
              }} className="px-6 py-2 bg-primary text-white font-black rounded-xl shadow-lg hover:scale-105 transition-all">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsLeaveModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl border border-foreground/10" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-black text-foreground mb-2">Leave Room?</h2>
              <p className="text-sm text-foreground/40 mb-8">Are you sure you want to leave? Your progress remains for others.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsLeaveModalOpen(false)} className="flex-1 px-6 py-3 bg-foreground/5 border border-foreground/10 text-foreground text-xs font-black rounded-xl hover:bg-foreground/10">Cancel</button>
                <button onClick={() => navigate('/')} className="flex-1 px-6 py-3 bg-red-500 text-white text-xs font-black rounded-xl shadow-lg">Leave</button>
              </div>
            </motion.div>
          </div>
        )}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl border border-foreground/10" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-black text-foreground mb-4">Share Room</h2>
              <p className="text-sm text-foreground/40 mb-4">Share this Room ID:</p>
              <div className="flex gap-2">
                <input readOnly value={roomId || ''} className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground font-mono text-sm" />
                <button onClick={() => navigator.clipboard.writeText(roomId || '')} className="px-5 py-3 bg-primary text-white text-sm font-black rounded-xl">Copy</button>
              </div>
            </motion.div>
          </div>
        )}
        {error && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl border border-red-500/30 text-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-foreground mb-3">Connection Failed</h2>
              <p className="text-sm text-foreground/60 mb-8">{error}</p>
              <button onClick={() => navigate('/')} className="w-full px-6 py-4 bg-primary text-white text-sm font-black rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
                Return to Home
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WhiteboardPage;

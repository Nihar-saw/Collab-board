import { useEffect, useRef, useCallback } from 'react';
import type { DrawingAction, Tool } from '../types/appTypes';

interface UseCanvasProps {
  actions: DrawingAction[];
  remoteActiveActions: Record<string, DrawingAction>;
  selectedActionId: string | null;
  theme: 'light' | 'dark';
}

export function useCanvas({ actions, remoteActiveActions, selectedActionId, theme }: UseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const previewContextRef = useRef<CanvasRenderingContext2D | null>(null);

  const defaultColor = theme === 'dark' ? '#ededed' : '#0f172a';

  const setupCanvas = useCallback((canvas: HTMLCanvasElement | null, isPreview: boolean) => {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);
    if (isPreview) {
      previewContextRef.current = ctx;
    } else {
      contextRef.current = ctx;
    }
  }, []);

  // Initialize canvas when refs are available
  useEffect(() => {
    if (canvasRef.current && previewCanvasRef.current) {
      setupCanvas(canvasRef.current, false);
      setupCanvas(previewCanvasRef.current, true);
    }
  }, [setupCanvas]);

  useEffect(() => {
    const handleResize = () => {
      setupCanvas(canvasRef.current, false);
      setupCanvas(previewCanvasRef.current, true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  const drawAction = useCallback((ctx: CanvasRenderingContext2D, action: DrawingAction) => {
    if (!action.tool) return;

    ctx.save();
    let strokeColor = action.color || defaultColor;
    if (strokeColor === '#ededed' && theme === 'light') strokeColor = '#000000';
    if ((strokeColor === '#000000' || strokeColor === '#0f172a') && theme === 'dark') strokeColor = '#000000ff';

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = action.strokeWidth || 2;
    ctx.fillStyle = strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (action.tool) {
      case 'pen':
      case 'eraser': {
        if (action.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          if (ctx === previewContextRef.current) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
          }
        }
        
        if (action.points && action.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          for (let i = 1; i < action.points.length; i++) {
            ctx.lineTo(action.points[i].x, action.points[i].y);
          }
          ctx.stroke();
        }
        break;
      }
      case 'line': {
        ctx.beginPath();
        ctx.moveTo(action.startX!, action.startY!);
        ctx.lineTo(action.endX!, action.endY!);
        ctx.stroke();
        break;
      }
      case 'rect': {
        ctx.strokeRect(
          action.startX!,
          action.startY!,
          action.endX! - action.startX!,
          action.endY! - action.startY!
        );
        break;
      }
      case 'circle': {
        const rx = (action.endX! - action.startX!) / 2;
        const ry = (action.endY! - action.startY!) / 2;
        const cx = action.startX! + rx;
        const cy = action.startY! + ry;
        const r = Math.sqrt(rx * rx + ry * ry);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'text': {
        const fontSize = (action.strokeWidth || 3) * 5;
        ctx.font = `${action.isItalic ? 'italic' : ''} ${action.isBold ? 'bold' : ''} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = action.textAlign || 'left';
        ctx.textBaseline = 'top';
        const lines = (action.text || '').split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(line, action.startX!, action.startY! + i * fontSize * 1.2);
        });
        break;
      }
    }
    ctx.restore();
  }, [theme, defaultColor]);

  const redraw = useCallback((panOffset: { x: number; y: number }) => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.translate(panOffset.x, panOffset.y);

    actions.forEach(action => drawAction(ctx, action));
    Object.values(remoteActiveActions).forEach(action => drawAction(ctx, action));

    if (selectedActionId) {
      const action = actions.find(a => a.actionId === selectedActionId);
      if (action && (action.tool === 'rect' || action.tool === 'circle' || action.tool === 'line')) {
        const handleSize = 8;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        const x1 = action.startX!;
        const y1 = action.startY!;
        const x2 = action.endX!;
        const y2 = action.endY!;

        if (action.tool !== 'line') {
          ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x1 - x2), Math.abs(y1 - y2));
        } else {
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }

        ctx.setLineDash([]);
        ctx.fillStyle = '#3b82f6';
        const handles = action.tool === 'line' ? [[x1, y1], [x2, y2]] : [[x1, y1], [x2, y1], [x1, y2], [x2, y2]];
        handles.forEach(([hx, hy]) => {
          ctx.beginPath();
          ctx.arc(hx, hy, handleSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
    }
    ctx.restore();
  }, [actions, remoteActiveActions, drawAction, selectedActionId, theme]);

  const drawPreview = useCallback((action: DrawingAction, panOffset: { x: number; y: number }) => {
    const ctx = previewContextRef.current;
    const canvas = previewCanvasRef.current;
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.translate(panOffset.x, panOffset.y);
    drawAction(ctx, action);
    ctx.restore();
  }, [drawAction]);

  const clearPreview = useCallback(() => {
    const ctx = previewContextRef.current;
    const canvas = previewCanvasRef.current;
    if (!ctx || !canvas) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, []);

  return { canvasRef, previewCanvasRef, redraw, drawPreview, clearPreview };
}

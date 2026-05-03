/// <reference types="vite/client" />
import { useEffect, useRef, useCallback, useState } from 'react';
import type { DrawingAction, User } from '../types/appTypes';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:4000';

type OnDrawCallback = (action: DrawingAction) => void;
type OnDrawStepCallback = (action: DrawingAction) => void;
type OnUndoCallback = (userId: string) => void;
type OnClearCallback = () => void;
type OnUsersCallback = (users: User[]) => void;
type OnMoveCallback = (action: DrawingAction) => void;

export function useWebSocket(roomId: string, username: string, action: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const onDrawRef = useRef<OnDrawCallback | null>(null);
  const onDrawStepRef = useRef<OnDrawStepCallback | null>(null);
  const onUndoRef = useRef<OnUndoCallback | null>(null);
  const onClearRef = useRef<OnClearCallback | null>(null);
  const onUsersRef = useRef<OnUsersCallback | null>(null);
  const onMoveRef = useRef<OnMoveCallback | null>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`${WS_URL}?roomId=${roomId}&username=${encodeURIComponent(username)}&action=${action}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = (event) => {
      setIsConnected(false);
      setUserId(null);
      if (event.code === 4004) {
        setError('Room not found. Please check the Room ID and try again.');
      }
    };
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'init':
            setUserId(msg.userId);
            if (onUsersRef.current) onUsersRef.current(msg.users);
            break;
          case 'users':
            if (onUsersRef.current) onUsersRef.current(msg.users);
            break;
          case 'draw':
            if (onDrawRef.current) onDrawRef.current(msg.action);
            break;
          case 'drawStep':
            if (onDrawStepRef.current) onDrawStepRef.current(msg.action);
            break;
          case 'move':
            if (onMoveRef.current) onMoveRef.current(msg.action);
            break;
          case 'undo':
            if (onUndoRef.current) onUndoRef.current(msg.userId);
            break;
          case 'clear':
            if (onClearRef.current) onClearRef.current();
            break;
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, username]);

  const sendDraw = useCallback((action: DrawingAction) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'draw', action }));
    }
  }, []);

  const sendDrawStep = useCallback((action: DrawingAction) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'drawStep', action }));
    }
  }, []);

  const sendMove = useCallback((action: DrawingAction) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'move', action }));
    }
  }, []);

  const sendUndo = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'undo' }));
    }
  }, []);

  const sendClear = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'clear' }));
    }
  }, []);

  const onDraw = useCallback((cb: OnDrawCallback) => { onDrawRef.current = cb; }, []);
  const onDrawStep = useCallback((cb: OnDrawStepCallback) => { onDrawStepRef.current = cb; }, []);
  const onUndo = useCallback((cb: OnUndoCallback) => { onUndoRef.current = cb; }, []);
  const onClear = useCallback((cb: OnClearCallback) => { onClearRef.current = cb; }, []);
  const onUsers = useCallback((cb: OnUsersCallback) => { onUsersRef.current = cb; }, []);
  const onMove = useCallback((cb: OnMoveCallback) => { onMoveRef.current = cb; }, []);

  return {
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
  };
}

export type Tool = 'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'text' | 'select' | 'hand';

export interface User {
  id: string;
  username: string;
  color: string;
}

export interface DrawingAction {
  type: 'draw' | 'clear' | 'undo';
  tool?: Tool;
  color?: string;
  strokeWidth?: number;
  userId: string;
  actionId?: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  points?: { x: number; y: number }[];
  text?: string;
  isBold?: boolean;
  isItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

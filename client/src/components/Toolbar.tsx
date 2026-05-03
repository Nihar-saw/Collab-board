import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pencil, 
  Square, 
  Circle, 
  Minus, 
  Eraser, 
  Type, 
  MousePointer2,
  Hand,
  Sliders,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Undo2,
  Trash2
} from 'lucide-react';
import type { Tool } from '../types/appTypes';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  theme: 'light' | 'dark';
  isBold?: boolean;
  setIsBold?: (b: boolean) => void;
  isItalic?: boolean;
  setIsItalic?: (i: boolean) => void;
  textAlign?: 'left' | 'center' | 'right';
  setTextAlign?: (a: 'left' | 'center' | 'right') => void;
  showTextOptions?: boolean;
  onUndo: () => void;
  onClear: () => void;
}

const ToolbarButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
  tooltip,
  showTooltip,
  hideTooltip,
  className
}: any) => (
  <div
    className="relative flex items-center justify-center"
    onMouseEnter={() => showTooltip(label)}
    onMouseLeave={hideTooltip}
  >
    <button
      onClick={onClick}
      className={cn(
        "h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90",
        isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/60 hover:bg-foreground/5",
        className
      )}
      aria-label={label}
    >
      <Icon size={18} />
    </button>
    <AnimatePresence>
      {tooltip === label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1.5 shadow-2xl z-[100] text-nowrap"
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  theme,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  textAlign,
  setTextAlign,
  showTextOptions,
  onUndo,
  onClear
}) => {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [showSizeSettings, setShowSizeSettings] = useState(false);

  const COLORS = [
    theme === 'dark' ? '#ededed' : '#000000',
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  ];

  const showTooltip = (label: string) => setTooltip(label);
  const hideTooltip = () => setTooltip(null);

  const TOOLS = [
    { id: 'select', icon: MousePointer2, label: 'Pan View' },
    { id: 'hand', icon: Hand, label: 'Move Object' },
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'rect', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ] as const;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="glass-panel p-1.5 rounded-2xl flex items-center gap-1 shadow-2xl border border-foreground/10"
        >
          {/* Main Tools Section */}
          <div className="flex items-center gap-1 p-1">
            {TOOLS.map((tool) => (
              <ToolbarButton
                key={tool.id}
                label={tool.label}
                icon={tool.icon}
                isActive={activeTool === tool.id}
                onClick={() => setActiveTool(tool.id)}
                tooltip={tooltip}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-foreground/10 mx-1" />

          {/* Thickness & Options Section */}
          <div className="relative">
             <ToolbarButton
                label="Thickness"
                icon={Sliders}
                isActive={showSizeSettings}
                onClick={() => setShowSizeSettings(!showSizeSettings)}
                tooltip={tooltip}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
              />
              
              <AnimatePresence>
                {showSizeSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 glass-panel p-5 rounded-3xl flex flex-col items-center gap-4 shadow-2xl z-[100] border border-foreground/10 min-w-[200px]"
                  >
                    <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Thickness</div>
                    <div className="grid grid-cols-4 gap-2 w-full">
                      {[2, 5, 12, 24].map((size, index) => {
                        const labels = ['Thin', 'Mid', 'Thick', 'XL'];
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setStrokeWidth(size)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all border",
                              strokeWidth === size ? "bg-primary border-primary text-white shadow-lg" : "bg-foreground/5 border-foreground/5 text-foreground/40 hover:bg-foreground/10"
                            )}
                          >
                            <div className="rounded-full bg-current" style={{ width: 4 + index*2, height: 4 + index*2 }} />
                            <span className="text-[7px] font-black">{labels[index]}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-full h-px bg-foreground/10" />
                    <input
                      type="range"
                      min="1" max="40"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="text-[10px] font-bold text-foreground/60">{strokeWidth}px</div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-foreground/10 mx-1" />

          {/* Color Palette Section */}
          <div className="flex items-center gap-1.5 px-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-5 h-5 rounded-full transition-all hover:scale-125 border-2",
                  color === c ? "border-foreground scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
            <div className="relative w-6 h-6 rounded-lg bg-gradient-to-tr from-primary via-accent to-purple-500 p-[1.5px] cursor-pointer">
               <input 
                 type="color" 
                 value={color} 
                 onChange={(e) => setColor(e.target.value)}
                 className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
               />
               <div className="w-full h-full rounded-[6px] bg-background flex items-center justify-center text-[10px] font-bold text-foreground/40">+</div>
            </div>
          </div>

          {/* Text Formatting Section (Conditional) */}
          {(showTextOptions || activeTool === 'text') && (
            <>
              <div className="w-px h-6 bg-foreground/10 mx-1" />
              <div className="flex items-center gap-1">
                <ToolbarButton
                  label="Bold"
                  icon={Bold}
                  isActive={!!isBold}
                  onClick={() => setIsBold?.(!isBold)}
                  tooltip={tooltip}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                />
                <ToolbarButton
                  label="Italic"
                  icon={Italic}
                  isActive={!!isItalic}
                  onClick={() => setIsItalic?.(!isItalic)}
                  tooltip={tooltip}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                />
                <div className="w-px h-4 bg-foreground/10 mx-1" />
                <ToolbarButton
                  label="Align Left"
                  icon={AlignLeft}
                  isActive={textAlign === 'left'}
                  onClick={() => setTextAlign?.('left')}
                  tooltip={tooltip}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                />
                <ToolbarButton
                  label="Align Center"
                  icon={AlignCenter}
                  isActive={textAlign === 'center'}
                  onClick={() => setTextAlign?.('center')}
                  tooltip={tooltip}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                />
                <ToolbarButton
                  label="Align Right"
                  icon={AlignRight}
                  isActive={textAlign === 'right'}
                  onClick={() => setTextAlign?.('right')}
                  tooltip={tooltip}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                />
              </div>
            </>
          )}

          <div className="w-px h-6 bg-foreground/10 mx-1" />

          {/* Action Section */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              label="Undo"
              icon={Undo2}
              isActive={false}
              onClick={onUndo}
              tooltip={tooltip}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />
            <ToolbarButton
              label="Clear"
              icon={Trash2}
              isActive={false}
              onClick={onClear}
              tooltip={tooltip}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

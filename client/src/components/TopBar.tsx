import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Share2, 
  LogOut, 
  Copy, 
  Check, 
  Undo2,
  Trash2,
  Sun,
  Moon,
  ChevronDown,
  Layout
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TopBarProps {
  roomId: string;
  users: { id: string; username: string; color: string }[];
  isConnected: boolean;
  onShare: () => void;
  onLeave: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentUserId: string;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  roomId, 
  users, 
  isConnected,
  onShare, 
  onLeave,
  theme,
  onToggleTheme,
  currentUserId
}) => {
  const [copied, setCopied] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="max-w-7xl mx-auto glass-panel rounded-2xl h-14 px-4 flex items-center justify-between pointer-events-auto shadow-2xl border-foreground/10"
      >
        {/* Left Section: Branding & Room ID */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-foreground/10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Layout size={18} className="text-white" />
            </div>
            <span className="text-sm font-black tracking-tight hidden md:block text-foreground">C-BOARD</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500",
              "shadow-[0_0_8px_rgba(34,197,94,0.4)]"
            )} />
            <div className="flex items-center gap-1.5 px-2 py-1 bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-all cursor-pointer group" onClick={handleCopy}>
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest group-hover:text-foreground/60 transition-colors">Room ID:</span>
              <span className="font-mono text-xs font-bold text-primary">{roomId}</span>
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-foreground/20" />}
            </div>
          </div>
        </div>

        {/* Middle Section: Participants (Modern Figma Style) */}
        <div className="relative">
          <button 
            onClick={() => setShowUserList(!showUserList)}
            className="flex items-center gap-3 px-3 py-1.5 hover:bg-foreground/5 rounded-xl transition-all group"
          >
            <div className="flex items-center -space-x-2.5">
              <AnimatePresence mode="popLayout">
                {users.slice(0, 3).map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    style={{ zIndex: users.length - i, backgroundColor: user.color }}
                    className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black uppercase text-white shadow-xl ring-1 ring-foreground/10"
                  >
                    {user.username[0]}
                  </motion.div>
                ))}
              </AnimatePresence>
              {users.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-background bg-foreground/10 flex items-center justify-center text-[10px] font-black text-foreground/40">
                  +{users.length - 3}
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[11px] font-bold text-foreground/90">{users.length} Online</span>
              <ChevronDown size={14} className={cn("text-foreground/20 transition-transform", showUserList && "rotate-180")} />
            </div>
          </button>

          <AnimatePresence>
            {showUserList && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserList(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 glass-panel rounded-3xl p-5 shadow-2xl border border-foreground/10 z-50"
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Active Collaborators</span>
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-lg">{users.length}</span>
                  </div>
                  
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto hide-scrollbar">
                    {users.map((user) => (
                      <div 
                        key={user.id}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-xl transition-all border border-transparent",
                          user.id === currentUserId ? "bg-primary/10 border-primary/20" : "hover:bg-foreground/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: user.color }}>
                            {user.username[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground/90">
                              {user.username} {user.id === currentUserId && <span className="text-[10px] text-primary">(You)</span>}
                            </span>
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-green-500" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-foreground/20">Active Now</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => { onShare(); setShowUserList(false); }}
                    className="w-full mt-4 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Invite to Collaborating
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className="p-2.5 text-foreground/60 hover:text-foreground hover:bg-foreground/10 rounded-xl transition-all active:scale-90">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={onShare}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Share2 size={16} />
            <span className="uppercase tracking-widest">Share</span>
          </button>

          <button 
            onClick={onLeave}
            className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
          >
            <LogOut size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

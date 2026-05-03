import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Link } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomId: string, username: string) => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose, onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      onJoin(roomId.trim(), username.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-panel rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-pink-500 flex items-center justify-center">
              <Link size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">Join Room</h2>
              <p className="text-[11px] text-white/40 font-medium">Enter a room code to collaborate</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Paste room ID..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!roomId.trim() || !username.trim()}
            className="w-full py-3 bg-gradient-to-r from-accent to-pink-500 text-white text-sm font-black rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-accent/20 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-accent/30"
          >
            Join Room
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinRoomModal;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Link, Zap, Shield, Users, Layers, ArrowRight, Github } from 'lucide-react';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';
import { LiquidCursor } from '../components/LiquidCursor';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-3xl glass-panel border border-white/5 hover:border-primary/20 transition-all group"
  >
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
      <Icon size={24} className="text-white/60 group-hover:text-primary transition-colors" />
    </div>
    <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-white/40 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

function LandingPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const handleCreate = (username: string) => {
    const roomId = crypto.randomUUID().slice(0, 8);
    navigate(`/board/${roomId}?username=${encodeURIComponent(username)}&action=create`);
  };

  const handleJoin = (roomId: string, username: string) => {
    navigate(`/board/${roomId}?username=${encodeURIComponent(username)}&action=join`);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-x-hidden selection:bg-primary/30 text-white font-['Inter']">
      <LiquidCursor />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase italic">C-BOARD</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/40">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="https://github.com" className="hover:text-white transition-colors flex items-center gap-2">
            <Github size={14} /> GitHub
          </a>
        </div>

        <button 
          onClick={() => setShowJoin(true)}
          className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Join Room
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Sparkles size={12} />
              Real-time collaboration redefined
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
              Think, draw, and <br /> 
              <span className="bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent italic">create together.</span>
            </h1>
            
            <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              The ultimate collaborative whiteboard for high-performance teams. 
              Zero lag, infinite canvas, and simple sharing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreate(true)}
                className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#0a0a0a] text-sm font-black rounded-2xl shadow-2xl shadow-white/10 hover:shadow-primary/20 transition-all"
              >
                Start for Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <button
                onClick={() => setShowJoin(true)}
                className="px-10 py-5 text-white/60 hover:text-white text-sm font-bold transition-colors"
              >
                Have a room ID? Join here
              </button>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Built for speed.</h2>
          <p className="text-white/40 text-lg">Everything you need to brainstorm effectively.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Zap}
            title="Ultra-low Latency"
            description="Experience seamless drawing with zero lag. Our custom WebSocket engine keeps every stroke in sync instantly."
          />
          <FeatureCard 
            icon={Users}
            title="Unlimited Collaborators"
            description="Bring your whole team. C-Board handles dozens of simultaneous editors without breaking a sweat."
          />
          <FeatureCard 
            icon={Layers}
            title="Clean Architecture"
            description="A focused UI that stays out of your way. Every tool is right where you expect it to be."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-sm uppercase">C-BOARD</span>
          </div>
          <div className="text-white/20 text-xs font-medium uppercase tracking-[0.2em]">
            © 2026 C-Board Labs. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-white/40">
             <Github size={20} className="hover:text-white cursor-pointer transition-colors" />
             <div className="w-px h-4 bg-white/10" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Privacy</span>
             <span className="text-[10px] font-bold uppercase tracking-widest">Terms</span>
          </div>
        </div>
      </footer>

      <CreateRoomModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      <JoinRoomModal isOpen={showJoin} onClose={() => setShowJoin(false)} onJoin={handleJoin} />
    </div>
  );
}

export default LandingPage;


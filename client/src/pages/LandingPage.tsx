import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import Globe from "../components/ui/globe";
import { cn } from "../lib/utils";
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';
import { LiquidCursor } from '../components/LiquidCursor';
import { Zap, Github } from 'lucide-react';

interface ScrollGlobeProps {
  sections: {
    id: string;
    badge?: string;
    title: string;
    subtitle?: string;
    description: string;
    align?: 'left' | 'center' | 'right';
    features?: { title: string; description: string }[];
    actions?: { label: string; variant: 'primary' | 'secondary'; onClick?: () => void }[];
  }[];
  globeConfig?: {
    positions: {
      top: string;
      left: string;
      scale: number;
    }[];
  };
  className?: string;
}

const defaultGlobeConfig = {
  positions: [
    { top: "50%", left: "75%", scale: 1.4 },  // Hero
    { top: "25%", left: "50%", scale: 0.9 },  // Speed
    { top: "15%", left: "90%", scale: 2 },    // Collab
    { top: "50%", left: "50%", scale: 1.8 },  // End
  ]
};

const parsePercent = (str: string): number => parseFloat(str.replace('%', ''));

function ScrollGlobe({ sections, globeConfig = defaultGlobeConfig, className }: ScrollGlobeProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [globeTransform, setGlobeTransform] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameId = useRef<number>();
  
  const calculatedPositions = useMemo(() => {
    return globeConfig.positions.map(pos => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale
    }));
  }, [globeConfig.positions]);

  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    setScrollProgress(progress);

    const viewportCenter = window.innerHeight / 2;
    let newActiveSection = 0;
    let minDistance = Infinity;

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          newActiveSection = index;
        }
      }
    });

    const currentPos = calculatedPositions[newActiveSection];
    const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;
    setGlobeTransform(transform);
    setActiveSection(newActiveSection);
  }, [calculatedPositions, activeSection]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollPosition();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [updateScrollPosition]);

  useEffect(() => {
    const initialPos = calculatedPositions[0];
    const initialTransform = `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`;
    setGlobeTransform(initialTransform);
  }, [calculatedPositions]);

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-[100vw] overflow-x-hidden", className)}>
      <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-border/20 via-border/40 to-border/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary via-blue-600 to-blue-900 will-change-transform"
          style={{ transform: `scaleX(${scrollProgress})`, transformOrigin: 'left center' }}
        />
      </div>

      <div className="hidden sm:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="relative group">
              <button
                onClick={() => sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className={cn(
                  "relative w-3 h-3 rounded-full border-2 transition-all duration-300 hover:scale-125",
                  activeSection === index ? "bg-primary border-primary shadow-lg" : "bg-transparent border-white/20 hover:border-primary/60"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="fixed z-10 pointer-events-none will-change-transform transition-all duration-[1400ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: globeTransform, filter: `opacity(${activeSection === 3 ? 0.3 : 0.6})` }}
      >
        <Globe className="w-[600px] h-[600px]" />
      </div>

      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(el) => (sectionRefs.current[index] = el)}
          className={cn(
            "relative min-h-screen flex flex-col justify-center px-6 lg:px-12 z-20 py-20",
            section.align === 'center' && "items-center text-center",
            section.align === 'right' && "items-end text-right",
            (!section.align || section.align === 'left') && "items-start text-left"
          )}
        >
          <div className="w-full max-w-4xl will-change-transform transition-all duration-700">
            <h1 className={cn("font-black tracking-tight mb-8 leading-[1.1]", index === 0 ? "text-6xl md:text-8xl" : "text-4xl md:text-6xl")}>
              {section.subtitle ? (
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{section.title}</div>
                  <div className="text-primary italic text-[0.6em]">{section.subtitle}</div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{section.title}</div>
              )}
            </h1>
            
            <p className={cn("text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed mb-10", section.align === 'center' && "mx-auto")}>
              {section.description}
            </p>

            {section.features && (
              <div className="grid gap-4 mb-10">
                {section.features.map((feature) => (
                  <div key={feature.title} className="p-6 rounded-2xl glass-panel border border-white/5 hover:border-primary/20 transition-all group">
                    <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                    <p className="text-white/40">{feature.description}</p>
                  </div>
                ))}
              </div>
            )}

            {section.actions && (
              <div className={cn("flex flex-wrap gap-4", section.align === 'center' && "justify-center")}>
                {section.actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={cn(
                      "px-8 py-4 rounded-xl font-black transition-all hover:scale-[1.02]",
                      action.variant === 'primary' 
                        ? "bg-white text-black shadow-lg shadow-white/10 hover:shadow-primary/20" 
                        : "border-2 border-white/10 text-white hover:bg-white/5"
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function LandingPage() {
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

  const sections = [
    {
      id: "hero",
      title: "Think, draw, and",
      subtitle: "create together.",
      description: "The ultimate collaborative whiteboard for high-performance teams. Zero lag, infinite canvas, and simple sharing.",
      align: "left" as const,
      actions: [
        { label: "Start for Free", variant: "primary" as const, onClick: () => setShowCreate(true) },
        { label: "Join Room", variant: "secondary" as const, onClick: () => setShowJoin(true) },
      ]
    },
    {
      id: "speed",
      title: "Built for speed",
      subtitle: "Zero Latency",
      description: "Experience seamless drawing with zero lag. Our custom WebSocket engine keeps every stroke in sync instantly across the globe.",
      align: "center" as const,
    },
    {
      id: "collab",
      title: "Unlimited",
      subtitle: "Collaborators",
      description: "Bring your whole team. C-Board handles dozens of simultaneous editors without breaking a sweat. See exactly what everyone is doing in real-time.",
      align: "left" as const,
      features: [
        { title: "Real-time presence", description: "Live cursors and active participant tracking." },
        { title: "Conflict-free editing", description: "Smooth state synchronization across all clients." }
      ]
    },
    {
      id: "end",
      title: "Ready to",
      subtitle: "Brainstorm?",
      description: "Join thousands of teams who have transformed their remote collaboration with C-Board.",
      align: "center" as const,
      actions: [
        { label: "Create a Workspace", variant: "primary" as const, onClick: () => setShowCreate(true) }
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white font-['Inter']">
      <LiquidCursor />
      
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase italic">C-BOARD</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/40">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="https://github.com" className="hover:text-white transition-colors flex items-center gap-2">
            <Github size={14} /> GitHub
          </a>
        </div>
        <button onClick={() => setShowJoin(true)} className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          Join Room
        </button>
      </nav>

      <ScrollGlobe sections={sections} />

      <CreateRoomModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      <JoinRoomModal isOpen={showJoin} onClose={() => setShowJoin(false)} onJoin={handleJoin} />
    </div>
  );
}


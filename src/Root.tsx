import React, { useState } from 'react';
import App from './App';
import ESPCPDashboard from './ESPCPDashboard';
import ESPCPRework from './ESPCPRework';
import { motion, AnimatePresence } from 'motion/react';
import { Database, MonitorPlay, Car } from 'lucide-react';
import { ApeiroLogo } from './components/ApeiroLogo';

export default function Root() {
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  if (currentProject === 'espcp') {
    return (
      <div className="relative w-full min-h-screen">
        <ESPCPDashboard setCurrentProject={setCurrentProject} />
        <button 
          onClick={() => setCurrentProject(null)}
          className="fixed bottom-8 right-8 z-50 bg-black/80 text-cyan-400 border border-cyan-500 rounded-full px-6 py-3 hover:bg-cyan-500/20 hover:scale-105 transition-all font-mono font-bold shadow-[0_0_20px_rgba(0,255,255,0.4)]"
        >
          ⏏ HUB
        </button>
      </div>
    );
  }

  if (currentProject === 'espcp_rework') {
    return <ESPCPRework setCurrentProject={setCurrentProject} />;
  }

  if (currentProject === 'biorxiv') {
    return (
      <div className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.1),black)] pointer-events-none"></div>
        <div className="mb-12 w-full max-w-2xl px-4 z-20">
          <ApeiroLogo />
        </div>
        <div className="relative z-10 w-full overflow-hidden border-y-2 border-blue-500/50 bg-blue-900/20 py-4 shadow-[0_0_30px_rgba(0,102,255,0.3)]">
          <div className="animate-[scrollLeft_10s_linear_infinite] whitespace-nowrap text-blue-400 font-mono text-2xl md:text-5xl font-bold tracking-[0.2em]">
            SYSTEM STANDBY // PRODUCTION NOT STARTED // AWAITING DATA INJECTION // SYSTEM STANDBY // PRODUCTION NOT STARTED // AWAITING DATA INJECTION //
          </div>
        </div>
        <button 
          onClick={() => setCurrentProject(null)}
          className="fixed bottom-8 right-8 z-50 bg-[#0a0f1c]/90 text-blue-400 border border-blue-500 rounded-full px-6 py-3 hover:bg-blue-500/20 hover:scale-105 transition-all font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] tracking-widest font-['Orbitron']"
        >
          ⏏ HUB
        </button>
        <style>{`
          @keyframes scrollLeft {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    );
  }

  if (currentProject === 'bookcar') {
    return (
      <div className="relative w-full min-h-screen">
        <App />
        <button 
          onClick={() => setCurrentProject(null)}
          className="fixed bottom-8 right-8 z-50 bg-[#0a0f1c]/90 text-blue-400 border border-blue-500 rounded-full px-6 py-3 hover:bg-blue-500/20 hover:scale-105 transition-all font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] tracking-widest font-['Orbitron']"
        >
          ⏏ HUB
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Cool animated background for the nexus hub */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-black to-black border-none"></div>
        <div className="w-full h-full bg-[linear-gradient(rgba(0,100,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-4xl w-full"
      >
        <div className="mb-12 w-full max-w-2xl px-4 z-20 mx-auto">
          <ApeiroLogo />
        </div>
        <div className="mb-16 h-32 flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.h1 
              key="mystique"
              initial={{ filter: 'blur(10px)', opacity: 0, scale: 0.95 }}
              animate={{ filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(10px)'], opacity: [0, 1, 1, 0], scale: [0.95, 1, 1, 1.05] }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-3xl md:text-5xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-['Orbitron',sans-serif]"
            >
              ELSEVIER PRODUCTION HUB
            </motion.h1>
          </AnimatePresence>
          <div className="h-16"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 242, 255, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentProject('espcp')}
            className="flex flex-col items-center justify-center p-10 bg-slate-900/50 border border-cyan-500/50 rounded-lg backdrop-blur-sm group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan-500/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <MonitorPlay className="w-16 h-16 text-cyan-400 mb-6 group-hover:text-white transition-colors z-10" />
            <span className="text-2xl font-bold text-cyan-400 font-['Rajdhani'] tracking-widest z-10">ESPCP</span>
            <span className="text-xs text-cyan-500 mt-2 font-mono z-10">PRODUCTION SUMMARY</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentProject('bookcar')}
            className="flex flex-col items-center justify-center p-10 bg-slate-900/50 border border-purple-500/50 rounded-lg backdrop-blur-sm group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-purple-500/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Car className="w-16 h-16 text-purple-400 mb-6 group-hover:text-white transition-colors z-10" />
            <span className="text-2xl font-bold text-purple-400 font-['Rajdhani'] tracking-widest z-10">BOOKCAR</span>
            <span className="text-xs text-purple-500 mt-2 font-mono z-10">DATA INTERFACE</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentProject('biorxiv')}
            className="flex flex-col items-center justify-center p-10 bg-slate-900/50 border border-blue-500/50 rounded-lg backdrop-blur-sm group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Database className="w-16 h-16 text-blue-400 mb-6 group-hover:text-white transition-colors z-10" />
            <span className="text-2xl font-bold text-blue-400 font-['Rajdhani'] tracking-widest z-10">BIORXIV</span>
            <span className="text-xs text-blue-500 mt-2 font-mono z-10">ANALYTICS SYSTEM</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 0, 102, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentProject('espcp_rework')}
            className="flex flex-col items-center justify-center p-10 bg-slate-900/50 border border-[#ff0066]/50 rounded-lg backdrop-blur-sm group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#ff0066]/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <MonitorPlay className="w-16 h-16 text-[#ff0066] mb-6 group-hover:text-white transition-colors z-10" />
            <span className="text-2xl font-bold text-[#ff0066] font-['Rajdhani'] tracking-widest z-10">ESPCP REWORK</span>
            <span className="text-xs text-[#ff0066] mt-2 font-mono z-10">SHEET ACCESS / AUTH</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

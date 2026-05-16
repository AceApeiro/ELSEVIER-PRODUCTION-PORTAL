import React, { useEffect, useRef, useState } from 'react';

export function ApeiroLogo() {
  const matrixRef = useRef<HTMLDivElement>(null);
  const [showingFirst, setShowingFirst] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  useEffect(() => {
    const matrixContainer = matrixRef.current;
    if (!matrixContainer) return;

    const letters = ['A', 'P', 'E', 'I', 'R', 'O'];
    let matrixInterval: NodeJS.Timeout;

    function createDrop() {
      if (!matrixContainer) return;
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = Math.random() * 100 + '%';
      
      // VARY SPEED: from 1.5s to 5.5s
      drop.style.animationDuration = (Math.random() * 4 + 1.5) + 's';
      drop.style.animationDelay = Math.random() * 1.5 + 's';
      drop.style.fontSize = (Math.random() * 10 + 10) + 'px';
      drop.style.fontWeight = '700';
      
      // VARY COLOR
      const colors = ['#0099ff', '#00ffcc', '#b026ff', '#ffffff', '#4da6ff', '#80bfff'];
      drop.style.color = colors[Math.floor(Math.random() * colors.length)];

      let i = Math.floor(Math.random() * letters.length);
      drop.textContent = letters[i];

      const morph = setInterval(() => {
        i = (i + 1) % letters.length;
        if (drop.parentNode) drop.textContent = letters[i];
        else clearInterval(morph);
      }, 300);

      matrixContainer.appendChild(drop);

      setTimeout(() => {
        clearInterval(morph);
        if (drop.parentNode) drop.parentNode.removeChild(drop);
      }, 5200);
    }

    for (let i = 0; i < 24; i++) {
      setTimeout(createDrop, i * 130);
    }
    matrixInterval = setInterval(createDrop, 250);

    return () => {
      clearInterval(matrixInterval);
      if (matrixContainer) {
        matrixContainer.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const morphInterval = setInterval(() => {
      setShowingFirst(prev => !prev);
    }, 3000);
    return () => clearInterval(morphInterval);
  }, []);

  return (
    <div 
      className="relative w-full h-[350px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center shadow-2xl border border-slate-800/50"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
        
        .rain-drop {
          position: absolute;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          opacity: 0.85;
          animation: fall linear infinite;
          pointer-events: none;
          will-change: transform, opacity;
        }
        @keyframes fall {
          0% { transform: translateY(-50px); opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
        .embed-circle {
          width: 128px;
          height: 128px;
          position: relative;
          display: block;
          border-radius: 50%;
          clip-path: circle(50% at 50% 50%);
          -webkit-clip-path: circle(50% at 50% 50%);
          box-sizing: border-box;
          border: 2px solid #ffffff;
          filter: drop-shadow(0 0 20px #0099ff);
          box-shadow: 0 0 15px #ffffff, 0 0 30px #ffffff, inset 0 0 15px rgba(255,255,255,0.06);
          background: radial-gradient(circle at center, rgba(0,153,255,0.06), rgba(0,0,0,0.6));
          animation: borderGlisten 3s ease-in-out infinite;
          backdrop-filter: blur(0.5px);
        }
        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 144px;
          height: 144px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          opacity: 0;
          animation: pulse 3s ease-out infinite;
          z-index: 4;
          box-shadow: 0 0 10px #ffffff;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1.45); opacity: 0; }
        }
        @keyframes borderGlisten {
          0%, 100% { box-shadow: 0 0 15px #ffffff, 0 0 30px #ffffff, inset 0 0 15px rgba(255,255,255,0.06); border-color: #ffffff; }
          50% { box-shadow: 0 0 25px #ffffff, 0 0 50px #ffffff, 0 0 75px rgba(255,255,255,0.12), inset 0 0 25px rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.9); }
        }
        .company-name {
          animation: glow 2s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from { text-shadow: 0 0 10px #0099ff, 0 0 20px #0099ff; }
          to { text-shadow: 0 0 18px #0099ff, 0 0 36px #0099ff; }
        }
      `}</style>
      
      <div 
        ref={matrixRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden transition-transform duration-200 ease-out"
        style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) scale(1.1)` }}
      />

      <div 
        className="relative z-30 flex flex-col items-center gap-4 transition-transform duration-200 ease-out"
        style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
      >
        <div className="relative">
          <div className="pulse-ring" aria-hidden="true"></div>
          <div className="embed-circle" aria-hidden="true">
            <div className="w-full h-full p-2.5 box-border relative overflow-visible">
              {/* Logo 1 */}
              <svg 
                className="absolute inset-0 w-full h-full block transition-all duration-1000 ease-in-out origin-center pointer-events-none"
                style={{ opacity: showingFirst ? 1 : 0, transform: showingFirst ? 'scale(1)' : 'scale(0.92)' }}
                viewBox="0 0 120 120" 
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="gradA1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0099ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="46" fill="none" stroke="url(#gradA1)" strokeWidth="3"/>
                <text x="60" y="73" textAnchor="middle" fill="url(#gradA1)" fontFamily="Orbitron, sans-serif" fontSize="34" fontWeight="700">A</text>
                <polygon points="60,26 78,44 42,44" fill="url(#gradA1)" opacity="0.85" />
                <rect x="47" y="78" width="26" height="12" fill="url(#gradA1)" opacity="0.6" rx="2" />
              </svg>

              {/* Logo 2 */}
              <svg 
                className="absolute inset-0 w-full h-full block transition-all duration-1000 ease-in-out origin-center pointer-events-none"
                style={{ opacity: showingFirst ? 0 : 1, transform: showingFirst ? 'scale(0.92)' : 'scale(1)' }}
                viewBox="0 0 120 120" 
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="gradB2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0099ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path d="M60 12 L90 40 L90 84 L60 108 L30 84 L30 40 Z" fill="none" stroke="url(#gradB2)" strokeWidth="3" />
                <circle cx="60" cy="44" r="12" fill="url(#gradB2)" />
                <path d="M46 66 Q60 76 74 66" stroke="url(#gradB2)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                <rect x="52" y="82" width="16" height="8" fill="url(#gradB2)" opacity="0.75" rx="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center z-50 mt-2">
          <h1 className="company-name text-[#0099ff] text-3xl md:text-4xl font-bold m-0 tracking-[3px] font-['Orbitron',sans-serif]">APEIRO</h1>
          <p className="text-[#0099ff] text-sm md:text-base mt-1.5 opacity-95 tracking-[2px] font-['Courier_New',monospace]">Endless Opportunity</p>
        </div>
      </div>
    </div>
  );
}

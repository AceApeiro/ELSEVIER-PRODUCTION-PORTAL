import React, { useEffect, useRef } from 'react';

export function BeeSwarm({ isEnabled }: { isEnabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isEnabled || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      targetX: number;
      targetY: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 1;
        this.targetX = canvas.width / 2;
        this.targetY = canvas.height / 2;
      }

      update() {
        // Swarm logic (attract to center + randomness)
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        // Randomly change target slightly
        if (Math.random() < 0.05) {
            this.targetX = canvas.width / 2 + (Math.random() - 0.5) * 500;
            this.targetY = canvas.height / 2 + (Math.random() - 0.5) * 500;
        }

        this.vx += dx * 0.0001 + (Math.random() - 0.5) * 0.2;
        this.vy += dy * 0.0001 + (Math.random() - 0.5) * 0.2;

        // Friction/speed limit
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(255, 204, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail effect
        ctx.strokeStyle = 'rgba(255, 204, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 5, this.y - this.vy * 5);
        ctx.stroke();
      }
    }

    for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
    }

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
}

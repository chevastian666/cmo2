import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ParticleTrailProps {
  x: number;
  y: number;
  isMoving: boolean;
  speed: number;
  status: 'normal' | 'alert' | 'critical';
  className?: string;
}

const statusColors = {
  normal: 'rgba(34, 197, 94, ',
  alert: 'rgba(251, 191, 36, ',
  critical: 'rgba(239, 68, 68, '
};

export const ParticleTrail: React.FC<ParticleTrailProps> = ({
  x,
  y,
  isMoving,
  speed,
  status,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const prevPosRef = useRef({ x, y });

  const createParticle = useCallback((x: number, y: number) => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 2 + 1;
    const life = 60 + Math.random() * 40; // 1-1.5 seconds at 60fps
    
    return {
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life,
      maxLife: life,
      size: Math.random() * 3 + 2,
      color: statusColors[status]
    };
  }, [status]);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      if (particle.life <= 0) return false;

      const opacity = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color + opacity + ')';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * opacity, 0, Math.PI * 2);
      ctx.fill();

      return true;
    });

    // Add new particles if moving
    if (isMoving && particlesRef.current.length < 50) {
      const dx = x - prevPosRef.current.x;
      const dy = y - prevPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 2) {
        // Interpolate particles along the movement line
        const steps = Math.min(Math.floor(distance / 5), 5);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const px = prevPosRef.current.x + dx * t;
          const py = prevPosRef.current.y + dy * t;
          particlesRef.current.push(createParticle(px, py));
        }
        prevPosRef.current = { x, y };
      }
    }

    animationRef.current = requestAnimationFrame(updateParticles);
  }, [x, y, isMoving, createParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Start animation loop
    updateParticles();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'fixed inset-0 pointer-events-none z-10',
        className
      )}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
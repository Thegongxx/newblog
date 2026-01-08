import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
}

const SubtleAura: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0, active: false });
    const particles = useRef<Particle[]>([]);
    const animationFrameId = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const init = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            ctx.scale(dpr, dpr);

            particles.current = [];
            const count = 70; // 极少数粒子，杜绝臃肿感
            for (let i = 0; i < count; i++) {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                particles.current.push({
                    x,
                    y,
                    originX: x,
                    originY: y,
                    vx: 0,
                    vy: 0
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            mouse.current.active = true;
        };

        const handleResize = () => {
            init();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        init();

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            const mx = mouse.current.x;
            const my = mouse.current.y;
            const radius = 250; // 稍微扩大范围
            const friction = 0.94; // 极致丝滑
            const ease = 0.04;

            particles.current.forEach(p => {
                if (mouse.current.active) {
                    const dx = mx - p.x;
                    const dy = my - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < radius) {
                        // 力度微增，但依然保持细腻
                        const force = (radius - distance) / radius;
                        const angle = Math.atan2(dy, dx);
                        p.vx -= Math.cos(angle) * force * 1.2;
                        p.vy -= Math.sin(angle) * force * 1.2;
                    }
                }

                // 回弹
                p.vx += (p.originX - p.x) * ease;
                p.vy += (p.originY - p.y) * ease;

                p.vx *= friction;
                p.vy *= friction;
                p.x += p.vx;
                p.y += p.vy;

                // 提升粒子表现：带有一点点发光感
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + speed * 2})`;

                ctx.beginPath();
                // 增大粒子以便肉眼可见
                ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default SubtleAura;

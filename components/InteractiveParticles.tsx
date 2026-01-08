import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    size: number;
}

const InteractiveParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0, active: false });
    const particles = useRef<Particle[]>([]);
    const animationFrameId = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const init = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            // 生成粒子格子
            particles.current = [];
            const spacing = 28; // 粒子间距
            const cols = Math.ceil(window.innerWidth / spacing);
            const rows = Math.ceil(window.innerHeight / spacing);

            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j <= rows; j++) {
                    const x = i * spacing + (Math.random() - 0.5) * 5;
                    const y = j * spacing + (Math.random() - 0.5) * 5;
                    particles.current.push({
                        x,
                        y,
                        originX: x,
                        originY: y,
                        vx: 0,
                        vy: 0,
                        size: Math.random() * 1.5 + 0.5
                    });
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            mouse.current.active = true;
        };

        const handleMouseLeave = () => {
            mouse.current.active = false;
        };

        const handleResize = () => {
            init();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize);
        init();

        const render = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            const mouseActive = mouse.current.active;
            const mx = mouse.current.x;
            const my = mouse.current.y;
            const radius = 180; // 增大影响半径使其更明显
            const friction = 0.88; // 稍微增加摩擦力使其更紧致
            const ease = 0.12; // 调整回弹系数

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // 显著提升粒子亮度

            for (let i = 0; i < particles.current.length; i++) {
                const p = particles.current[i];

                // 物理逻辑
                if (mouseActive) {
                    const dx = mx - p.x;
                    const dy = my - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < radius) {
                        // 改进算法：提供更强的磁力感
                        const force = (radius - distance) / radius;
                        const angle = Math.atan2(dy, dx);
                        const moveX = Math.cos(angle) * force * 20;
                        const moveY = Math.sin(angle) * force * 20;

                        p.vx -= moveX;
                        p.vy -= moveY;
                    }
                }

                // 回弹力 (Spring Physics)
                p.vx += (p.originX - p.x) * ease;
                p.vy += (p.originY - p.y) * ease;

                // 应用摩擦力并更新坐标
                p.vx *= friction;
                p.vy *= friction;
                p.x += p.vx;
                p.y += p.vy;

                // 绘制 (根据速度调整大小，产生动态感)
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const dynamicSize = p.size + speed * 0.8;

                ctx.beginPath();
                // 增加发光感：根据距离调整亮度
                ctx.arc(p.x, p.y, dynamicSize, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[0] pointer-events-none"
            style={{ opacity: 0.6 }}
        />
    );
};

export default InteractiveParticles;

import React, { useEffect, useRef } from 'react';

interface Blob {
    x: number;
    y: number;
    sx: number; // 当前平滑平滑位置
    sy: number;
    radius: number;
    color: string;
    lerp: number; // 惯性系数 (0.01 - 0.1)
}

const FluidAura: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const blobs = useRef<Blob[]>([]);
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
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            // 初始化 4 个具有不同特性的流体光团
            blobs.current = [
                { x: 0, y: 0, sx: 0, sy: 0, radius: 500, color: 'rgba(56, 189, 248, 0.15)', lerp: 0.04 }, // Blue
                { x: 0, y: 0, sx: 0, sy: 0, radius: 400, color: 'rgba(255, 255, 255, 0.08)', lerp: 0.02 }, // White
                { x: 0, y: 0, sx: 0, sy: 0, radius: 600, color: 'rgba(139, 92, 246, 0.12)', lerp: 0.015 }, // Purple
                { x: 0, y: 0, sx: 0, sy: 0, radius: 450, color: 'rgba(244, 114, 182, 0.10)', lerp: 0.03 }, // Pink
            ];

            // 给光团一个初始的中心位置
            mouse.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            blobs.current.forEach(b => {
                b.sx = b.x = mouse.current.x;
                b.sy = b.y = mouse.current.y;
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        const handleResize = () => {
            init();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        init();

        const render = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // 我们在背景铺一层极淡的底色，增加质感
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            blobs.current.forEach(b => {
                // 目标：让光团平滑追踪鼠标
                b.x += (mouse.current.x - b.x) * b.lerp;
                b.y += (mouse.current.y - b.y) * b.lerp;

                // 绘制径向渐变，形成超大羽化效果
                const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
                gradient.addColorStop(0, b.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = gradient;
                ctx.globalCompositeOperation = 'screen';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
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
        />
    );
};

export default FluidAura;

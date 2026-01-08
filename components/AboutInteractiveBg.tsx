import React, { useEffect, useRef } from 'react';

const AboutInteractiveBg: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

    // 坐标系统：目标位置(鼠标)与当前位置(平滑后)
    const mouse = useRef({ x: 0, y: 0 });
    const smoothed = useRef([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', handleMouseMove);

        let frameId: number;
        const animate = () => {
            // 对每个 Blob 应用不同的插值因子，产生层次感(惯性延迟)
            const factors = [0.08, 0.05, 0.03];

            smoothed.current.forEach((pos, i) => {
                pos.x += (mouse.current.x - pos.x) * factors[i];
                pos.y += (mouse.current.y - pos.y) * factors[i];

                if (blobRefs[i].current) {
                    blobRefs[i].current!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
                }
            });

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
            {/* Blob 1: Soft Blue */}
            <div
                ref={blobRefs[0]}
                className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen"
            />
            {/* Blob 2: Warm White */}
            <div
                ref={blobRefs[1]}
                className="absolute w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] mix-blend-overlay"
            />
            {/* Blob 3: Deep Aura (Trailing) */}
            <div
                ref={blobRefs[2]}
                className="absolute w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px] mix-blend-plus-lighter"
            />

            {/* 噪点纹理层，提升质感 */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        </div>
    );
};

export default AboutInteractiveBg;

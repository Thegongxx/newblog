import React from 'react';
import { Helmet } from 'react-helmet-async';

const About: React.FC = () => {
    return (
        <div className="max-w-3xl py-12 relative min-h-[600px]">
            <Helmet>
                <title>About | Aura</title>
            </Helmet>
            <div className="relative z-10">
                <h2 className="text-7xl font-bold tracking-tighter mb-10">关于我.</h2>
                <p className="text-2xl text-white/60 leading-relaxed font-light mb-16">
                    Aura 是一个极简主义的数字避风港，在这里美学与智能相遇。我们旨在重新探讨极简美学与人工智能之间的和谐共生。
                </p>
                <div className="h-[1px] w-full bg-white/10 mb-16" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div>
                        <h4 className="text-xs uppercase tracking-[0.3em] text-white/20 mb-6 font-bold">设计理念</h4>
                        <p className="text-white/60 font-light leading-relaxed">追求空间感、诗意以及克制的智能交互。每一像素都经过深思熟虑。</p>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-[0.3em] text-white/20 mb-6 font-bold">底层驱动</h4>
                        <p className="text-white/60 font-light leading-relaxed">Powered by Gemini 3 Flash Pro. 为内容探索提供深度见解。</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

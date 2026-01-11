import React from 'react';
import { motion } from 'framer-motion';
import { 
  MagneticButton, 
  RippleButton, 
  GlowHover, 
  TiltCard, 
  FloatingCursor, 
  ParticleExplosion,
  BreathingGlow 
} from './HoverEffects';

const HoverShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-white text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          🎨 悬停效果展示
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. 磁性按钮 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-white font-semibold mb-4">磁性按钮</h3>
            <MagneticButton 
              className="w-full bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl py-3 px-6 font-medium"
              strength={0.4}
            >
              跟随鼠标移动
            </MagneticButton>
          </motion.div>

          {/* 2. 涟漪效果 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white font-semibold mb-4">涟漪点击</h3>
            <RippleButton 
              className="w-full bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl py-3 px-6 font-medium"
              rippleColor="rgba(34, 197, 94, 0.4)"
            >
              点击看涟漪
            </RippleButton>
          </motion.div>

          {/* 3. 光晕效果 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-4">光晕悬停</h3>
            <GlowHover 
              className="w-full bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl py-3 px-6 font-medium text-center"
              glowColor="#a855f7"
              intensity={0.3}
            >
              悬停看光晕
            </GlowHover>
          </motion.div>

          {/* 4. 3D 倾斜卡片 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-white font-semibold mb-4">3D 倾斜</h3>
            <TiltCard 
              className="w-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/30 rounded-xl py-8 px-6 text-center"
              maxTilt={20}
            >
              <div className="font-medium">3D 倾斜卡片</div>
              <div className="text-sm opacity-70 mt-2">移动鼠标看效果</div>
            </TiltCard>
          </motion.div>

          {/* 5. 浮动光标 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-white font-semibold mb-4">自定义光标</h3>
            <FloatingCursor 
              className="w-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-xl py-8 px-6 text-center"
              cursorText="✨ 点我"
            >
              <div className="font-medium">悬停看光标</div>
              <div className="text-sm opacity-70 mt-2">光标会变成自定义样式</div>
            </FloatingCursor>
          </motion.div>

          {/* 6. 粒子爆炸 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-white font-semibold mb-4">粒子爆炸</h3>
            <ParticleExplosion 
              className="w-full bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl py-8 px-6 text-center cursor-pointer"
              particleCount={25}
              colors={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']}
            >
              <div className="font-medium">点击爆炸</div>
              <div className="text-sm opacity-70 mt-2">点击看粒子效果</div>
            </ParticleExplosion>
          </motion.div>

          {/* 7. CSS 效果展示 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-white font-semibold mb-4">CSS 特效</h3>
            <div className="space-y-3">
              <div className="magnetic-hover bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg py-2 px-4 text-sm text-center">
                磁性悬停
              </div>
              <div className="liquid-morph bg-teal-500/20 text-teal-300 border border-teal-500/30 py-2 px-4 text-sm text-center">
                液体变形
              </div>
            </div>
          </motion.div>

          {/* 8. 呼吸光效 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-white font-semibold mb-4">呼吸光效</h3>
            <BreathingGlow 
              className="w-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl py-8 px-6 text-center"
              glowColor="#06b6d4"
              duration={3}
            >
              <div className="font-medium">呼吸光晕</div>
              <div className="text-sm opacity-70 mt-2">自动呼吸效果</div>
            </BreathingGlow>
          </motion.div>

          {/* 9. 更多 CSS 效果 */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
          >
            <h3 className="text-white font-semibold mb-4">更多效果</h3>
            <div className="space-y-3">
              <div className="floating-shadow bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg py-2 px-4 text-sm text-center">
                浮动阴影
              </div>
              <div className="elastic-scale bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg py-2 px-4 text-sm text-center">
                弹性缩放
              </div>
              <div className="water-ripple bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg py-2 px-4 text-sm text-center">
                水波纹
              </div>
            </div>
          </motion.div>

        </div>

        {/* 使用说明 */}
        <motion.div 
          className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">🚀 如何使用</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
            <div>
              <h3 className="font-semibold text-white mb-3">React 组件</h3>
              <pre className="bg-black/30 rounded-lg p-4 text-sm overflow-x-auto">
{`import { MagneticButton } from './components/HoverEffects';

<MagneticButton 
  className="your-styles"
  strength={0.3}
>
  按钮文字
</MagneticButton>`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">CSS 类名</h3>
              <pre className="bg-black/30 rounded-lg p-4 text-sm overflow-x-auto">
{`<div className="magnetic-hover">磁性悬停</div>
<div className="liquid-morph">液体变形</div>
<div className="floating-shadow">浮动阴影</div>
<div className="elastic-scale">弹性缩放</div>`}
              </pre>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HoverShowcase;
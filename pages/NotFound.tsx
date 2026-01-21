import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>404 - 页面未找到 | Xuan</title>
                <meta name="description" content="抱歉，您访问的页面不存在" />
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
            >
                {/* 404 数字 */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="relative mb-8"
                >
                    <span className="text-[120px] md:text-[200px] font-black tracking-tighter text-white/5 select-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl md:text-6xl font-bold text-white/80">
                            Oops!
                        </span>
                    </div>
                </motion.div>

                {/* 提示文字 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="space-y-4 mb-12"
                >
                    <h1 className="text-xl md:text-2xl font-bold text-white/90">
                        页面迷路了
                    </h1>
                    <p className="text-sm md:text-base text-white/50 max-w-md">
                        你访问的页面似乎不存在，可能已被移动或删除。
                        <br />
                        不如回到首页，探索更多内容？
                    </p>
                </motion.div>

                {/* 操作按钮 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        返回首页
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        返回上页
                    </button>
                </motion.div>

                {/* 装饰元素 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                >
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl" />
                </motion.div>
            </motion.div>
        </>
    );
}

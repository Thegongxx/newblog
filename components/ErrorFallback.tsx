import { motion } from 'framer-motion';

interface Props {
  error: Error | null;
  onRetry?: () => void;
}

export default function ErrorFallback({ error, onRetry }: Props) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div 
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">出了点问题</h2>
        <p className="text-white/60 text-sm mb-6">
          {error?.message || '页面加载时发生错误，请稍后重试'}
        </p>
        
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors"
            >
              重试
            </button>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-full text-sm font-medium transition-colors"
          >
            返回首页
          </button>
        </div>
      </motion.div>
    </div>
  );
}

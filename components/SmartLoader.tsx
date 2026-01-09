import React, { useEffect, useState } from 'react';

interface SmartLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  delay?: number;
}

const SmartLoader: React.FC<SmartLoaderProps> = ({ 
  loading, 
  children, 
  skeleton,
  delay = 300 
}) => {
  const [showLoader, setShowLoader] = useState(false);
  const [showContent, setShowContent] = useState(!loading);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoader(true), delay);
      setShowContent(false);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
      setTimeout(() => setShowContent(true), 50);
    }
  }, [loading, delay]);

  if (loading && showLoader) {
    return skeleton || <DefaultSkeleton />;
  }

  return (
    <div className={`transition-all duration-700 ease-out ${
      showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}>
      {children}
    </div>
  );
};

const DefaultSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="glass p-8 rounded-[2.5rem]">
        <div className="h-4 w-24 bg-white/5 rounded mb-4" />
        <div className="h-8 w-3/4 bg-white/5 rounded mb-6" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-5/6 bg-white/5 rounded" />
          <div className="h-3 w-4/6 bg-white/5 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default SmartLoader;
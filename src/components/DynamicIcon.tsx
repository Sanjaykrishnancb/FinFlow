import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { 
  BarChart2, 
  CalendarDays, 
  Wallet, 
  Target, 
  Settings, 
  Hourglass, 
  Sparkles, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  Bell, 
  Clock 
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  '1f4ca': BarChart2,
  '1f4c5': CalendarDays,
  '1f4b8': Wallet,
  '1f3af': Target,
  '2699': Settings,
  '231b': Hourglass,
  '2728': Sparkles,
  '270f': Pencil,
  '1f5d1': Trash2,
  '26a0': AlertTriangle,
  '1f4c8': TrendingUp,
  '1f514': Bell,
  '23f0': Clock
};

export interface DynamicIconProps {
  gif: string;
  alt?: string;
  className?: string;
}

export function DynamicIcon({ gif, alt = '', className }: DynamicIconProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [gif]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setImgError(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline || imgError) {
    const FallbackIcon = iconMap[gif];
    if (FallbackIcon) {
      return <FallbackIcon className={cn("text-gray-600", className)} />;
    }
    // Fallback to emoji if mapping is missing
    const codePoint = parseInt(gif, 16);
    if (!isNaN(codePoint)) {
      return (
        <span className={cn("inline-flex items-center justify-center font-emoji", className)} title={alt}>
          {String.fromCodePoint(codePoint)}
        </span>
      );
    }
    return null;
  }

  return (
    <img 
      src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${gif}/512.gif`} 
      alt={alt} 
      className={className} 
      onError={() => setImgError(true)}
    />
  );
}

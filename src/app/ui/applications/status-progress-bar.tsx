'use client';

import { formatDateTime } from '@/app/lib/utils';

interface StatusProgressBarProps {
  status: string;
  date: string;
  size?: 'small' | 'large';
}

export default function StatusProgressBar({ status, date, size = 'small' }: StatusProgressBarProps) {
  const statuses = ['applied', 'interview', 'offer', 'withdrawn', 'not selected'];
  const statusIndex = statuses.indexOf(status);
  
  // Define color classes based on status
  const getStatusColor = (currStatus: string) => {
    switch(currStatus) {
      case 'applied': return 'bg-[#c0cfb2]';
      case 'interview': return 'bg-[#8ba888]';
      case 'offer': return 'bg-[#44624a]';
      case 'withdrawn': return 'bg-gray-400';
      case 'not selected': return 'bg-gray-400';
      default: return 'bg-gray-200';
    }
  };

  // Define text based on status
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const heightClass = size === 'large' ? 'h-3' : 'h-2';
  const textSizeClass = size === 'large' ? 'text-sm' : 'text-xs';

  // For withdrawn or not selected statuses, show a full gray bar
  if (status === 'withdrawn' || status === 'not selected') {
    return (
      <div className={size === 'large' ? 'mt-4' : 'mt-2'}>
        <div className={`flex justify-between ${textSizeClass} text-gray-600 mb-1`}>
          <span>{getStatusText(status)}</span>
          <span>{formatDateTime(date, { includeTime: false })}</span>
        </div>
        <div className={`${heightClass} w-full rounded-full overflow-hidden bg-gray-400`}></div>
        
        {size === 'large' && (
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Applied</span>
            <span>Interview</span>
            <span>Offer</span>
          </div>
        )}
      </div>
    );
  }

  // For normal progression statuses
  return (
    <div className={size === 'large' ? 'mt-4' : 'mt-2'}>
      <div className={`flex justify-between ${textSizeClass} text-gray-600 mb-1`}>
        <span>{getStatusText(status)}</span>
        <span>{formatDateTime(date, { includeTime: false })}</span>
      </div>
      <div className={`flex ${heightClass} w-full rounded-full overflow-hidden bg-gray-200`}>
        {['applied', 'interview', 'offer'].map((s, i) => (
          <div 
            key={s} 
            className={`h-full ${i <= statusIndex ? getStatusColor(s) : 'bg-gray-200'}`} 
            style={{ width: '33.33%' }}
          />
        ))}
      </div>
      
      {size === 'large' && (
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Applied</span>
          <span>Interview</span>
          <span>Offer</span>
        </div>
      )}
    </div>
  );
} 
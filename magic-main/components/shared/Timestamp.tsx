import React from 'react';

interface TimestampProps {
  ts?: number | string | null;
  className?: string;
}

export const Timestamp: React.FC<TimestampProps> = ({ ts, className }) => {
  if (!ts) return <span className="text-gray-500 italic">N/A</span>;

  // Stripe sends seconds (10 digits), JS needs milliseconds (13 digits)
  const dateValue = typeof ts === 'number' && ts < 10000000000 ? ts * 1000 : ts;
  const date = new Date(dateValue);

  // Check if the date is actually valid before calling toISOString()
  if (isNaN(date.getTime())) {
    return <span className="text-gray-500 italic">Invalid Date</span>;
  }

  return (
    <span className={className} title={date.toISOString()}>
      {date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
  );
};
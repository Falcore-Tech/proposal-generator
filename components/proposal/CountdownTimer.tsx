"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
  status?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  expiresAt, 
  onExpire,
  className = "",
  status = ""
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    // Don't run countdown for accepted/paid proposals
    if (["accepted", "paid"].includes(status.toLowerCase())) {
      return;
    }

    // Don't run countdown if expiresAt is null/empty (for old proposals)
    if (!expiresAt || expiresAt === "") {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true
        });
        if (onExpire && !["accepted", "paid"].includes(status.toLowerCase())) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        expired: false
      });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire, status]);

  // Don't show anything for accepted/paid proposals
  if (["accepted", "paid"].includes(status.toLowerCase())) {
    return null;
  }

  // Don't show countdown if expiresAt is null/empty (for old proposals)
  if (!expiresAt || expiresAt === "") {
    return null;
  }

  if (timeLeft.expired) {
    return (
      <div className={`text-red-500 font-medium ${className}`}>
        Expired
      </div>
    );
  }

  // Format time unit with leading zero if needed
  const formatUnit = (value: number) => value.toString().padStart(2, '0');

  // For ProposalCard, show compact version
  const isCompact = className.includes('text-xs');
  
  if (isCompact) {
    return (
      <div className={`${className}`}>
        <span className="text-white font-medium">
          {timeLeft.days}d {formatUnit(timeLeft.hours)}h {formatUnit(timeLeft.minutes)}m {formatUnit(timeLeft.seconds)}s
        </span>
      </div>
    );
  }

  const isXmaMedia = className.includes('xma-media');
  const numColor = isXmaMedia ? 'text-(--primary)' : 'text-white';
  const labelColor = isXmaMedia ? 'text-(--foreground)/50' : 'text-zinc-400';
  const sepColor = isXmaMedia ? 'text-(--foreground)/30' : 'text-zinc-500';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center">
        <div className="text-center">
          <div className={`text-2xl font-bold ${numColor}`}>{timeLeft.days}</div>
          <div className={`text-xs uppercase ${labelColor}`}>Days</div>
        </div>
        <span className={`text-xl mx-1 ${sepColor}`}>:</span>
        <div className="text-center">
          <div className={`text-2xl font-bold ${numColor}`}>{formatUnit(timeLeft.hours)}</div>
          <div className={`text-xs uppercase ${labelColor}`}>Hours</div>
        </div>
        <span className={`text-xl mx-1 ${sepColor}`}>:</span>
        <div className="text-center">
          <div className={`text-2xl font-bold ${numColor}`}>{formatUnit(timeLeft.minutes)}</div>
          <div className={`text-xs uppercase ${labelColor}`}>Min</div>
        </div>
        <span className={`text-xl mx-1 ${sepColor}`}>:</span>
        <div className="text-center">
          <div className={`text-2xl font-bold ${numColor}`}>{formatUnit(timeLeft.seconds)}</div>
          <div className={`text-xs uppercase ${labelColor}`}>Sec</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
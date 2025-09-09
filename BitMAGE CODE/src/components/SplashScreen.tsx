import React, { useState, useEffect } from 'react';
import { imgIconCandlesV, imgIconCandlesV1 } from "../imports/svg-t2t98";

function TypewriterText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        setHasStarted(true);
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      setHasStarted(true);
    }
  }, [delay]);

  useEffect(() => {
    if (hasStarted && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Adjust speed here (50ms per character)

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, hasStarted]);

  return (
    <p className={className}>
      {displayText}
      {hasStarted && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </p>
  );
}

function IconCandlesV() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / candles-v">
      <img className="block max-w-none size-full" src={imgIconCandlesV} />
    </div>
  );
}

function Frame40() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-start p-[10px] relative shrink-0">
      <IconCandlesV />
    </div>
  );
}

function IconCandlesV1() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / candles-v">
      <img className="block max-w-none size-full" src={imgIconCandlesV1} />
    </div>
  );
}

function Frame39() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-start p-[10px] relative shrink-0">
      <IconCandlesV1 />
    </div>
  );
}

function Frame41() {
  return (
    <div className="absolute content-stretch flex gap-[26px] items-center justify-start left-1/2 top-[480px] translate-x-[-50%]">
      <Frame40 />
      <Frame39 />
    </div>
  );
}

function Frame37() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative shrink-0">
      <div className="font-['Inter:Extra_Bold',_sans-serif] font-extrabold leading-[0] not-italic relative shrink-0 text-[32px] text-center text-nowrap text-white">
        <p className="leading-[normal] whitespace-pre text-[32px]">
          Bit<span className="text-[#0bda43]">MAGE</span>
        </p>
      </div>
    </div>
  );
}

function Frame36() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.5)] text-center text-nowrap whitespace-pre">
            <TypewriterText text="Step into the world of crypto trading without risk," className="mb-0" />
            <TypewriterText text="test your instincts and climb the leaderboard.  " delay={2500} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame38() {
  return (
    <div className="absolute content-stretch flex flex-col gap-1 items-center justify-start left-0 top-[350px] w-[402px]">
      <Frame37 />
      <Frame36 />
    </div>
  );
}

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const handleTap = () => {
    onComplete();
  };

  // Auto-advance after text animation completes
  useEffect(() => {
    // Calculate total animation time:
    // First line: ~50 characters * 50ms = 2500ms
    // Delay before second line: 2500ms
    // Second line: ~45 characters * 50ms = 2250ms
    // Total: ~7250ms + 500ms buffer = 7750ms
    const timer = setTimeout(() => {
      onComplete();
    }, 7750);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="bg-[#111813] relative size-full min-h-screen cursor-pointer" 
      data-name="iPhone 16 Pro - 4"
      onClick={handleTap}
    >
      <Frame41 />
      <Frame38 />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { QSiLogo } from './QSiLogo';

interface IntroLoaderProps {
  onStartExit?: () => void;
  onComplete?: () => void;
}

export const IntroLoader: React.FC<IntroLoaderProps> = ({ onStartExit, onComplete }) => {
  const fullText = "齐思设计，创意妙想。";
  const subtitleText = "Cheers to creativity";
  
  const [typedText, setTypedText] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const triggerExit = () => {
    if (!isFadingOut) {
      setIsFadingOut(true);
      if (onStartExit) onStartExit();
    }
  };

  useEffect(() => {
    // Show icon with a slight initial delay
    const iconTimer = setTimeout(() => {
      setShowIcon(true);
    }, 150);

    // Typewriter effect for main text
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Show subtitle after text finishes typing
        setTimeout(() => {
          setShowSubtitle(true);
        }, 200);
      }
    }, 110);

    // Fade out timer
    const fadeTimer = setTimeout(() => {
      triggerExit();
    }, 3200);

    // Complete timer
    const finishTimer = setTimeout(() => {
      setIsDone(true);
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      setShowIcon(false);
      clearTimeout(iconTimer);
      clearInterval(typingInterval);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      onClick={() => {
        triggerExit();
        setTimeout(() => {
          setIsDone(true);
          if (onComplete) onComplete();
        }, 800);
      }}
      className={`fixed inset-0 z-[100] flex flex-col justify-between p-10 sm:p-16 md:p-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 cursor-pointer select-none transition-all duration-800 ease-out transform ${
        isFadingOut ? 'opacity-0 scale-110 blur-[2px] pointer-events-none' : 'opacity-100 scale-100 blur-none'
      }`}
    >
      {/* Background subtle clean texture */}
      <div className="absolute inset-0 bg-white dark:bg-neutral-950" />

      {/* CENTER RIGHT: Ultra-Minimalist QSi Typography Icon */}
      <div className="absolute top-1/3 right-12 sm:right-28 md:right-36 -translate-y-1/2 z-10">
        <div 
          className={`transition-all duration-1000 ease-out transform ${
            showIcon 
              ? 'opacity-100 translate-x-0 scale-100' 
              : 'opacity-0 translate-x-6 scale-98'
          }`}
        >
          <div className="relative group flex items-center gap-3">
            <QSiLogo className="h-12 sm:h-16 md:h-20 w-auto text-neutral-800 dark:text-neutral-100" pulsingLine />
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT: Ultra-Light Minimalist Typography */}
      <div className="absolute bottom-12 left-10 sm:bottom-16 sm:left-16 md:bottom-20 md:left-24 z-10 space-y-2">
        {/* Main Title - Fine Light Sans-serif */}
        <div className="min-h-[48px] flex items-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light font-sans tracking-normal text-neutral-800 dark:text-neutral-100 flex items-center">
            <span>{typedText}</span>
            <span className="inline-block w-[2.5px] h-6 sm:h-8 ml-1.5 bg-black dark:bg-white animate-[pulse_0.5s_ease-in-out_infinite]" />
          </h1>
        </div>

        {/* Subtitle - Ultra-light English Subtitle */}
        <div
          className={`transition-all duration-700 ease-out transform ${
            showSubtitle 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-xs sm:text-sm font-sans font-extralight tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            {subtitleText}
          </p>
        </div>
      </div>

      {/* BOTTOM RIGHT: Subtle Bouncing Loading Dots */}
      <div className="absolute bottom-12 right-10 sm:bottom-16 sm:right-16 md:bottom-20 md:right-24 z-10 flex items-center gap-1.5 opacity-50 text-neutral-400 dark:text-neutral-500">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
      </div>
    </div>
  );
};


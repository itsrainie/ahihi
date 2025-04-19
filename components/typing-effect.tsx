"use client";

import { useState, useEffect, useRef } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number; // Milliseconds per character
  className?: string; // Allow passing className
  scrollContainerRef?: React.RefObject<HTMLDivElement>; // Optional ref for scrolling parent
}

export function TypingEffect({ text, speed = 30, className, scrollContainerRef }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset immediately if text is empty or changed
    setDisplayedText('');
    indexRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!text) return; // Don't start typing if text is empty

    const typeCharacter = () => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current += 1;

        // Attempt to scroll down the container
        if (scrollContainerRef?.current) {
           // Use scrollIntoView on a dummy element at the end, or scroll container directly
           // Direct scroll might be better here
           scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }

        timeoutRef.current = setTimeout(typeCharacter, speed);
      } else {
        // Typing complete
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    // Start typing after a minimal delay
    timeoutRef.current = setTimeout(typeCharacter, speed);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  // IMPORTANT: Only re-run if `text` or `speed` changes. Avoid infinite loops.
  }, [text, speed, scrollContainerRef]);

  // Render the displayed text using the passed className
  return <span className={className}>{displayedText}</span>;
}

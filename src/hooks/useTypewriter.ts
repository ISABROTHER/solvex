import { useState, useEffect } from 'react';

// Custom hook for typewriter animation effect
export const useTypewriterEffect = (text: string, typingSpeed: number = 80) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleMotionPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMotionPreferenceChange);
    
    return () => mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
  }, []);

  // Handle typewriter animation
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsTypingComplete(true);
      return;
    }

    if (displayedText.length === text.length) {
      const completionTimer = setTimeout(() => setIsTypingComplete(true), 500);
      return () => clearTimeout(completionTimer);
    }

    const typingTimer = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, typingSpeed);

    return () => clearTimeout(typingTimer);
  }, [displayedText, text, typingSpeed, prefersReducedMotion]);

  return { displayedText, isTypingComplete };
};
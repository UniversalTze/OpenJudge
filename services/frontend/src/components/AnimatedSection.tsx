import { useEffect, useRef, ReactNode, useState } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  animation: 'float-up' | 'float-down' | 'fade-in' | 'reveal-left' | 'reveal-right';
  delay?: string;
  className?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  animation,
  delay = '0ms',
  className = '',
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Small delay to ensure smooth animation
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, parseInt(delay) || 0);
          
          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -5% 0px', // Trigger when 5% visible
        threshold: 0.1,
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay, hasAnimated]);

  // Animation classes mapping
  const getAnimationClass = () => {
    if (!isVisible) return '';
    
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in';
      case 'float-up':
        return 'animate-slide-in';
      case 'float-down':
        return 'animate-slide-in';
      case 'reveal-left':
        return 'animate-slide-in';
      case 'reveal-right':
        return 'animate-slide-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div
      ref={sectionRef}
      className={`transition-all duration-700 ease-out ${className} ${getAnimationClass()}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateY(0px)' 
          : animation.includes('up') 
            ? 'translateY(30px)' 
            : animation.includes('down')
              ? 'translateY(-30px)'
              : animation.includes('left')
                ? 'translateX(-30px)'
                : animation.includes('right')
                  ? 'translateX(30px)'
                  : 'translateY(20px)',
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
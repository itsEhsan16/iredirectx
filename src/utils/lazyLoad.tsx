import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';

interface LazyLoadProps {
  fallback?: React.ReactNode;
}

/**
 * Creates a lazy-loaded component with a customizable loading fallback
 * @param importFunc - Dynamic import function for the component
 * @param fallbackComponent - Optional custom fallback component
 * @returns A wrapped lazy component with suspense
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackComponent?: React.ReactNode
): React.FC<React.ComponentProps<T> & LazyLoadProps> {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T> & LazyLoadProps) => {
    const { fallback = fallbackComponent, ...componentProps } = props;
    
    const defaultFallback = (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
    
    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...componentProps as any} />
      </Suspense>
    );
  };
}

/**
 * Creates a lazy-loaded component with a cosmic-styled loading fallback
 * @param importFunc - Dynamic import function for the component
 * @returns A wrapped lazy component with cosmic-styled fallback
 */
export function createCosmicLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.FC<React.ComponentProps<T> & LazyLoadProps> {
  const cosmicFallback = (
    <div className="cosmic-card cosmic-glass p-6 flex items-center justify-center min-h-[100px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  return createLazyComponent(importFunc, cosmicFallback);
}
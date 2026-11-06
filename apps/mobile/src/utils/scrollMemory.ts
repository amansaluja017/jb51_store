import { useRef, useEffect, useCallback } from 'react';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const scrollPositions: Record<string, number> = {};

export function setScrollPosition(key: string, offset: number): void {
  scrollPositions[key] = offset;
}

export function getScrollPosition(key: string): number {
  return scrollPositions[key] || 0;
}

export function useScrollMemory(key: string) {
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const savedY = getScrollPosition(key);
    if (savedY > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: savedY, animated: false });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [key]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      setScrollPosition(key, y);
    },
    [key]
  );

  return {
    scrollViewRef,
    onScroll,
  };
}


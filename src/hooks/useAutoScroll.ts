import { useEffect, useRef, useCallback } from 'react';

interface AutoScrollOptions {
  scrollContainer: HTMLElement | null;
  threshold?: number; // 触发滚动的边缘距离
  maxScrollSpeed?: number; // 最大滚动速度
  enabled?: boolean; // 是否启用自动滚动
}

export function useAutoScroll({
  scrollContainer,
  threshold = 100,
  maxScrollSpeed = 15,
  enabled = true
}: AutoScrollOptions) {
  const animationFrameRef = useRef<number>();
  const isScrollingRef = useRef(false);
  const currentDirectionRef = useRef<'left' | 'right' | null>(null);
  const currentSpeedRef = useRef(0);

  const stopAutoScroll = useCallback(() => {
    isScrollingRef.current = false;
    currentDirectionRef.current = null;
    currentSpeedRef.current = 0;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  const startAutoScroll = useCallback((direction: 'left' | 'right', speed: number) => {
    if (!scrollContainer || !enabled) return;

    // 如果方向相同，只更新速度
    if (isScrollingRef.current && currentDirectionRef.current === direction) {
      currentSpeedRef.current = speed;
      return;
    }

    // 如果方向不同或者首次启动，重新开始
    stopAutoScroll();
    isScrollingRef.current = true;
    currentDirectionRef.current = direction;
    currentSpeedRef.current = speed;

    const scroll = () => {
      if (!scrollContainer || !isScrollingRef.current) return;

      const scrollAmount = currentDirectionRef.current === 'right' 
        ? currentSpeedRef.current 
        : -currentSpeedRef.current;
      
      const newScrollLeft = scrollContainer.scrollLeft + scrollAmount;
      
      // 检查边界
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      if (newScrollLeft <= 0 || newScrollLeft >= maxScroll) {
        stopAutoScroll();
        return;
      }

      scrollContainer.scrollLeft = newScrollLeft;
      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    animationFrameRef.current = requestAnimationFrame(scroll);
  }, [scrollContainer, enabled, stopAutoScroll]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!scrollContainer || !enabled) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const mouseX = event.clientX;
    const relativeX = mouseX - containerRect.left;
    const containerWidth = containerRect.width;

    // 检查鼠标是否在容器范围内
    if (relativeX < 0 || relativeX > containerWidth) {
      stopAutoScroll();
      return;
    }

    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    
    // 检查左边缘
    if (relativeX < threshold && scrollContainer.scrollLeft > 0) {
      // 计算渐进速度：越靠近边缘速度越快
      const distance = threshold - relativeX;
      const speedRatio = Math.min(distance / threshold, 1);
      const speed = Math.max(speedRatio * maxScrollSpeed, 2); // 最小速度2px
      startAutoScroll('left', speed);
    }
    // 检查右边缘
    else if (relativeX > containerWidth - threshold && scrollContainer.scrollLeft < maxScroll) {
      const distance = relativeX - (containerWidth - threshold);
      const speedRatio = Math.min(distance / threshold, 1);
      const speed = Math.max(speedRatio * maxScrollSpeed, 2);
      startAutoScroll('right', speed);
    }
    // 停止滚动
    else {
      stopAutoScroll();
    }
  }, [scrollContainer, threshold, maxScrollSpeed, enabled, startAutoScroll, stopAutoScroll]);

  const handleDragStart = useCallback(() => {
    if (!enabled) return;
    // 使用高频监听以获得流畅体验
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
  }, [handleMouseMove, enabled]);

  const handleDragEnd = useCallback(() => {
    stopAutoScroll();
    document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, stopAutoScroll]);

  // 清理函数
  useEffect(() => {
    return () => {
      stopAutoScroll();
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove, stopAutoScroll]);

  return {
    startAutoScroll: handleDragStart,
    stopAutoScroll: handleDragEnd,
  };
}
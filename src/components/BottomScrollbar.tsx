import { useEffect, useRef, useState } from 'react';

interface BottomScrollbarProps {
  targetSelector: string; // CSS选择器，用于找到需要同步的滚动容器
}

export function BottomScrollbar({ targetSelector }: BottomScrollbarProps) {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollInfo, setScrollInfo] = useState({
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
  });

  useEffect(() => {
    const targetElement = document.querySelector(targetSelector) as HTMLElement;
    if (!targetElement) return;

    const updateScrollInfo = () => {
      const info = {
        scrollLeft: targetElement.scrollLeft,
        scrollWidth: targetElement.scrollWidth,
        clientWidth: targetElement.clientWidth,
      };
      setScrollInfo(info);
      setIsVisible(info.scrollWidth > info.clientWidth);
    };

    // 初始更新
    updateScrollInfo();

    // 监听滚动事件
    const handleScroll = () => {
      if (!isDragging) {
        updateScrollInfo();
      }
    };

    // 监听窗口大小变化
    const handleResize = () => {
      updateScrollInfo();
    };

    // 监听DOM变化（列的添加/删除）
    const observer = new MutationObserver(updateScrollInfo);
    observer.observe(targetElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    targetElement.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      targetElement.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [targetSelector, isDragging]);

  // 计算滚动条拇指的位置和大小
  const thumbWidth = Math.max(
    (scrollInfo.clientWidth / scrollInfo.scrollWidth) * 100,
    5 // 最小宽度5%
  );
  const thumbLeft = (scrollInfo.scrollLeft / (scrollInfo.scrollWidth - scrollInfo.clientWidth)) * (100 - thumbWidth);

  // 处理拇指拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const scrollbar = scrollbarRef.current;
    const targetElement = document.querySelector(targetSelector) as HTMLElement;
    if (!scrollbar || !targetElement) return;

    const scrollbarRect = scrollbar.getBoundingClientRect();
    const startX = e.clientX;
    const startScrollLeft = targetElement.scrollLeft;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const scrollbarWidth = scrollbarRect.width;
      const scrollRatio = deltaX / scrollbarWidth;
      const maxScrollLeft = targetElement.scrollWidth - targetElement.clientWidth;
      
      targetElement.scrollLeft = Math.max(0, Math.min(maxScrollLeft, startScrollLeft + scrollRatio * maxScrollLeft));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理滚动条背景点击
  const handleTrackClick = (e: React.MouseEvent) => {
    if (e.target === thumbRef.current) return;

    const scrollbar = scrollbarRef.current;
    const targetElement = document.querySelector(targetSelector) as HTMLElement;
    if (!scrollbar || !targetElement) return;

    const scrollbarRect = scrollbar.getBoundingClientRect();
    const clickX = e.clientX - scrollbarRect.left;
    const scrollbarWidth = scrollbarRect.width;
    const clickRatio = clickX / scrollbarWidth;
    const maxScrollLeft = targetElement.scrollWidth - targetElement.clientWidth;
    
    targetElement.scrollLeft = clickRatio * maxScrollLeft;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 py-2">
        <div
          ref={scrollbarRef}
          className="relative h-3 bg-muted/30 rounded-full cursor-pointer group hover:bg-muted/50 transition-colors duration-200"
          onClick={handleTrackClick}
        >
          <div
            ref={thumbRef}
            className="absolute top-0 h-full bg-primary/60 rounded-full cursor-grab active:cursor-grabbing transition-all duration-150 group-hover:bg-primary/80"
            style={{
              width: `${thumbWidth}%`,
              left: `${thumbLeft}%`,
              transform: isDragging ? 'scaleY(1.2)' : 'scaleY(1)',
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
}
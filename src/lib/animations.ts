// 动画配置 - 参考 cc-switch 设计语言
// 使用 Framer Motion 实现流畅动画

import { Variants, Transition } from 'framer-motion';

// ============================================
// 动画时长规范
// ============================================
export const durations = {
  micro: 0.15,        // 微交互: 150ms
  fast: 0.2,          // 快速过渡: 200ms
  normal: 0.3,        // 普通过渡: 300ms
  slow: 0.5,          // 慢速入场: 500ms
} as const;

// ============================================
// 缓动函数
// ============================================
export const easings = {
  easeOut: [0.16, 1, 0.3, 1],           // 弹性出
  easeInOut: [0.65, 0, 0.35, 1],        // 平滑进出
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  bounce: { type: 'spring', stiffness: 500, damping: 25 },
} as const;

// ============================================
// 通用过渡配置
// ============================================
export const transitions: Record<string, Transition> = {
  micro: { duration: durations.micro, ease: easings.easeOut },
  fast: { duration: durations.fast, ease: easings.easeOut },
  normal: { duration: durations.normal, ease: easings.easeOut },
  spring: easings.spring,
  bounce: easings.bounce,
};

// ============================================
// 淡入动画
// ============================================
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================
// 向上滑入
// ============================================
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// ============================================
// 向下滑入
// ============================================
export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// ============================================
// 缩放淡入
// ============================================
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ============================================
// 卡片动画 - 列表项
// ============================================
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: durations.fast,
    },
  },
  hover: {
    y: -2,
    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: durations.micro,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: durations.micro,
    },
  },
  drag: {
    scale: 1.05,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    zIndex: 50,
    cursor: 'grabbing',
    transition: {
      duration: durations.micro,
    },
  },
};

// ============================================
// 拖拽预览动画
// ============================================
export const dragPreviewVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotate: -2,
  },
  animate: {
    opacity: 0.95,
    scale: 1.02,
    rotate: 2,
    transition: easings.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: durations.fast,
    },
  },
};

// ============================================
// 列容器动画
// ============================================
export const columnVariants: Variants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: durations.fast,
    },
  },
};

// ============================================
// 列表容器动画 (stagger 子元素)
// ============================================
export const listContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// ============================================
// 搜索面板动画 (参考 cc-switch)
// ============================================
export const searchPanelVariants: Variants = {
  initial: {
    opacity: 0,
    y: -8,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.18,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: {
      duration: 0.15,
    },
  },
};

// ============================================
// Dialog 动画
// ============================================
export const dialogOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const dialogContentVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: durations.fast,
    },
  },
};

// ============================================
// 手风琴动画
// ============================================
export const accordionVariants: Variants = {
  initial: {
    height: 0,
    opacity: 0,
  },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: durations.normal,
      },
      opacity: {
        duration: durations.fast,
        delay: 0.1,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: durations.fast,
      },
      opacity: {
        duration: durations.micro,
      },
    },
  },
};

// ============================================
// 下拉放置指示器动画
// ============================================
export const dropIndicatorVariants: Variants = {
  initial: {
    scaleX: 0,
    opacity: 0,
  },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: easings.spring,
  },
  exit: {
    scaleX: 0,
    opacity: 0,
    transition: {
      duration: durations.micro,
    },
  },
};

// ============================================
// 工具函数: 生成延迟动画
// ============================================
export const getStaggerDelay = (index: number, baseDelay = 0.05) => ({
  delay: index * baseDelay,
});

// ============================================
// 工具函数: 弹跳缩放动画
// ============================================
export const popIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: easings.bounce,
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: durations.fast },
  },
};

import { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Palette, Check } from 'lucide-react';

interface ColumnColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string | undefined) => void;
}

// 精简的8色调色板 - 鲜明版本
const COLOR_PRESETS = [
  // 默认
  { 
    name: '默认', 
    value: undefined, 
    light: 'bg-muted/40', 
    dark: 'dark:bg-muted/40',
    preview: '#f1f5f9'
  },
  // 蓝色 - 进行中
  { 
    name: '蓝色', 
    value: 'blue', 
    light: 'bg-blue-100/80', 
    dark: 'dark:bg-blue-900/40',
    preview: '#93c5fd'
  },
  // 绿色 - 完成
  { 
    name: '绿色', 
    value: 'green', 
    light: 'bg-green-100/80', 
    dark: 'dark:bg-green-900/40',
    preview: '#86efac'
  },
  // 橙色 - 待办
  { 
    name: '橙色', 
    value: 'orange', 
    light: 'bg-orange-100/80', 
    dark: 'dark:bg-orange-900/40',
    preview: '#fed7aa'
  },
  // 紫色 - 设计
  { 
    name: '紫色', 
    value: 'purple', 
    light: 'bg-purple-100/80', 
    dark: 'dark:bg-purple-900/40',
    preview: '#d8b4fe'
  },
  // 红色 - 问题
  { 
    name: '红色', 
    value: 'red', 
    light: 'bg-red-100/80', 
    dark: 'dark:bg-red-900/40',
    preview: '#fca5a5'
  },
  // 黄色 - 提醒
  { 
    name: '黄色', 
    value: 'yellow', 
    light: 'bg-yellow-100/80', 
    dark: 'dark:bg-yellow-900/40',
    preview: '#fde047'
  },
  // 青色 - 审核
  { 
    name: '青色', 
    value: 'cyan', 
    light: 'bg-cyan-100/80', 
    dark: 'dark:bg-cyan-900/40',
    preview: '#67e8f9'
  },
];

export function ColumnColorPicker({ currentColor, onColorChange }: ColumnColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentPreset = COLOR_PRESETS.find(preset => preset.value === currentColor) || COLOR_PRESETS[0];

  const handleColorSelect = (colorValue: string | undefined) => {
    onColorChange(colorValue);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <Palette className="w-4 h-4 mr-2" />
          更换主题
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">选择列背景色</h4>
            <p className="text-xs text-muted-foreground">
              为列设置背景色以便区分不同工作流
            </p>
          </div>
          
          <div className="space-y-1">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value || 'default'}
                onClick={() => handleColorSelect(preset.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-150
                  hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                  ${currentColor === preset.value
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-muted/50'
                  }
                `}
                title={`${preset.name} - 点击应用此颜色主题`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-md border border-gray-200 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: preset.preview }}
                  />
                  <span>{preset.name}</span>
                </div>
                {currentColor === preset.value && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              💡 <span className="font-medium">提示：</span>精选8种鲜明颜色，便于快速区分工作流
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// 获取列的背景样式类名
export function getColumnBackgroundClass(backgroundColor?: string): string {
  if (!backgroundColor) {
    return 'bg-muted/40';
  }

  const preset = COLOR_PRESETS.find(p => p.value === backgroundColor);
  if (preset) {
    return `${preset.light} ${preset.dark}`;
  }

  return 'bg-muted/40';
}

// 获取卡片数量标签的样式类名
export function getCardCountBadgeClass(backgroundColor?: string): string {
  if (!backgroundColor) {
    return 'bg-white/70 text-muted-foreground border border-border/30 backdrop-blur-sm';
  }

  switch (backgroundColor) {
    case 'blue':
      return 'bg-blue-200/80 text-blue-800 border border-blue-300/50 dark:bg-blue-800/60 dark:text-blue-200 dark:border-blue-700/50';
    case 'green':
      return 'bg-green-200/80 text-green-800 border border-green-300/50 dark:bg-green-800/60 dark:text-green-200 dark:border-green-700/50';
    case 'orange':
      return 'bg-orange-200/80 text-orange-800 border border-orange-300/50 dark:bg-orange-800/60 dark:text-orange-200 dark:border-orange-700/50';
    case 'purple':
      return 'bg-purple-200/80 text-purple-800 border border-purple-300/50 dark:bg-purple-800/60 dark:text-purple-200 dark:border-purple-700/50';
    case 'red':
      return 'bg-red-200/80 text-red-800 border border-red-300/50 dark:bg-red-800/60 dark:text-red-200 dark:border-red-700/50';
    case 'yellow':
      return 'bg-yellow-200/80 text-yellow-800 border border-yellow-300/50 dark:bg-yellow-800/60 dark:text-yellow-200 dark:border-yellow-700/50';
    case 'cyan':
      return 'bg-cyan-200/80 text-cyan-800 border border-cyan-300/50 dark:bg-cyan-800/60 dark:text-cyan-200 dark:border-cyan-700/50';
    default:
      return 'bg-white/70 text-muted-foreground border border-border/30 backdrop-blur-sm';
  }
}
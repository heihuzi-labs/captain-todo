import { getColumnBackgroundClass } from './ColumnColorPicker';

interface ColorThemeDemoProps {
  isVisible: boolean;
  onClose: () => void;
}

export function ColorThemeDemo({ isVisible, onClose }: ColorThemeDemoProps) {
  if (!isVisible) return null;

  const demoColors = ['orange', 'blue', 'green', 'purple', 'red', 'yellow', 'cyan'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-card rounded-lg p-6 max-w-4xl mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">🎨 精简颜色方案</h3>
            <p className="text-sm text-muted-foreground">
              8种精选鲜明颜色，简洁清晰地区分不同工作流
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {demoColors.map((color, index) => (
              <div
                key={color}
                className={`rounded-lg overflow-hidden ${getColumnBackgroundClass(color)} transition-all duration-200 min-h-[100px]`}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">
                      {color === 'green' ? '绿色' : 
                       color === 'orange' ? '橙色' : 
                       color === 'blue' ? '蓝色' : 
                       color === 'purple' ? '紫色' : 
                       color === 'red' ? '红色' : 
                       color === 'yellow' ? '黄色' : '青色'}
                    </h4>
                    <div className="bg-muted px-2 py-0.5 rounded-full text-xs">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-card rounded p-2 text-xs border border-border/50">
                      示例卡片 {index + 1}
                    </div>
                    <div className="bg-card rounded p-2 text-xs border border-border/50">
                      任务项目 {index + 1}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              开始使用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
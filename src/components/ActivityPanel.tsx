import { useState } from 'react';
import { Activity } from '../types/kanban';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Activity as ActivityIcon, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityPanelProps {
  activities: Activity[];
}

const activityTypeLabels = {
  card_created: '创建卡片',
  card_updated: '更新卡片',
  card_moved: '移动卡片',
  card_deleted: '删除卡片',
  column_created: '创建列',
  column_updated: '更新列',
  column_deleted: '删除列',
};

const activityTypeColors = {
  card_created: 'bg-green-500',
  card_updated: 'bg-blue-500',
  card_moved: 'bg-yellow-500',
  card_deleted: 'bg-red-500',
  column_created: 'bg-purple-500',
  column_updated: 'bg-indigo-500',
  column_deleted: 'bg-pink-500',
};

export function ActivityPanel({ activities }: ActivityPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('zh-CN');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const dates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ActivityIcon className="w-4 h-4" />
          活动记录
          {activities.length > 0 && (
            <Badge variant="secondary">{activities.length}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            活动记录
          </SheetTitle>
          <SheetDescription>
            查看所有卡片和列的操作历史记录
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          {activities.length > 0 ? (
            <div className="space-y-6">
              {dates.map((date) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2 sticky top-0 bg-background py-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium">{date}</h4>
                  </div>
                  
                  <div className="space-y-3 pl-6">
                    {groupedActivities[date].map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative flex gap-3 p-3 bg-card border rounded-lg"
                      >
                        {/* Activity Type Indicator */}
                        <div 
                          className={`
                            w-2 h-2 rounded-full mt-2 flex-shrink-0
                            ${activityTypeColors[activity.type]}
                          `}
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <p className="leading-relaxed">{activity.title}</p>
                              {activity.description && (
                                <p className="text-sm text-muted-foreground">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {activityTypeLabels[activity.type]}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString('zh-CN')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
              <ActivityIcon className="w-12 h-12 text-muted-foreground/50" />
              <div className="space-y-2">
                <h3 className="font-medium">暂无活动记录</h3>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  开始创建和编辑卡片，活动记录会在这里显示
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
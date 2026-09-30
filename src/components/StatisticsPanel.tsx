import { memo, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { Card as CardType, Column, Activity } from '../types/kanban';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Target, 
  Zap,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface StatisticsPanelProps {
  cards: CardType[];
  columns: Column[];
  activities: Activity[];
}

export const StatisticsPanel = memo(function StatisticsPanel({
  cards,
  columns,
  activities
}: StatisticsPanelProps) {
  // 核心指标计算
  const coreMetrics = useMemo(() => {
    const totalCards = cards.length;
    const completedCards = cards.filter(card => card.completed).length;
    const pendingCards = totalCards - completedCards;
    const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
    
    // 计算效率指标
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(a => new Date(a.timestamp) >= last7Days);
    const dailyAverage = Math.round(recentActivities.length / 7 * 10) / 10;
    
    // 工作负载分析
    const columnWorkload = columns.map(col => {
      const colCards = cards.filter(c => c.columnId === col.id);
      return {
        name: col.title,
        count: colCards.length,
        completed: colCards.filter(c => c.completed).length
      };
    });
    
    // 瓶颈识别
    const bottleneckColumn = columnWorkload.reduce((max, col) => 
      col.count > max.count ? col : max, { name: '', count: 0, completed: 0 }
    );
    
    return {
      totalCards,
      completedCards,
      pendingCards,
      completionRate,
      dailyAverage,
      bottleneckColumn: bottleneckColumn.count > 0 ? bottleneckColumn.name : null,
      totalActivities: activities.length
    };
  }, [cards, columns, activities]);

  // 趋势分析
  const trendAnalysis = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date;
    });

    const trendData = last14Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= dayStart && activityDate <= dayEnd;
      });

      const completed = dayActivities.filter(a => a.type === 'card_completed').length;
      const created = dayActivities.filter(a => a.type === 'card_created').length;

      return {
        date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        completed,
        created,
        total: dayActivities.length
      };
    });

    // 计算趋势方向
    const recent7 = trendData.slice(-7);
    const previous7 = trendData.slice(0, 7);
    
    const recentAvg = recent7.reduce((sum, day) => sum + day.total, 0) / 7;
    const previousAvg = previous7.reduce((sum, day) => sum + day.total, 0) / 7;
    
    const trendDirection = recentAvg > previousAvg ? 'up' : recentAvg < previousAvg ? 'down' : 'stable';
    const trendPercent = previousAvg > 0 ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100) : 0;

    return {
      data: trendData,
      direction: trendDirection,
      percent: Math.abs(trendPercent)
    };
  }, [activities]);

  // 性能洞察
  const performanceInsights = useMemo(() => {
    const insights = [];
    
    // 完成率洞察
    if (coreMetrics.completionRate >= 80) {
      insights.push({
        type: 'success',
        icon: Target,
        title: '完成率优秀',
        message: `${coreMetrics.completionRate}% 的完成率表现出色！`
      });
    } else if (coreMetrics.completionRate >= 50) {
      insights.push({
        type: 'warning',
        icon: Clock,
        title: '完成率中等',
        message: `还有 ${100 - coreMetrics.completionRate}% 的任务待完成`
      });
    } else if (coreMetrics.completionRate > 0) {
      insights.push({
        type: 'danger',
        icon: AlertTriangle,
        title: '完成率偏低',
        message: '建议关注任务进度，提升完成效率'
      });
    }

    // 活跃度洞察
    if (coreMetrics.dailyAverage >= 5) {
      insights.push({
        type: 'success',
        icon: Zap,
        title: '工作活跃度高',
        message: `平均每日 ${coreMetrics.dailyAverage} 项操作`
      });
    } else if (coreMetrics.dailyAverage >= 2) {
      insights.push({
        type: 'info',
        icon: Users,
        title: '工作节奏稳定',
        message: '保持良好的工作节奏'
      });
    }

    // 瓶颈洞察
    if (coreMetrics.bottleneckColumn) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: '发现工作瓶颈',
        message: `"${coreMetrics.bottleneckColumn}" 列任务较多，建议优先处理`
      });
    }

    return insights;
  }, [coreMetrics]);

  // 列效率分析
  const columnEfficiency = useMemo(() => {
    return columns.map(column => {
      const columnCards = cards.filter(card => card.columnId === column.id);
      const completed = columnCards.filter(card => card.completed).length;
      const total = columnCards.length;
      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: column.title,
        efficiency,
        total,
        completed,
        color: column.color
      };
    });
  }, [cards, columns]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart3 className="w-4 h-4" />
          仪表板
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-primary" />
            智能看板仪表板
          </DialogTitle>
          <DialogDescription>
            深度分析您的工作效率与进度，提供智能洞察建议
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* 核心指标概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">总任务</p>
                  <p className="text-3xl font-bold">{coreMetrics.totalCards}</p>
                  <p className="text-xs text-muted-foreground mt-1">项任务</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
            </Card>

            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">已完成</p>
                  <p className="text-3xl font-bold text-green-600">{coreMetrics.completedCards}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {coreMetrics.completionRate}%
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
            </Card>

            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">日均活跃度</p>
                  <p className="text-3xl font-bold text-purple-600">{coreMetrics.dailyAverage}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {trendAnalysis.direction === 'up' ? (
                      <ArrowUp className="w-3 h-3 text-green-500" />
                    ) : trendAnalysis.direction === 'down' ? (
                      <ArrowDown className="w-3 h-3 text-red-500" />
                    ) : (
                      <Minus className="w-3 h-3 text-gray-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {trendAnalysis.percent}% vs 上周
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
            </Card>

            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">总操作数</p>
                  <p className="text-3xl font-bold text-orange-600">{coreMetrics.totalActivities}</p>
                  <p className="text-xs text-muted-foreground mt-1">项操作</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent" />
            </Card>
          </div>

          {coreMetrics.totalCards === 0 ? (
            <Card className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无数据</h3>
              <p className="text-muted-foreground">
                创建一些任务开始使用智能仪表板分析功能
              </p>
            </Card>
          ) : (
            <>
              {/* 智能洞察 */}
              {performanceInsights.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    智能洞察
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {performanceInsights.map((insight, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'success' ? 'border-l-green-500 bg-green-50' :
                        insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                        insight.type === 'danger' ? 'border-l-red-500 bg-red-50' :
                        'border-l-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start gap-3">
                          <insight.icon className={`w-5 h-5 flex-shrink-0 ${
                            insight.type === 'success' ? 'text-green-600' :
                            insight.type === 'warning' ? 'text-yellow-600' :
                            insight.type === 'danger' ? 'text-red-600' :
                            'text-blue-600'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{insight.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 双列布局：趋势图表 + 列效率 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 趋势分析 */}
                <Card className="p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">14天活动趋势</h3>
                    <Badge variant={
                      trendAnalysis.direction === 'up' ? 'default' : 
                      trendAnalysis.direction === 'down' ? 'destructive' : 'secondary'
                    } className="gap-1">
                      {trendAnalysis.direction === 'up' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : trendAnalysis.direction === 'down' ? (
                        <ArrowDown className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      {trendAnalysis.direction === 'stable' ? '稳定' : `${trendAnalysis.percent}%`}
                    </Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendAnalysis.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#4f46e5" 
                        strokeWidth={3}
                        dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                        name="总活动"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                        name="完成任务"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="created" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={{ fill: "#06b6d4", strokeWidth: 2, r: 3 }}
                        name="创建任务"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* 列效率分析 */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">列效率分析</h3>
                  <div className="space-y-4">
                    {columnEfficiency.map((column, index) => (
                      <div key={column.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: column.color }}
                            />
                            <span className="font-medium text-sm">{column.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold">{column.efficiency}%</span>
                            <p className="text-xs text-muted-foreground">
                              {column.completed}/{column.total}
                            </p>
                          </div>
                        </div>
                        <Progress value={column.efficiency} className="h-2" />
                      </div>
                    ))}
                    {columnEfficiency.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无列数据</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* 工作负载可视化 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">工作负载分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={columnEfficiency} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number, name: string) => [
                        value, 
                        name === 'total' ? '总任务' : '已完成'
                      ]}
                    />
                    <Bar dataKey="total" fill="#e2e8f0" name="总任务" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="#10b981" name="已完成" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
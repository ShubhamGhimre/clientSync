'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
  className,
}: MetricsCardProps) {
  const isPositive = trend === 'up';
  
  const getIconBgColor = (iconName: string) => {
    const iconColorMap: { [key: string]: string } = {
      'Bot': 'bg-blue-50',
      'MessageSquare': 'bg-indigo-50',
      'Users': 'bg-violet-50',
      'HelpCircle': 'bg-amber-50',
      'TrendingUp': 'bg-emerald-50',
      'Activity': 'bg-cyan-50',
      'BarChart3': 'bg-purple-50',
    };
    return iconColorMap[Icon.name] || 'bg-slate-50';
  };

  const getIconColor = (iconName: string) => {
    const iconColorMap: { [key: string]: string } = {
      'Bot': 'text-blue-600',
      'MessageSquare': 'text-indigo-600',
      'Users': 'text-violet-600',
      'HelpCircle': 'text-amber-600',
      'TrendingUp': 'text-emerald-600',
      'Activity': 'text-cyan-600',
      'BarChart3': 'text-purple-600',
    };
    return iconColorMap[Icon.name] || 'text-slate-600';
  };

  return (
    <Card className={cn(
      'border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 group',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-slate-600">
          {title}
        </CardTitle>
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
          getIconBgColor(Icon.name),
          'group-hover:scale-105'
        )}>
          <Icon className={cn('h-5 w-5', getIconColor(Icon.name))} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        <div className="flex items-center gap-2">
          {change && (
            <Badge
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-xs font-medium border',
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 text-red-700 hover:bg-red-50 border-red-200'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{change}</span>
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
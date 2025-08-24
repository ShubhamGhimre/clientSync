'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsChartProps {
  type: 
    | 'conversations' 
    | 'users' 
    | 'detailed-conversations' 
    | 'response-times' 
    | 'resolution' 
    | 'satisfaction';
}

// Sample data for different chart types
const conversationData = [
  { date: 'Jan', conversations: 1200, resolved: 1080, pending: 120 },
  { date: 'Feb', conversations: 1890, resolved: 1700, pending: 190 },
  { date: 'Mar', conversations: 2390, resolved: 2150, pending: 240 },
  { date: 'Apr', conversations: 3490, resolved: 3140, pending: 350 },
  { date: 'May', conversations: 4200, resolved: 3780, pending: 420 },
  { date: 'Jun', conversations: 5100, resolved: 4590, pending: 510 },
];

const userEngagementData = [
  { date: 'Jan', active: 890, new: 120, returning: 770 },
  { date: 'Feb', active: 1200, new: 180, returning: 1020 },
  { date: 'Mar', active: 1890, new: 240, returning: 1650 },
  { date: 'Apr', active: 2340, new: 320, returning: 2020 },
  { date: 'May', active: 3200, new: 420, returning: 2780 },
  { date: 'Jun', active: 3890, new: 520, returning: 3370 },
];

const responseTimeData = [
  { time: '00:00', avgTime: 1.2, targetTime: 2.0 },
  { time: '04:00', avgTime: 0.8, targetTime: 2.0 },
  { time: '08:00', avgTime: 2.1, targetTime: 2.0 },
  { time: '12:00', avgTime: 2.8, targetTime: 2.0 },
  { time: '16:00', avgTime: 2.2, targetTime: 2.0 },
  { time: '20:00', avgTime: 1.5, targetTime: 2.0 },
];

const satisfactionData = [
  { name: 'Very Satisfied', value: 45, color: '#22c55e' },
  { name: 'Satisfied', value: 35, color: '#84cc16' },
  { name: 'Neutral', value: 15, color: '#f59e0b' },
  { name: 'Dissatisfied', value: 3, color: '#f97316' },
  { name: 'Very Dissatisfied', value: 2, color: '#ef4444' },
];

const resolutionData = [
  { category: 'Technical', resolved: 85, unresolved: 15 },
  { category: 'Billing', resolved: 92, unresolved: 8 },
  { category: 'General', resolved: 78, unresolved: 22 },
  { category: 'Product', resolved: 88, unresolved: 12 },
  { category: 'Support', resolved: 95, unresolved: 5 },
];

const detailedConversationData = [
  { hour: '00', messages: 45, bots: 42, humans: 3 },
  { hour: '02', messages: 23, bots: 21, humans: 2 },
  { hour: '04', messages: 18, bots: 17, humans: 1 },
  { hour: '06', messages: 35, bots: 32, humans: 3 },
  { hour: '08', messages: 89, bots: 78, humans: 11 },
  { hour: '10', messages: 156, bots: 134, humans: 22 },
  { hour: '12', messages: 203, bots: 178, humans: 25 },
  { hour: '14', messages: 198, bots: 172, humans: 26 },
  { hour: '16', messages: 167, bots: 145, humans: 22 },
  { hour: '18', messages: 134, bots: 118, humans: 16 },
  { hour: '20', messages: 98, bots: 87, humans: 11 },
  { hour: '22', messages: 67, bots: 61, humans: 6 },
];

export function AnalyticsChart({ type }: AnalyticsChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'conversations':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={conversationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="conversations"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'users':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userEngagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="new"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'detailed-conversations':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={detailedConversationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bots" stackId="a" fill="#3b82f6" />
              <Bar dataKey="humans" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'response-times':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgTime"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Avg Response Time (s)"
              />
              <Line
                type="monotone"
                dataKey="targetTime"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
                name="Target Time (s)"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'resolution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" stackId="a" fill="#10b981" />
              <Bar dataKey="unresolved" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'satisfaction':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={satisfactionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {satisfactionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Chart type not implemented</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderChart()}
    </div>
  );
}
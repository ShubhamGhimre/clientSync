'use client';

import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { MetricsCard } from '@/components/charts/metrics-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, MessageSquare, Users, TrendingUp, Clock, Bot } from 'lucide-react';


export default function AnalyticsPage() {
  return (
    <div className="page stack g-6">
      <div className="row-between">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="t-muted">
            Monitor your chatbot performance and engagement metrics
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid-4">
        <MetricsCard
          title="Total Conversations"
          value="12,543"
          change="+12.5%"
          trend="up"
          icon={MessageSquare}
        />
        <MetricsCard
          title="Active Users"
          value="3,247"
          change="+5.2%"
          trend="up"
          icon={Users}
        />
        <MetricsCard
          title="Avg Response Time"
          value="1.2s"
          change="-8.1%"
          trend="down"
          icon={Clock}
        />
        <MetricsCard
          title="Satisfaction Rate"
          value="94.8%"
          change="+2.3%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      <Tabs defaultValue="overview" className="stack">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="stack">
          <div className="grid-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Volume</CardTitle>
                <CardDescription>Daily conversation trends</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="conversations" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="users" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Analytics</CardTitle>
              <CardDescription>Detailed conversation metrics and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart type="detailed-conversations" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="stack">
          <div className="grid-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>Average response time trends</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="response-times" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resolution Rate</CardTitle>
                <CardDescription>Successfully resolved queries</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="resolution" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction" className="stack">
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction</CardTitle>
              <CardDescription>User satisfaction scores and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart type="satisfaction" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
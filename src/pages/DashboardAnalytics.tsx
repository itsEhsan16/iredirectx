import React, { Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardAnalytics from '@/components/analytics/DashboardAnalytics';
import ThemeToggle from '@/components/ThemeToggle';

// Lazy load components with chunk naming and preload hints
const PerformanceMetrics = lazy(() => import(/* webpackChunkName: "analytics-performance" */ '@/components/analytics/PerformanceMetrics'));
const ExportReports = lazy(() => import(/* webpackChunkName: "analytics-export" */ '@/components/analytics/ExportReports'));

// Preload components when tab is hovered
const preloadComponent = (chunkName: string) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = `/assets/${chunkName}.js`;
  document.head.appendChild(link);
};

const handleTabHover = (tab: string) => {
  if (tab === 'performance') {
    preloadComponent('analytics-performance');
  } else if (tab === 'export') {
    preloadComponent('analytics-export');
  }
};

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background cosmic-grid">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive overview of your links performance
              </p>
            </div>
          </div>
          <ThemeToggle variant="switch" size="sm" />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 sm:py-8">

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3" onMouseEnter={(e) => {
          const tab = (e.target as HTMLElement).getAttribute('data-state');
          if (tab) handleTabHover(tab);
        }}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <DashboardAnalytics />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Suspense fallback={<div className="cosmic-card p-6 text-center">Loading performance metrics...</div>}>
            <PerformanceMetrics />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <Suspense fallback={<div className="cosmic-card p-6 text-center">Loading export options...</div>}>
            <ExportReports />
          </Suspense>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
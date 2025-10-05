import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Link, BarChart3, Settings, FileText } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BulkLinkOperations from '@/components/BulkLinkOperations';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);

  const { data: links } = useQuery({
    queryKey: ['dashboard-links-count'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('links')
        .select('id, click_count, active')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: recentLinks } = useQuery({
    queryKey: ['recent-links'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('links')
        .select('id, slug, destination_url, created_at, click_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate statistics
  const totalLinks = links?.length || 0;
  const totalClicks = links?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0;
  const activeLinks = links?.filter(link => link.active).length || 0;
  
  // Calculate this month's clicks (placeholder - would need click timestamps)
  const thisMonthClicks = totalClicks; // Simplified for now

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background cosmic-grid">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <RouterLink to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            iRedirectX
          </RouterLink>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-muted-foreground text-center sm:text-left">
              Welcome, {user?.email}
            </span>
            <ThemeToggle variant="switch" size="sm" />
            <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your short links and track their performance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="cosmic-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Links</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLinks}</div>
              <p className="text-xs text-muted-foreground">
                {totalLinks === 0 ? 'No links created yet' : `${totalLinks} links created`}
              </p>
            </CardContent>
          </Card>

          <Card className="cosmic-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                {totalClicks === 0 ? 'No clicks recorded' : `${totalClicks} total clicks`}
              </p>
            </CardContent>
          </Card>

          <Card className="cosmic-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Links</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLinks}</div>
              <p className="text-xs text-muted-foreground">
                {totalLinks === 0 ? 'No links created' : 
                 activeLinks === totalLinks ? 'All links active' : 
                 `${activeLinks}/${totalLinks} links active`}
              </p>
            </CardContent>
          </Card>

          <Card className="cosmic-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonthClicks}</div>
              <p className="text-xs text-muted-foreground">
                {thisMonthClicks === 0 ? 'No clicks this month' : `${thisMonthClicks} clicks this month`}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="cosmic-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with creating and managing your links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <RouterLink to="/dashboard/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Link
                </RouterLink>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <RouterLink to="/dashboard/links">
                  <Link className="mr-2 h-4 w-4" />
                  Manage Links
                </RouterLink>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <RouterLink to="/dashboard/organize">
                  <Settings className="mr-2 h-4 w-4" />
                  Organize Links
                </RouterLink>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <RouterLink to="/dashboard/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </RouterLink>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setBulkOperationsOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Bulk Import/Export
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <RouterLink to="/dashboard/redirect-rules">
                  <Settings className="mr-2 h-4 w-4" />
                  Custom Redirect Rules
                </RouterLink>
              </Button>
            </CardContent>
          </Card>

          <Card className="cosmic-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest link activity and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentLinks && recentLinks.length > 0 ? (
                <div className="space-y-4">
                  {recentLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">{link.slug}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.destination_url}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{link.click_count || 0} clicks</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(link.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Create your first link to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bulk Operations Dialog */}
      <Dialog open={bulkOperationsOpen} onOpenChange={setBulkOperationsOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Link Operations</DialogTitle>
            <DialogDescription>
              Import or export your links in bulk using CSV format
            </DialogDescription>
          </DialogHeader>
          <BulkLinkOperations onComplete={() => setBulkOperationsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
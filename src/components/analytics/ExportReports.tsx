import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Download, FileText, Table, BarChart, Calendar, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface ClickData {
  id: string;
  link_id: string;
  clicked_at: string;
  referrer: string | null;
  browser: string | null;
  device: string | null;
  os: string | null;
  ip_address: string | null;
}

interface LinkData {
  id: string;
  slug: string;
  destination_url: string;
  created_at: string;
  user_id: string;
  click_count?: number;
}

const ExportReports = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30days');
  const [reportType, setReportType] = useState('clicks');
  const [includeFields, setIncludeFields] = useState({
    date: true,
    time: true,
    referrer: true,
    browser: true,
    device: true,
    os: true,
    ip: false, // Default to false for privacy
  });

  // Calculate date range based on selection
  const dateRange = React.useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch(timeRange) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '14days':
        startDate.setDate(endDate.getDate() - 14);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    return { startDate, endDate };
  }, [timeRange]);

  // Fetch all links for the user with caching
  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ['export-links', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Fetch all clicks for the user's links with time range filter
  const { data: clicks, isLoading: clicksLoading } = useQuery({
    queryKey: ['export-clicks', user?.id, timeRange],
    queryFn: async () => {
      if (!user || !links || links.length === 0) return [];
      
      const linkIds = links.map(link => link.id);
      const { startDate } = dateRange;
      
      const { data, error } = await supabase
        .from('link_clicks')
        .select('*')
        .in('link_id', linkIds)
        .gte('clicked_at', startDate.toISOString())
        .order('clicked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!links && links.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const isLoading = linksLoading || clicksLoading;

  // Export to CSV function
  const exportToCSV = () => {
    if (!links || !clicks) return;

    let csvContent = '';
    let filename = '';
    
    if (reportType === 'clicks') {
      // Create headers based on selected fields
      const headers = [];
      if (includeFields.date) headers.push('Date');
      if (includeFields.time) headers.push('Time');
      headers.push('Link');
      if (includeFields.referrer) headers.push('Referrer');
      if (includeFields.browser) headers.push('Browser');
      if (includeFields.device) headers.push('Device');
      if (includeFields.os) headers.push('Operating System');
      if (includeFields.ip) headers.push('IP Address');
      
      csvContent = headers.join(',') + '\n';
      
      // Add data rows
      clicks.forEach(click => {
        const link = links.find(l => l.id === click.link_id);
        const clickDate = new Date(click.clicked_at);
        const row = [];
        
        if (includeFields.date) row.push(format(clickDate, 'yyyy-MM-dd'));
        if (includeFields.time) row.push(format(clickDate, 'HH:mm:ss'));
        row.push(link ? `/${link.slug}` : 'Unknown');
        if (includeFields.referrer) row.push(`"${click.referrer || 'Direct'}"`);
        if (includeFields.browser) row.push(click.browser || 'Unknown');
        if (includeFields.device) row.push(click.device || 'Unknown');
        if (includeFields.os) row.push(click.os || 'Unknown');
        if (includeFields.ip) row.push(click.ip_address || 'Unknown');
        
        csvContent += row.join(',') + '\n';
      });
      
      filename = `link_clicks_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else if (reportType === 'links') {
      // Link summary report
      csvContent = 'Link,Destination URL,Created Date,Total Clicks\n';
      
      links.forEach(link => {
        const linkClicks = clicks.filter(click => click.link_id === link.id).length;
        const row = [
          `/${link.slug}`,
          `"${link.destination_url}"`,
          format(new Date(link.created_at), 'yyyy-MM-dd'),
          linkClicks
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      filename = `links_summary_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else if (reportType === 'summary') {
      // Analytics summary report
      const totalClicks = clicks.length;
      const uniqueIPs = new Set(clicks.map(click => click.ip_address)).size;
      
      // Count clicks per day
      const clicksByDay = {};
      clicks.forEach(click => {
        const day = format(new Date(click.clicked_at), 'yyyy-MM-dd');
        clicksByDay[day] = (clicksByDay[day] || 0) + 1;
      });
      
      // Count referrers
      const referrers = {};
      clicks.forEach(click => {
        const referrer = click.referrer || 'Direct';
        referrers[referrer] = (referrers[referrer] || 0) + 1;
      });
      
      // Count devices
      const devices = {};
      clicks.forEach(click => {
        const device = click.device || 'Unknown';
        devices[device] = (devices[device] || 0) + 1;
      });
      
      // Create summary report
      csvContent = 'Metric,Value\n';
      csvContent += `Report Period,${format(dateRange.startDate, 'yyyy-MM-dd')} to ${format(dateRange.endDate, 'yyyy-MM-dd')}\n`;
      csvContent += `Total Links,${links.length}\n`;
      csvContent += `Total Clicks,${totalClicks}\n`;
      csvContent += `Unique Visitors,${uniqueIPs}\n`;
      csvContent += `Average Clicks Per Day,${(totalClicks / Object.keys(clicksByDay).length).toFixed(2)}\n\n`;
      
      csvContent += 'Date,Clicks\n';
      Object.entries(clicksByDay).sort().forEach(([day, count]) => {
        csvContent += `${day},${count}\n`;
      });
      
      csvContent += '\nTop Referrers\n';
      csvContent += 'Referrer,Count\n';
      Object.entries(referrers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([referrer, count]) => {
          csvContent += `"${referrer}",${count}\n`;
        });
      
      csvContent += '\nDevice Breakdown\n';
      csvContent += 'Device,Count\n';
      Object.entries(devices)
        .sort((a, b) => b[1] - a[1])
        .forEach(([device, count]) => {
          csvContent += `${device},${count}\n`;
        });
      
      filename = `analytics_summary_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    }
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle field inclusion
  const toggleField = (field: keyof typeof includeFields) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Export Reports</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="14days">Last 14 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="cosmic-card cosmic-glass">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs value={reportType} onValueChange={setReportType} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clicks">
                <BarChart className="h-4 w-4 mr-2" />
                Click Data
              </TabsTrigger>
              <TabsTrigger value="links">
                <Table className="h-4 w-4 mr-2" />
                Link Summary
              </TabsTrigger>
              <TabsTrigger value="summary">
                <FileText className="h-4 w-4 mr-2" />
                Analytics Summary
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="clicks" className="mt-4 space-y-4">
              <div className="text-sm">Export detailed information about each click on your links.</div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Include Fields:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="date" checked={includeFields.date} onCheckedChange={() => toggleField('date')} />
                    <Label htmlFor="date" className="text-sm">Date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="time" checked={includeFields.time} onCheckedChange={() => toggleField('time')} />
                    <Label htmlFor="time" className="text-sm">Time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="referrer" checked={includeFields.referrer} onCheckedChange={() => toggleField('referrer')} />
                    <Label htmlFor="referrer" className="text-sm">Referrer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="browser" checked={includeFields.browser} onCheckedChange={() => toggleField('browser')} />
                    <Label htmlFor="browser" className="text-sm">Browser</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="device" checked={includeFields.device} onCheckedChange={() => toggleField('device')} />
                    <Label htmlFor="device" className="text-sm">Device</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="os" checked={includeFields.os} onCheckedChange={() => toggleField('os')} />
                    <Label htmlFor="os" className="text-sm">OS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ip" checked={includeFields.ip} onCheckedChange={() => toggleField('ip')} />
                    <Label htmlFor="ip" className="text-sm">IP Address</Label>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${clicks?.length || 0} records available for export`}
              </div>
            </TabsContent>
            
            <TabsContent value="links" className="mt-4 space-y-4">
              <div className="text-sm">Export a summary of all your links with click counts.</div>
              <div className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${links?.length || 0} links available for export`}
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="mt-4 space-y-4">
              <div className="text-sm">Export a comprehensive analytics summary including trends and top referrers.</div>
              <div className="text-sm text-muted-foreground">
                Report includes daily click breakdown, top referrers, and device statistics.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Report Format</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">CSV Format (.csv)</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Compatible with Excel, Google Sheets, and other spreadsheet applications.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Date Range</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {timeRange === '7days' ? '7 days' : 
                 timeRange === '14days' ? '14 days' : 
                 timeRange === '30days' ? '30 days' : '90 days'} of data
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Data Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {reportType === 'clicks' ? 'Click Data' : 
                   reportType === 'links' ? 'Link Summary' : 'Analytics Summary'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {isLoading ? 'Loading...' : 
                 reportType === 'clicks' ? `${clicks?.length || 0} records` : 
                 reportType === 'links' ? `${links?.length || 0} links` : 
                 'Comprehensive analytics summary'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={exportToCSV} 
          disabled={isLoading || !links?.length || !clicks?.length}
          className="cosmic-card"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default ExportReports;
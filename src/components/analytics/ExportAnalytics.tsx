import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ClickData {
  clicked_at: string;
  id: string;
  link_id: string;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
}

interface LinkData {
  id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  description: string | null;
  active: boolean;
  click_count: number;
  created_at: string;
}

interface ExportAnalyticsProps {
  linkData: LinkData;
  clickData: ClickData[];
}

const ExportAnalytics: React.FC<ExportAnalyticsProps> = ({ linkData, clickData }) => {
  const exportToCSV = () => {
    // Format the data for CSV
    const headers = ['Date', 'Time', 'Referrer', 'Browser/Device', 'IP Address'];
    
    const rows = clickData.map(click => {
      const date = new Date(click.clicked_at);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      
      let referrer = 'Direct';
      if (click.referrer) {
        try {
          referrer = new URL(click.referrer).hostname;
        } catch {
          referrer = click.referrer;
        }
      }
      
      return [
        dateStr,
        timeStr,
        referrer,
        click.user_agent || 'Unknown',
        click.ip_address || 'Not recorded'
      ];
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${linkData.slug}-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      onClick={exportToCSV} 
      variant="outline" 
      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
    >
      <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      Export to CSV
    </Button>
  );
};

export default ExportAnalytics;
import React, { useRef, useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClickData {
  clicked_at: string;
  id: string;
  link_id: string;
  user_agent: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  // Other fields may be present
}

interface DeviceAnalyticsChartProps {
  clickData: ClickData[];
  title?: string;
}

const DeviceAnalyticsChart: React.FC<DeviceAnalyticsChartProps> = ({ 
  clickData, 
  title = 'Device & Browser Analytics' 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // Process data to show device and browser information
  const processData = () => {
    const deviceTypeCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    
    clickData.forEach(click => {
      // Use actual device_type field if available, fall back to parsing user_agent
      if (click.device_type) {
        const deviceName = click.device_type === 'mobile' ? 'Mobile' :
                          click.device_type === 'desktop' ? 'Desktop' :
                          click.device_type === 'tablet' ? 'Tablet' :
                          click.device_type === 'tv' ? 'TV/Console' : 'Other';
        deviceTypeCounts[deviceName] = (deviceTypeCounts[deviceName] || 0) + 1;
      } else if (click.user_agent) {
        // Fallback to user_agent parsing if device_type not available
        let device = 'Unknown';
        const ua = click.user_agent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
          device = 'Mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
          device = 'Tablet';
        } else if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) {
          device = 'Desktop';
        }
        deviceTypeCounts[device] = (deviceTypeCounts[device] || 0) + 1;
      }
      
      // Use actual browser field if available
      if (click.browser) {
        browserCounts[click.browser] = (browserCounts[click.browser] || 0) + 1;
      } else if (click.user_agent) {
        // Fallback to user_agent parsing if browser not available
        let browser = 'Unknown';
        if (click.user_agent.includes('Chrome') && !click.user_agent.includes('Edg')) {
          browser = 'Chrome';
        } else if (click.user_agent.includes('Firefox')) {
          browser = 'Firefox';
        } else if (click.user_agent.includes('Safari') && !click.user_agent.includes('Chrome')) {
          browser = 'Safari';
        } else if (click.user_agent.includes('Edg')) {
          browser = 'Edge';
        }
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      }
      
      // Use actual OS field if available
      if (click.os) {
        osCounts[click.os] = (osCounts[click.os] || 0) + 1;
      }
    });
    
    // Convert to array format for Recharts
    const deviceData = Object.entries(deviceTypeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    const browserData = Object.entries(browserCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    const osData = Object.entries(osCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    return {
      devices: deviceData.slice(0, 5), // Top 5 device types
      browsers: browserData.slice(0, 5), // Top 5 browsers
      os: osData.slice(0, 5) // Top 5 operating systems
    };
  };

  const { devices, browsers } = processData();
  
  // Combine data for the chart
  const chartData = [
    ...devices.map(item => ({ name: item.name, Devices: item.value })),
    ...browsers.map(item => ({ name: item.name, Browsers: item.value }))
  ];

  return (
    <Card className="w-full">
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="text-sm sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-1 sm:px-6 pb-3 sm:pb-6">
        <div className="h-[220px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: isMobile ? 2 : 5,
                right: isMobile ? 5 : 10,
                left: isMobile ? -5 : 0,
                bottom: isMobile ? 0 : 5,
              }}
            >
              <CartesianGrid strokeDasharray={isMobile ? "2 2" : "3 3"} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: isMobile ? 8 : 10 }}
                tickMargin={isMobile ? 5 : 8}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={isMobile ? 50 : 60}
              />
              <YAxis 
                tick={{ fontSize: isMobile ? 8 : 10 }}
                width={isMobile ? 25 : 30}
                tickCount={isMobile ? 3 : 5}
              />
              <Tooltip 
                contentStyle={{ fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '4px' : '8px' }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: isMobile ? '9px' : '12px', 
                  paddingTop: isMobile ? '5px' : '10px',
                  marginBottom: isMobile ? '-10px' : '0px'
                }}
                iconSize={isMobile ? 8 : 10}
              />
              <Bar dataKey="Devices" fill="#8884d8" barSize={isMobile ? 15 : 20} />
              <Bar dataKey="Browsers" fill="#82ca9d" barSize={isMobile ? 15 : 20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceAnalyticsChart;
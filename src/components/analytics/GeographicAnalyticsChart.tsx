import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ClickData {
  clicked_at: string;
  id: string;
  link_id: string;
  country_code?: string;
  country?: string;
  city?: string;
  // Other fields may be present
}

interface GeographicAnalyticsChartProps {
  clickData: ClickData[];
  title?: string;
  isLoading?: boolean;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D',
  '#a4de6c', '#d0ed57', '#ffc658', '#ff7300', '#8dd1e1', '#83a6ed'
];

const GeographicAnalyticsChart: React.FC<GeographicAnalyticsChartProps> = ({ 
  clickData, 
  title = 'Geographic Distribution',
  isLoading = false
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Process data to show geographic distribution
  const processData = () => {
    const countryCounts: Record<string, number> = {};
    
    clickData.forEach(click => {
      // Use country if available, otherwise use "Unknown"
      const country = click.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    
    // Convert to array format for Recharts
    return Object.entries(countryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by count descending
      .slice(0, 10); // Limit to top 10 countries
  };

  const data = processData();

  return (
    <div className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {isLoading ? (
          <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
            <Skeleton className="h-[180px] sm:h-[250px] w-full" />
          </div>
        ) : (
          <div className="h-[220px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                layout="vertical"
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: isMobile ? 50 : 80,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  scale="band" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  width={isMobile ? 50 : 80}
                />
                <Tooltip 
                  formatter={(value) => [`${value} clicks`, 'Clicks']}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Clicks" 
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default GeographicAnalyticsChart;
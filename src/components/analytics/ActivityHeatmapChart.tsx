import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface ClickData {
  clicked_at: string;
  id: string;
  link_id: string;
  // Other fields may be present
}

interface ActivityHeatmapChartProps {
  clickData: ClickData[];
  title?: string;
  isLoading?: boolean;
}

// Color scale for the heatmap
const getColor = (value: number, max: number) => {
  // Calculate color intensity based on value
  const intensity = Math.min(value / (max * 0.7), 1); // Cap at 70% of max for better visualization
  
  // Generate a color from blue to red based on intensity
  return `rgba(${Math.round(intensity * 255)}, ${Math.round(100 + (1-intensity) * 155)}, ${Math.round((1-intensity) * 255)}, 0.8)`;
};

const ActivityHeatmapChart: React.FC<ActivityHeatmapChartProps> = ({ 
  clickData, 
  title = 'Activity Heatmap',
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

  // Process data to create a heatmap of activity by day of week and hour of day
  const processData = () => {
    // Initialize counts for each day and hour
    const activityCounts: Record<string, Record<string, number>> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize the data structure
    days.forEach(day => {
      activityCounts[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        activityCounts[day][hour] = 0;
      }
    });
    
    // Count clicks by day and hour
    clickData.forEach(click => {
      const date = parseISO(click.clicked_at);
      const day = days[date.getDay()];
      const hour = date.getHours();
      
      activityCounts[day][hour] += 1;
    });
    
    // Convert to array format for Recharts
    const data = [];
    let maxCount = 0;
    
    days.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        const count = activityCounts[day][hour];
        if (count > maxCount) maxCount = count;
        
        data.push({
          x: hour,
          y: dayIndex,
          z: count,
          day,
          hour
        });
      }
    });
    
    return { data, maxCount };
  };

  const { data, maxCount } = processData();

  // Custom tooltip for the heatmap
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { day, hour, z } = payload[0].payload;
      const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      
      return (
        <div className="bg-card border border-border p-2 rounded-md shadow-md text-xs">
          <p className="font-medium">{day} at {formattedHour}</p>
          <p className="text-muted-foreground">{z} clicks</p>
        </div>
      );
    }
    
    return null;
  };

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
              <ScatterChart
                margin={{
                  top: 10,
                  right: 0,
                  bottom: 0,
                  left: isMobile ? 60 : 80,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Hour" 
                  domain={[0, 23]}
                  tickCount={isMobile ? 6 : 12}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5, fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Day" 
                  domain={[0, 6]}
                  tickCount={7}
                  tick={({ x, y, payload }) => {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    return (
                      <text x={x} y={y} dy={3} textAnchor="end" fill="#666" fontSize={isMobile ? 10 : 12}>
                        {days[payload.value]}
                      </text>
                    );
                  }}
                  width={isMobile ? 30 : 40}
                />
                <ZAxis type="number" dataKey="z" range={[0, 500]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Activity" data={data}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(entry.z, maxCount)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default ActivityHeatmapChart;
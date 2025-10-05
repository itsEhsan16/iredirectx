import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { format, parseISO, subDays, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClickData {
  clicked_at: string;
  id: string;
  link_id: string;
  // Other fields may be present
}

interface ClicksOverTimeChartProps {
  clickData: ClickData[];
  title?: string;
  days?: number;
}

const ClicksOverTimeChart: React.FC<ClicksOverTimeChartProps> = ({ 
  clickData, 
  title = 'Clicks Over Time', 
  days = 30 
}) => {
  // Process data to show clicks per day
  const processData = () => {
    const now = new Date();
    const startDate = startOfDay(subDays(now, days - 1));
    
    // Create an array with all days in the range
    const daysArray = Array.from({ length: days }, (_, i) => {
      const date = subDays(now, days - 1 - i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        clicks: 0,
      };
    });
    
    // Count clicks for each day
    clickData.forEach(click => {
      const clickDate = parseISO(click.clicked_at);
      if (clickDate >= startDate) {
        const dateStr = format(clickDate, 'yyyy-MM-dd');
        const dayData = daysArray.find(d => d.date === dateStr);
        if (dayData) {
          dayData.clicks += 1;
        }
      }
    });
    
    return daysArray;
  };

  const data = processData();

  return (
    <Card className="w-full">
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-1 sm:px-4 md:px-6 pb-3 sm:pb-6">
        <div className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: -5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const windowWidth = window.innerWidth;
                  return windowWidth < 640 ? format(parseISO(date), 'MM/dd') : format(parseISO(date), 'MMM dd');
                }}
                tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                tickMargin={window.innerWidth < 640 ? 5 : 8}
                interval={window.innerWidth < 640 ? 'equidistantPreserveStart' : 'preserveStartEnd'}
                height={window.innerWidth < 640 ? 30 : 35}
              />
              <YAxis 
                tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                width={window.innerWidth < 640 ? 25 : 30}
                tickCount={window.innerWidth < 640 ? 3 : 5}
              />
              <Tooltip 
                labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                formatter={(value) => [value, 'Clicks']}
                contentStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px', padding: window.innerWidth < 640 ? '4px 8px' : '8px 10px' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px', paddingTop: window.innerWidth < 640 ? '5px' : '10px' }}
                iconSize={window.innerWidth < 640 ? 8 : 10}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#8884d8"
                activeDot={{ r: window.innerWidth < 640 ? 4 : 6 }}
                strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                dot={{ r: window.innerWidth < 640 ? 2 : 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClicksOverTimeChart;
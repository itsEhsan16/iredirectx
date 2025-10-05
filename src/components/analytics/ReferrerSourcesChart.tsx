import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClickData {
  clicked_at: string;
  id: string;
  link_id: string;
  referrer: string | null;
  // Other fields may be present
}

interface ReferrerSourcesChartProps {
  clickData: ClickData[];
  title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ReferrerSourcesChart: React.FC<ReferrerSourcesChartProps> = ({ 
  clickData, 
  title = 'Referrer Sources' 
}) => {
  // Process data to show referrer sources
  const processData = () => {
    const referrerCounts: Record<string, number> = {};
    
    clickData.forEach(click => {
      let referrer = 'Direct';
      
      if (click.referrer) {
        try {
          const url = new URL(click.referrer);
          referrer = url.hostname;
        } catch (e) {
          // If parsing fails, use the raw referrer string or part of it
          referrer = click.referrer.split('/')[0] || 'Unknown';
        }
      }
      
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });
    
    // Convert to array format for Recharts
    return Object.entries(referrerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by count descending
      .slice(0, 6); // Limit to top 6 sources
  };

  const data = processData();

  // Use React.useEffect to handle window resize for responsive chart elements
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="text-sm sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
        <div className="h-[220px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={isMobile ? 0 : 10}
                outerRadius={isMobile ? 50 : 80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => {
                  // Shorter labels on mobile
                  const displayName = isMobile && name.length > 8 
                    ? `${name.substring(0, 6)}...` 
                    : name;
                  return `${displayName}: ${(percent * 100).toFixed(0)}%`;
                }}
                labelStyle={{ fontSize: isMobile ? '9px' : '12px' }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} clicks`, 'Count']}
                contentStyle={{ fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '4px' : '8px' }} 
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: isMobile ? '10px' : '12px', 
                  paddingTop: isMobile ? '5px' : '10px',
                  width: '100%',
                  marginLeft: isMobile ? '-10px' : '0'
                }}
                layout={isMobile ? 'vertical' : 'horizontal'}
                verticalAlign={isMobile ? 'bottom' : 'bottom'}
                align={isMobile ? 'center' : 'center'}
                iconSize={isMobile ? 8 : 10}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferrerSourcesChart;
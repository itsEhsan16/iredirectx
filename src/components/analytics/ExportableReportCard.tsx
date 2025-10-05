import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileDown, FileText, Calendar, Filter, FileType, BarChart, PieChart, Table, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExportableReportCardProps {
  isLoading?: boolean;
  onExport?: (format: string, timeRange: string, reportType?: string, includeCharts?: boolean) => void;
}

const ExportableReportCard: React.FC<ExportableReportCardProps> = ({
  isLoading = false,
  onExport = () => {},
}) => {
  const [format, setFormat] = React.useState('pdf');
  const [timeRange, setTimeRange] = React.useState('30days');
  const [reportType, setReportType] = React.useState('full');
  const [includeCharts, setIncludeCharts] = React.useState(true);

  const handleExport = () => {
    onExport(format, timeRange, reportType, includeCharts);
  };
  
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-400" />;
      case 'csv': return <Table className="h-4 w-4 text-green-400" />;
      case 'json': return <FileType className="h-4 w-4 text-blue-400" />;
      case 'excel': return <Table className="h-4 w-4 text-green-600" />;
      default: return <FileDown className="h-4 w-4" />;
    }
  };

  return (
    <Card className="cosmic-card cosmic-glass">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="text-base sm:text-lg">Export Analytics Report</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Options</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Time Range</span>
                    </label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="14days">Last 14 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Format</span>
                    </label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                        <SelectItem value="json">JSON Data</SelectItem>
                        <SelectItem value="excel">Excel Workbook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm flex items-center gap-1.5">
                      <BarChart className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Report Type</span>
                    </label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Report</SelectItem>
                        <SelectItem value="summary">Summary Only</SelectItem>
                        <SelectItem value="performance">Performance Metrics</SelectItem>
                        <SelectItem value="traffic">Traffic Analysis</SelectItem>
                        <SelectItem value="devices">Device Breakdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm flex items-center gap-1.5">
                      <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Include Charts</span>
                    </label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Button 
                        variant={includeCharts ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIncludeCharts(true)}
                        className="flex-1"
                      >
                        Yes
                      </Button>
                      <Button 
                        variant={!includeCharts ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIncludeCharts(false)}
                        className="flex-1"
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-sm font-medium">Selected Format:</div>
                <div className="flex items-center gap-1.5 text-sm">
                  {getFormatIcon(format)}
                  <span>
                    {format === 'pdf' ? 'PDF Document' : 
                     format === 'csv' ? 'CSV Spreadsheet' : 
                     format === 'json' ? 'JSON Data' : 
                     format === 'excel' ? 'Excel Workbook' : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleExport} 
                className="w-full flex items-center justify-center gap-2 cosmic-glass"
              >
                <FileDown className="h-4 w-4" />
                Export Report
              </Button>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 mt-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-500">Ready to Export</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your report will include data from {timeRange === '7days' ? 'the last 7 days' : 
                                                      timeRange === '14days' ? 'the last 14 days' : 
                                                      timeRange === '30days' ? 'the last 30 days' : 
                                                      timeRange === '90days' ? 'the last 90 days' : 'custom date range'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportableReportCard;
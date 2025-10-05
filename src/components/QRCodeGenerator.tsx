import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import clipboardCopy from 'clipboard-copy';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url, title }) => {
  const { toast } = useToast();
  const [size, setSize] = useState<number>(128);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [includeMargin, setIncludeMargin] = useState<boolean>(true);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Function to download QR code as SVG
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${title || 'qrcode'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);

    toast({
      title: 'QR Code downloaded',
      description: 'Your QR code has been downloaded as an SVG file.',
    });
  };

  // Function to copy QR code URL to clipboard
  const copyUrl = async () => {
    try {
      await clipboardCopy(url);
      toast({ title: 'URL copied to clipboard!' });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
  };

  // Function to share QR code (if Web Share API is available)
  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'QR Code',
          text: 'Check out this QR code',
          url: url,
        });
        toast({ title: 'Shared successfully!' });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast({
        title: 'Sharing not supported',
        description: 'Your browser does not support the Web Share API',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
        <CardTitle className="text-lg sm:text-xl">QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <QRCodeSVG
                id="qr-code-svg"
                value={url}
                size={size}
                bgColor={bgColor}
                fgColor={fgColor}
                level={level}
                includeMargin={includeMargin}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center w-full">
              <Button onClick={downloadQRCode} variant="outline" size="sm" className="flex items-center gap-1 text-xs sm:text-sm sm:gap-2">
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                Download
              </Button>
              <Button onClick={copyUrl} variant="outline" size="sm" className="flex items-center gap-1 text-xs sm:text-sm sm:gap-2">
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                Copy URL
              </Button>
              <Button onClick={shareQRCode} variant="outline" size="sm" className="flex items-center gap-1 text-xs sm:text-sm sm:gap-2">
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                Share
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-size" className="text-sm">Size: {size}px</Label>
              <Slider
                id="qr-size"
                min={64}
                max={256}
                step={8}
                value={[size]}
                onValueChange={(value) => setSize(value[0])}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bg-color" className="text-sm">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color-picker"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    id="bg-color"
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 text-xs sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fg-color" className="text-sm">Foreground Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="fg-color-picker"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    id="fg-color"
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="error-correction" className="text-sm">Error Correction Level</Label>
              <Select value={level} onValueChange={(value) => setLevel(value as 'L' | 'M' | 'Q' | 'H')}>
                <SelectTrigger id="error-correction" className="text-xs sm:text-sm">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (7%)</SelectItem>
                  <SelectItem value="M">Medium (15%)</SelectItem>
                  <SelectItem value="Q">Quartile (25%)</SelectItem>
                  <SelectItem value="H">High (30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-margin"
                checked={includeMargin}
                onChange={(e) => setIncludeMargin(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="include-margin">Include Margin</Label>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, FileText, AlertCircle, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Link {
  id?: string;
  slug: string;
  target_url: string;
  description?: string;
  active?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  expires_at?: string | null;
  tags?: string[];
}

interface BulkLinkOperationsProps {
  onComplete?: () => void;
}

const BulkLinkOperations: React.FC<BulkLinkOperationsProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [csvContent, setCsvContent] = useState<string>('');
  const [importPreview, setImportPreview] = useState<Link[]>([]);

  // Export links to CSV
  const exportLinks = async () => {
    if (!user) return;
    
    setIsExporting(true);
    
    try {
      // Fetch all user links
      const { data: links, error } = await supabase
        .from('links')
        .select('id, slug, destination_url, description, active, created_at, updated_at, expires_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (!links || links.length === 0) {
        toast({ title: 'No links to export' });
        return;
      }
      
      // Fetch tags for all links
      const { data: linkTags, error: tagsError } = await supabase
        .from('link_tags')
        .select('link_id, tags(name)')
        .in('link_id', links.map(link => link.id));
      
      if (tagsError) throw tagsError;
      
      // Create a map of link_id to tags
      const tagMap = new Map();
      if (linkTags) {
        linkTags.forEach(item => {
          if (!tagMap.has(item.link_id)) {
            tagMap.set(item.link_id, []);
          }
          if (item.tags && item.tags.name) {
            tagMap.get(item.link_id).push(item.tags.name);
          }
        });
      }
      
      // Convert to CSV
      const headers = ['slug', 'target_url', 'description', 'active', 'created_at', 'updated_at', 'expires_at', 'tags'];
      const csvRows = [
        headers.join(','),
        ...links.map(link => {
          const linkWithTags = {
            ...link,
            tags: tagMap.get(link.id) || []
          };
          
          return headers.map(header => {
            let value = linkWithTags[header as keyof typeof linkWithTags];
            
            // Handle special cases for CSV formatting
            if (value === null || value === undefined) return '';
            
            // Format tags as a semicolon-separated list
            if (header === 'tags' && Array.isArray(value)) {
              value = value.join(';');
            }
            
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            
            return String(value);
          }).join(',');
        })
      ];
      
      const csvString = csvRows.join('\n');
      
      // Create download link
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `links_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: `Exported ${links.length} links successfully` });
    } catch (error) {
      console.error('Error exporting links:', error);
      toast({
        title: 'Failed to export links',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file selection for import
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      parseCSVPreview(content);
    };
    reader.readAsText(file);
  };

  // Parse CSV for preview
  const parseCSVPreview = (content: string) => {
    try {
      const lines = content.split('\n');
      if (lines.length < 2) {
        setImportErrors(['CSV file must contain at least a header row and one data row']);
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['slug', 'target_url'];
      
      // Check if required headers exist
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        setImportErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
        return;
      }
      
      // Parse preview (up to 5 rows)
      const previewRows = lines.slice(1, 6).filter(line => line.trim() !== '');
      const preview: Link[] = previewRows.map(row => {
        const values = parseCSVRow(row);
        const link: Link = { slug: '', target_url: '' };
        
        headers.forEach((header, index) => {
          if (header === 'slug') link.slug = values[index]?.trim() || '';
          if (header === 'target_url') link.target_url = values[index]?.trim() || '';
          if (header === 'description') link.description = values[index]?.trim();
          if (header === 'active') link.active = values[index]?.toLowerCase() === 'true';
          if (header === 'expires_at') link.expires_at = values[index]?.trim() || null;
          if (header === 'tags' && values[index]) {
            link.tags = values[index].split(';').map(tag => tag.trim()).filter(tag => tag);
          }
        });
        
        return link;
      });
      
      setImportPreview(preview);
      setImportErrors([]);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setImportErrors(['Failed to parse CSV file. Please check the format.']);
    }
  };

  // Parse CSV row handling quoted values
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (i < row.length - 1 && row[i + 1] === '"') {
          // Double quotes inside quotes - add a single quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current);
    return result;
  };

  // Import links from CSV
  const importLinks = async () => {
    if (!user || !csvContent) return;
    
    setIsImporting(true);
    setImportErrors([]);
    
    try {
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const dataRows = lines.slice(1).filter(line => line.trim() !== '');
      
      const slugIndex = headers.indexOf('slug');
      const urlIndex = headers.indexOf('target_url');
      const descIndex = headers.indexOf('description');
      const activeIndex = headers.indexOf('active');
      const expiresAtIndex = headers.indexOf('expires_at');
      const tagsIndex = headers.indexOf('tags');
      
      if (slugIndex === -1 || urlIndex === -1) {
        throw new Error('CSV must contain slug and target_url columns');
      }
      
      const errors: string[] = [];
      const linksToInsert: Link[] = [];
      const tagsToProcess: {linkSlug: string, tags: string[]}[] = [];
      
      // Validate and prepare links
      for (let i = 0; i < dataRows.length; i++) {
        const values = parseCSVRow(dataRows[i]);
        const slug = values[slugIndex]?.trim();
        const targetUrl = values[urlIndex]?.trim();
        
        if (!slug || !targetUrl) {
          errors.push(`Row ${i + 2}: Missing slug or target URL`);
          continue;
        }
        
        // Check if slug is already taken
        const { data: existingLink } = await supabase
          .from('links')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        
        if (existingLink) {
          errors.push(`Row ${i + 2}: Slug "${slug}" is already taken`);
          continue;
        }
        
        const link: Link = {
          slug,
          target_url: targetUrl,
          user_id: user.id,
          active: activeIndex !== -1 ? values[activeIndex]?.toLowerCase() === 'true' : true,
        };
        
        if (descIndex !== -1 && values[descIndex]) {
          link.description = values[descIndex].trim();
        }
        
        if (expiresAtIndex !== -1 && values[expiresAtIndex]) {
          link.expires_at = values[expiresAtIndex].trim();
        }
        
        // Process tags if present
        if (tagsIndex !== -1 && values[tagsIndex]) {
          const tagsList = values[tagsIndex].split(';').map(tag => tag.trim()).filter(tag => tag);
          if (tagsList.length > 0) {
            tagsToProcess.push({linkSlug: slug, tags: tagsList});
          }
        }
        
        linksToInsert.push(link);
        
        // Update progress
        setImportProgress(Math.round(((i + 1) / dataRows.length) * 100));
      }
      
      // Insert valid links
      if (linksToInsert.length > 0) {
        const { data: insertedLinks, error } = await supabase
          .from('links')
          .insert(linksToInsert)
          .select('id, slug');
        
        if (error) throw error;
        
        // Process tags for inserted links
        if (insertedLinks && insertedLinks.length > 0 && tagsToProcess.length > 0) {
          const slugToIdMap = new Map(insertedLinks.map(link => [link.slug, link.id]));
          
          // Get existing tags or create new ones
          for (const {linkSlug, tags} of tagsToProcess) {
            const linkId = slugToIdMap.get(linkSlug);
            if (!linkId) continue;
            
            for (const tagName of tags) {
              // Check if tag exists
              const { data: existingTag } = await supabase
                .from('tags')
                .select('id')
                .eq('name', tagName)
                .eq('user_id', user.id)
                .maybeSingle();
              
              let tagId;
              
              if (existingTag) {
                tagId = existingTag.id;
              } else {
                // Create new tag
                const { data: newTag, error: tagError } = await supabase
                  .from('tags')
                  .insert({ name: tagName, user_id: user.id })
                  .select('id')
                  .single();
                
                if (tagError) {
                  console.error('Error creating tag:', tagError);
                  continue;
                }
                
                tagId = newTag.id;
              }
              
              // Create link-tag association
              await supabase
                .from('link_tags')
                .insert({ link_id: linkId, tag_id: tagId });
            }
          }
        }
        
        toast({ 
          title: `Imported ${linksToInsert.length} links successfully`,
          description: errors.length > 0 ? `${errors.length} links had errors` : undefined,
        });
        
        if (onComplete) onComplete();
      } else {
        toast({ 
          title: 'No valid links to import',
          variant: 'destructive',
        });
      }
      
      // Set errors if any
      if (errors.length > 0) {
        setImportErrors(errors);
      }
    } catch (error) {
      console.error('Error importing links:', error);
      toast({
        title: 'Failed to import links',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setCsvContent('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Link Operations</CardTitle>
        <CardDescription>
          Import or export your links in bulk using CSV format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export Links</TabsTrigger>
            <TabsTrigger value="import">Import Links</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="text-center py-6 border rounded-md">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-4">
                Export all your links as a CSV file
              </p>
              <div className="flex flex-col items-center gap-2">
                <Button 
                  onClick={exportLinks} 
                  disabled={isExporting}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export Links'}
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Info className="h-3 w-3 mr-1" />
                        <span>Includes tags and expiration dates</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The export includes all link data including tags and expiration dates.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isImporting}
                />
                <p className="text-xs text-muted-foreground">
                  CSV must include <code>slug</code> and <code>target_url</code> columns. 
                  Optional columns: <code>description</code>, <code>active</code>, <code>expires_at</code>, <code>tags</code> (semicolon-separated).
                </p>
              </div>
              
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Preview (first {importPreview.length} rows):</h4>
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Slug</th>
                          <th className="p-2 text-left">Target URL</th>
                          <th className="p-2 text-left">Description</th>
                          <th className="p-2 text-left">Active</th>
                          <th className="p-2 text-left">Expires At</th>
                          <th className="p-2 text-left">Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((link, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{link.slug}</td>
                            <td className="p-2 truncate max-w-[200px]">{link.target_url}</td>
                            <td className="p-2">{link.description || '-'}</td>
                            <td className="p-2">{link.active !== undefined ? String(link.active) : 'true'}</td>
                            <td className="p-2">{link.expires_at || '-'}</td>
                            <td className="p-2">{link.tags?.join(', ') || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {importErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {importErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        {csvContent && (
          <Button 
            onClick={importLinks} 
            disabled={isImporting || importErrors.length > 0}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import Links'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BulkLinkOperations;
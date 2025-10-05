import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useRealTimeQuery } from '@/hooks/use-real-time-query';
import clipboardCopy from 'clipboard-copy';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import LinkTagsManager from '@/components/LinkTagsManager';
import { 
  Search, 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Check,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  BarChart,
  BarChart3,
  QrCode,
  Tags,
  Clock,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import LinkExpirationSetting from './LinkExpirationSetting';

interface LinkTag {
  id: string;
  link_id: string;
  tag_id: string;
  tag?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Link {
  id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  description: string | null;
  active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

interface LinkTableProps {
  onEdit?: (link: Link) => void;
  refreshTrigger?: number;
}

const LinkTable: React.FC<LinkTableProps> = ({ onEdit, refreshTrigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Link>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; link?: Link }>({ open: false });
  const [copiedId, setCopiedId] = useState<string>('');
  const [qrDialog, setQrDialog] = useState<{ open: boolean; link?: Link }>({ open: false });
  const [tagDialog, setTagDialog] = useState<{ open: boolean; link?: Link }>({ open: false });
  const [linkTagsMap, setLinkTagsMap] = useState<Record<string, LinkTag[]>>({});
  const [expirationDialog, setExpirationDialog] = useState<{ open: boolean; link?: Link }>({ open: false });
  
  // Use React Query to fetch links
  const linksQuery = useQuery({
    queryKey: ['links', user?.id, sortField, sortDirection, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  
  // Add real-time capabilities to the query
  const enhancedQuery = useRealTimeQuery(linksQuery, {
    table: 'links',
    filter: 'user_id',
    filterValue: user?.id,
  });

  // Fetch tags for all links
  useEffect(() => {
    if (!user || !enhancedQuery.data || enhancedQuery.data.length === 0) return;
    
    const fetchAllLinkTags = async () => {
      try {
        const linkIds = enhancedQuery.data.map(link => link.id);
        const { data, error } = await supabase
          .from('link_tags')
          .select('*, tag:tags(*)')
          .in('link_id', linkIds);
          
        if (error) {
          // Check if the error is because the table doesn't exist
          if (error.code === 'PGRST205') {
            console.warn('The link_tags table does not exist yet. Please run the migration to create it.');
            // Set empty tags map to avoid repeated errors
            setLinkTagsMap({});
            return;
          }
          throw error;
        }
        
        // Group tags by link_id
        const tagsMap: Record<string, LinkTag[]> = {};
        data?.forEach(tag => {
          if (!tagsMap[tag.link_id]) {
            tagsMap[tag.link_id] = [];
          }
          tagsMap[tag.link_id].push(tag);
        });
        
        setLinkTagsMap(tagsMap);
      } catch (error) {
        console.error('Error fetching link tags:', error);
      }
    };
    
    fetchAllLinkTags();
  }, [user, enhancedQuery.data]);

  const handleSort = (field: keyof Link) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleLinkStatus = async (link: Link) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ active: !link.active })
        .eq('id', link.id);

      if (error) throw error;
      
      // Update the toast message to be more descriptive
      toast({
        title: `Link ${link.active ? 'deactivated' : 'activated'}`,
        description: `${link.slug} is now ${link.active ? 'inactive' : 'active'}`,
      });
      
      // No need to manually refresh - React Query will handle this
    } catch (error: any) {
      toast({
        title: 'Error updating link status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteLink = async (link: Link) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', link.id);

      if (error) throw error;
      
      toast({ title: 'Link deleted successfully' });
      // No need to manually refresh - React Query will handle this
    } catch (error: any) {
      toast({
        title: 'Error deleting link',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (slug: string, id: string) => {
    try {
      const url = `${window.location.origin}/${slug}`;
      await clipboardCopy(url);
      setCopiedId(id);
      toast({ 
        title: 'Copied to clipboard!',
        description: `${url}`,
      });
      setTimeout(() => setCopiedId(''), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
  };

  const filteredLinks = enhancedQuery.data ? enhancedQuery.data.filter(link => 
    link.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.destination_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  if (enhancedQuery.isLoading) {
    return (
      <div className="cosmic-card rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmic-card rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cosmic-glass pl-10"
          />
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <ExternalLink className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
          <p className="text-base sm:text-lg mb-2">
            {searchQuery ? 'No links found' : 'No links created yet'}
          </p>
          <p className="text-xs sm:text-sm">
            {searchQuery ? 'Try adjusting your search' : 'Create your first link to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
            <div className="col-span-3">
              <button
                onClick={() => handleSort('slug')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Short URL
                {sortField === 'slug' && (
                  sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </button>
            </div>
            <div className="col-span-4">Destination</div>
            <div className="col-span-1 text-center">
              <button
                onClick={() => handleSort('click_count')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Clicks
                {sortField === 'click_count' && (
                  sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </button>
            </div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Created
                {sortField === 'created_at' && (
                  sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </button>
            </div>
            <div className="col-span-1"></div>
          </div>

          {filteredLinks.map((link) => (
            <div key={link.id} className="task-card cosmic-glass rounded-lg p-3 sm:p-4 group">
              {/* Desktop View - Hidden on mobile */}
              <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm truncate">/{link.slug}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(link.slug, link.id)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === link.id ? 
                        <Check className="h-3 w-3" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                  {link.title && (
                    <div className="text-xs text-muted-foreground truncate">{link.title}</div>
                  )}
                  {/* Display expiration date if set */}
                  {link.expires_at && (
                    <div className="text-xs text-amber-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Expires: {new Date(link.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {/* Display tags */}
                  {linkTagsMap[link.id] && linkTagsMap[link.id].length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {linkTagsMap[link.id].map(linkTag => (
                        <Badge 
                          key={linkTag.id} 
                          variant="outline"
                          className="text-xs px-1 py-0 h-4"
                          style={{ backgroundColor: linkTag.tag?.color, color: '#fff' }}
                        >
                          {linkTag.tag?.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-4">
                  <div className="text-sm truncate" title={link.destination_url}>
                    {link.destination_url}
                  </div>
                  {link.description && (
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {link.description}
                    </div>
                  )}
                </div>

                <div className="col-span-1 text-center">
                  <div className="text-sm font-medium">{link.click_count || 0}</div>
                </div>

                <div className="col-span-1 text-center">
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant={link.active ? 'default' : 'secondary'} 
                      className={`text-xs cursor-pointer transition-all hover:scale-105 ${link.active ? 'hover:bg-green-600' : 'hover:bg-red-600'}`}
                      onClick={() => toggleLinkStatus(link)}
                    >
                      <span className={`mr-1 inline-block h-2 w-2 rounded-full ${link.active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      {link.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto"
                      onClick={() => toggleLinkStatus(link)}
                      title={link.active ? 'Deactivate link' : 'Activate link'}
                    >
                      {link.active ? 
                        <EyeOff className="h-3 w-3 text-muted-foreground" /> : 
                        <Eye className="h-3 w-3 text-muted-foreground" />}
                    </Button>
                  </div>
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLinkStatus(link)}
                      className="h-6 w-6 p-0"
                      title={link.active ? 'Deactivate' : 'Activate'}
                    >
                      {link.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="col-span-2 text-xs text-muted-foreground">
                  {new Date(link.created_at).toLocaleDateString()}
                </div>

                <div className="col-span-1">
                  <div className="flex justify-end items-center gap-1">
                    <div className="hidden sm:flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(link.slug, link.id)}
                        className="h-7 w-7 p-0"
                        title="Copy URL"
                      >
                        {copiedId === link.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/${link.slug}`, '_blank')}
                        className="h-7 w-7 p-0"
                        title="Open Link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/analytics/${link.id}`}
                        className="h-7 w-7 p-0"
                        title="Analytics"
                      >
                        <BarChart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="cosmic-glass">
                        <DropdownMenuItem onClick={() => copyToClipboard(link.slug, link.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => window.open(link.destination_url, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit Original
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => window.open(`/dashboard/analytics/${link.id}`, '_self')}
                        >
                          <BarChart className="mr-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => window.open(`/dashboard/redirect-rules/${link.id}`, '_self')}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Custom Redirects
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setQrDialog({ open: true, link })}
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          QR Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setTagDialog({ open: true, link })}>
                          <Tags className="mr-2 h-4 w-4" />
                          Manage Tags
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setExpirationDialog({ open: true, link })}>
                          <Clock className="mr-2 h-4 w-4" />
                          Set Expiration
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit?.(link)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleLinkStatus(link)}>
                         {link.active ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ open: true, link })}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              {/* Mobile View - Hidden on desktop */}
              <div className="sm:hidden space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm truncate">/{link.slug}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(link.slug, link.id)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedId === link.id ? 
                          <Check className="h-3 w-3" /> : 
                          <Copy className="h-3 w-3" />
                        }
                      </Button>
                    </div>
                    {link.title && (
                      <div className="text-xs text-muted-foreground truncate">{link.title}</div>
                    )}
                    {/* Display expiration date if set */}
                    {link.expires_at && (
                      <div className="text-xs text-amber-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Expires: {new Date(link.expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant={link.active ? 'default' : 'secondary'} 
                      className={`text-xs cursor-pointer transition-all hover:scale-105 ${link.active ? 'hover:bg-green-600' : 'hover:bg-red-600'}`}
                      onClick={() => toggleLinkStatus(link)}
                    >
                      <span className={`mr-1 inline-block h-2 w-2 rounded-full ${link.active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      {link.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto"
                      onClick={() => toggleLinkStatus(link)}
                      title={link.active ? 'Deactivate link' : 'Activate link'}
                    >
                      {link.active ? 
                        <EyeOff className="h-3 w-3 text-muted-foreground" /> : 
                        <Eye className="h-3 w-3 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs truncate" title={link.destination_url}>
                    {link.destination_url}
                  </div>
                  {link.description && (
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {link.description}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-muted-foreground">
                      {new Date(link.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{link.click_count || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => copyToClipboard(link.slug, link.id)}
                        title="Copy link"
                      >
                        {copiedId === link.id ? 
                          <Check className="h-3 w-3" /> : 
                          <Copy className="h-3 w-3" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => window.open(`/${link.slug}`, '_blank')}
                        title="Open link"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => window.location.href = `/dashboard/analytics/${link.id}`}
                        title="View analytics"
                      >
                        <BarChart className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => onEdit?.(link)}
                        title="Edit link"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="cosmic-glass">
                          <DropdownMenuItem onClick={() => setTagDialog({ open: true, link })}>
                            <Tags className="mr-2 h-4 w-4" />
                            Manage Tags
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setExpirationDialog({ open: true, link })}>
                            <Clock className="mr-2 h-4 w-4" />
                            Set Expiration
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setQrDialog({ open: true, link })}>
                            <QrCode className="mr-2 h-4 w-4" />
                            QR Code
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({ open: true, link })}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent className="cosmic-glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "/{deleteDialog.link?.slug}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.link && deleteLink(deleteDialog.link)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog.open} onOpenChange={(open) => !open && setQrDialog({ open: false })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code for /{qrDialog.link?.slug}</DialogTitle>
            <DialogDescription>
              Scan this QR code to access your short link
            </DialogDescription>
          </DialogHeader>
          {qrDialog.link && (
            <QRCodeGenerator 
              url={`${window.location.origin}/${qrDialog.link.slug}`} 
              title={qrDialog.link.title || qrDialog.link.slug}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Tag Management Dialog */}
      <Dialog open={tagDialog.open} onOpenChange={(open) => setTagDialog({ open, link: tagDialog.link })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Add or remove tags for /{tagDialog.link?.slug}
            </DialogDescription>
          </DialogHeader>
          {tagDialog.link && (
            <LinkTagsManager 
              linkId={tagDialog.link.id} 
              onTagsChange={() => {
                queryClient.invalidateQueries({ queryKey: ['links'] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Expiration Management Dialog */}
      <Dialog open={expirationDialog.open} onOpenChange={(open) => setExpirationDialog({ open, link: expirationDialog.link })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Link Expiration</DialogTitle>
            <DialogDescription>
              Set when this link will expire and become inactive
            </DialogDescription>
          </DialogHeader>
          {expirationDialog.link && (
            <LinkExpirationSetting 
              linkId={expirationDialog.link.id} 
              initialExpiresAt={expirationDialog.link.expires_at} 
              onExpirationChange={() => {
                queryClient.invalidateQueries({ queryKey: ['links'] });
                setExpirationDialog({ open: false });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkTable;
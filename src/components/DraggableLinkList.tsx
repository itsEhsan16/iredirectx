import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, ExternalLink, Copy, BarChart, Trash2 } from 'lucide-react';
import clipboardCopy from 'clipboard-copy';

interface Link {
  id: string;
  slug: string;
  target_url: string;
  active: boolean;
  sort_order?: number;
  created_at: string;
  click_count?: number;
}

interface DraggableLinkListProps {
  onLinkClick?: (link: Link) => void;
  onAnalyticsClick?: (link: Link) => void;
  onDeleteClick?: (link: Link) => void;
}

// Sortable Link Item Component
function SortableLinkItem({ 
  link, 
  copiedId, 
  onCopyToClipboard, 
  onOpenLink, 
  onAnalyticsClick, 
  onDeleteClick 
}: { 
  link: Link; 
  copiedId: string;
  onCopyToClipboard: (slug: string, id: string) => void;
  onOpenLink: (slug: string) => void;
  onAnalyticsClick?: (link: Link) => void;
  onDeleteClick?: (link: Link) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-2 sm:p-3 transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-primary/50 z-10' : ''
      }`}
    >
      {/* Mobile and desktop responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab hidden sm:block hover:text-primary transition-colors active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {/* Mobile drag handle and header */}
        <div className="flex items-center gap-2 sm:hidden w-full">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab hover:text-primary transition-colors active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-medium truncate text-sm flex-1">
            {link.slug}
          </h3>
          <Badge variant={link.active ? 'default' : 'secondary'} className="text-xs">
            {link.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        {/* Desktop content */}
        <div className="hidden sm:block flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">
              {link.slug}
            </h3>
            <Badge variant={link.active ? 'default' : 'secondary'} className="text-xs">
              {link.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {link.target_url}
          </p>
        </div>
        
        {/* Mobile content */}
        <div className="sm:hidden w-full">
          <p className="text-xs text-muted-foreground truncate">
            {link.target_url}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => onCopyToClipboard(link.slug, link.id)}
            title="Copy link"
          >
            <Copy className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${copiedId === link.id ? 'text-green-500' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => onOpenLink(link.slug)}
            title="Open link"
          >
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          
          {onAnalyticsClick && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              onClick={() => onAnalyticsClick(link)}
              title="View analytics"
            >
              <BarChart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
          
          {onDeleteClick && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:text-destructive"
              onClick={() => onDeleteClick(link)}
              title="Delete link"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

const DraggableLinkList: React.FC<DraggableLinkListProps> = ({
  onLinkClick,
  onAnalyticsClick,
  onDeleteClick,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string>('');
  
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch links with position ordering
  useEffect(() => {
    if (!user) return;
    
    const fetchLinks = async () => {
      setIsLoading(true);
      
      try {
        // Fetch links ordered by sort_order
        const { data, error } = await supabase
          .from('links')
          .select('*, clicks(count)')
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        // Process links to include click count
        const processedLinks = data.map(link => ({
          ...link,
          click_count: link.clicks?.length ? link.clicks[0].count : 0,
        }));
        
        setLinks(processedLinks);
      } catch (error) {
        console.error('Error fetching links:', error);
        toast({
          title: 'Failed to load links',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLinks();
  }, [user, toast]);

  // Handle drag end event
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const oldIndex = links.findIndex(link => link.id === active.id);
    const newIndex = links.findIndex(link => link.id === over.id);
    
    const reorderedLinks = arrayMove(links, oldIndex, newIndex);
    
    // Update sort_order
    const updatedLinks = reorderedLinks.map((link, index) => ({
      ...link,
      sort_order: index,
    }));
    
    // Update state optimistically
    setLinks(updatedLinks);
    
    // Update sort_order in database
    const updatePositions = async () => {
      try {
        const updates = updatedLinks.map(link => ({
          id: link.id,
          sort_order: link.sort_order,
        }));
        
        // Use Promise.all to update all sort_order in parallel
        await Promise.all(
          updates.map(update => 
            supabase
              .from('links')
              .update({ sort_order: update.sort_order })
              .eq('id', update.id)
          )
        );
        
        toast({ title: 'Link order updated' });
      } catch (error) {
        console.error('Error updating link positions:', error);
        toast({
          title: 'Failed to update link order',
          variant: 'destructive',
        });
        
        // Revert to original order on error
        setLinks(links);
      }
    };
    
    updatePositions();
  }

  // Copy link to clipboard
  const copyToClipboard = async (slug: string, id: string) => {
    try {
      const url = `${window.location.origin}/${slug}`;
      await clipboardCopy(url);
      setCopiedId(id);
      toast({ 
        title: 'Copied to clipboard!',
        description: url,
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

  // Open link in new tab
  const openLink = (slug: string) => {
    window.open(`/${slug}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6 sm:py-8">
        <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-3 sm:border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 border rounded-md border-dashed">
        <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-4">No links found</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={links.map(link => link.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {links.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              copiedId={copiedId}
              onCopyToClipboard={copyToClipboard}
              onOpenLink={openLink}
              onAnalyticsClick={onAnalyticsClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableLinkList;
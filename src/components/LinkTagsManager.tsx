import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Tag } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

interface LinkTag {
  id: string;
  link_id: string;
  tag_id: string;
}

interface LinkTagsManagerProps {
  linkId: string;
  onTagsChange?: () => void;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

const LinkTagsManager: React.FC<LinkTagsManagerProps> = ({ linkId, onTagsChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [linkTags, setLinkTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all user tags and link tags
  useEffect(() => {
    const fetchTags = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch all user tags
        const { data: userTags, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .eq('user_id', user.id);

        if (tagsError) {
          // Check if the error is because the table doesn't exist
          if (tagsError.code === 'PGRST205') {
            console.warn('The tags table does not exist yet. Please run the migration to create it.');
            setTags([]);
            setLinkTags([]);
            setIsLoading(false);
            return;
          }
          throw tagsError;
        }
        
        // Fetch tags for this specific link
        const { data: currentLinkTags, error: linkTagsError } = await supabase
          .from('link_tags')
          .select('tag_id')
          .eq('link_id', linkId);

        if (linkTagsError) {
          // Check if the error is because the table doesn't exist
          if (linkTagsError.code === 'PGRST205') {
            console.warn('The link_tags table does not exist yet. Please run the migration to create it.');
            setLinkTags([]);
            setTags(userTags || []);
            setIsLoading(false);
            return;
          }
          throw linkTagsError;
        }
        
        setTags(userTags || []);
        setLinkTags(currentLinkTags?.map(lt => lt.tag_id) || []);
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast({
          title: 'Failed to load tags',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [user, linkId, toast]);

  // Add a new tag
  const addTag = async () => {
    if (!user || !newTagName.trim()) return;
    
    try {
      // Generate a random color from the COLORS array
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      // Insert the new tag
      const { data: newTag, error } = await supabase
        .from('tags')
        .insert({
          name: newTagName.trim(),
          color: randomColor,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        // Check if the error is because the table doesn't exist
        if (error.code === 'PGRST205') {
          console.warn('The tags table does not exist yet. Please run the migration to create it.');
          toast({
            title: 'Tags feature not available',
            description: 'The tags table does not exist yet. Please run the migration to create it.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }
      
      setTags([...tags, newTag]);
      setNewTagName('');
      toast({ title: 'Tag created successfully' });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Failed to create tag',
        variant: 'destructive',
      });
    }
  };

  // Toggle a tag for the current link
  const toggleTag = async (tagId: string) => {
    if (!user) return;
    
    try {
      if (linkTags.includes(tagId)) {
        // Remove tag from link
        const { error } = await supabase
          .from('link_tags')
          .delete()
          .eq('link_id', linkId)
          .eq('tag_id', tagId);

        if (error) {
          // Check if the error is because the table doesn't exist
          if (error.code === 'PGRST205') {
            console.warn('The link_tags table does not exist yet. Please run the migration to create it.');
            toast({
              title: 'Tags feature not available',
              description: 'The link_tags table does not exist yet. Please run the migration to create it.',
              variant: 'destructive',
            });
            return;
          }
          throw error;
        }
        
        setLinkTags(linkTags.filter(id => id !== tagId));
      } else {
        // Add tag to link
        const { error } = await supabase
          .from('link_tags')
          .insert({
            link_id: linkId,
            tag_id: tagId,
          });

        if (error) {
          // Check if the error is because the table doesn't exist
          if (error.code === 'PGRST205') {
            console.warn('The link_tags table does not exist yet. Please run the migration to create it.');
            toast({
              title: 'Tags feature not available',
              description: 'The link_tags table does not exist yet. Please run the migration to create it.',
              variant: 'destructive',
            });
            return;
          }
          throw error;
        }
        
        setLinkTags([...linkTags, tagId]);
      }
      
      if (onTagsChange) onTagsChange();
    } catch (error) {
      console.error('Error toggling tag:', error);
      toast({
        title: 'Failed to update tags',
        variant: 'destructive',
      });
    }
  };

  // Delete a tag completely
  const deleteTag = async (tagId: string) => {
    if (!user) return;
    
    try {
      // Delete the tag
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) {
        // Check if the error is because the table doesn't exist
        if (error.code === 'PGRST205') {
          console.warn('The tags table does not exist yet. Please run the migration to create it.');
          toast({
            title: 'Tags feature not available',
            description: 'The tags table does not exist yet. Please run the migration to create it.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }
      
      setTags(tags.filter(tag => tag.id !== tagId));
      setLinkTags(linkTags.filter(id => id !== tagId));
      
      if (onTagsChange) onTagsChange();
      
      toast({ title: 'Tag deleted successfully' });
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Failed to delete tag',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {linkTags.map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          if (!tag) return null;
          
          return (
            <Badge 
              key={tag.id} 
              style={{ backgroundColor: tag.color }}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          );
        })}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 px-2 rounded-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              <Tag className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Add New Tag</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="h-8"
                  />
                  <Button 
                    size="sm" 
                    onClick={addTag} 
                    disabled={!newTagName.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Available Tags</h4>
                {isLoading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags created yet</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {tags.map(tag => (
                      <div key={tag.id} className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-muted flex-1"
                          onClick={() => toggleTag(tag.id)}
                        >
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                          {linkTags.includes(tag.id) && (
                            <Badge variant="outline" className="ml-auto text-xs h-5">
                              Added
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteTag(tag.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default LinkTagsManager;
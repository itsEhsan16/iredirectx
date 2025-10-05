import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, GripVertical, ExternalLink, Search, Save, Folder, Tag, Plus, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

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
  position?: number;
  category?: string | null;
  sort_order?: number;
  user_id?: string;
}

// Sortable Item Component
function SortableItem({ 
  link, 
  categories, 
  updateLinkCategory 
}: { 
  link: Link; 
  categories: string[]; 
  updateLinkCategory: (linkId: string, category: string) => void; 
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
    <div
      ref={setNodeRef}
      style={style}
      id={`link-${link.id}`}
      className={`flex items-center p-3 border border-border rounded-md bg-card hover:bg-accent/50 transition-colors ${
        isDragging ? 'shadow-lg ring-2 ring-primary/50 z-10' : ''
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="mr-3 text-muted-foreground cursor-grab hover:text-primary transition-colors active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <span className="font-medium truncate">{link.slug}</span>
          {link.active ? (
            <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500 border-green-500/20">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-2 bg-gray-500/10 text-gray-500 border-gray-500/20">
              Inactive
            </Badge>
          )}
        </div>
        
        {link.title && (
          <p className="text-sm text-muted-foreground truncate">{link.title}</p>
        )}
      </div>
      
      <div className="ml-4">
        <div className="relative">
          <select
            value={link.category || 'Uncategorized'}
            onChange={(e) => updateLinkCategory(link.id, e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Tag className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const OrganizeLinks: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>(['Uncategorized']);
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Fetch links with React Query
  const { data: links = [], isLoading } = useQuery<Link[]>({
    queryKey: ['links', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching links:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });
  
  // State for organized links
  const [organizedLinks, setOrganizedLinks] = useState<Link[]>([]);
  
  // State to track if we're in the middle of a drag operation
  const [isDragging, setIsDragging] = useState(false);
  
  // Initialize organized links when data is loaded
  useEffect(() => {
    if (links.length > 0) {
      // Add sort_order property if it doesn't exist
      const linksWithPosition = links.map((link, index) => ({
        ...link,
        sort_order: link.sort_order !== undefined ? link.sort_order : index,
        category: link.category || 'Uncategorized'
      }));
      
      setOrganizedLinks(linksWithPosition);
      
      // Extract unique categories
      const uniqueCategories = ['Uncategorized', ...new Set(linksWithPosition
        .filter(link => link.category && link.category !== 'Uncategorized')
        .map(link => link.category as string)
      )];
      
      setCategories(uniqueCategories);
    }
  }, [links]);
  
  // Filter links based on search query and active tab, maintaining sort_order
  const filteredLinks = organizedLinks
    .filter(link => {
      const matchesSearch = 
        link.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (link.description && link.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        activeTab === 'all' || 
        (activeTab === 'Uncategorized' && (!link.category || link.category === 'Uncategorized')) ||
        link.category === activeTab;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  
  // Handle drag start event
  function handleDragStart() {
    setIsDragging(true);
  }
  
  // Handle drag end event
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setIsDragging(false);
    
    if (!over || active.id === over.id) {
      return;
    }
    
    setOrganizedLinks((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        return items;
      }
      
      // Use arrayMove to reorder
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // Update sort_order for all items
      return newItems.map((item, index) => ({
        ...item,
        sort_order: index
      }));
    });
    
    // Add a subtle animation effect
    setTimeout(() => {
      const draggedLinkElement = document.getElementById(`link-${active.id}`);
      if (draggedLinkElement) {
        draggedLinkElement.classList.add('bg-primary/10');
        setTimeout(() => {
          draggedLinkElement.classList.remove('bg-primary/10');
        }, 800);
      }
    }, 100);
  }
  
  // Save link positions and categories to database
  const saveChanges = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Update each link with its new sort_order and category
      const updatePromises = organizedLinks.map((link, index) => {
        return supabase
          .from('links')
          .update({ 
            sort_order: index,
            category: link.category || null
          } as any)
          .eq('id', link.id);
      });
      
      await Promise.all(updatePromises);
      
      toast({
        title: 'Changes saved',
        description: 'Your link organization has been updated.',
        variant: 'default',
      });
      
      // Invalidate and refetch links
      queryClient.invalidateQueries({ queryKey: ['links', user.id] });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add a new category
  const addCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
    setActiveTab(newCategory.trim());
  };
  
  // Update link category
  const updateLinkCategory = (linkId: string, category: string) => {
    setOrganizedLinks(prev => 
      prev.map(link => 
        link.id === linkId ? { ...link, category } : link
      )
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background cosmic-grid">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Organize Links</h1>
                <p className="text-sm text-muted-foreground">
                  Arrange and categorize your links
                </p>
              </div>
            </div>
            <ThemeToggle variant="switch" size="sm" />
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="cosmic-card p-6 animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background cosmic-grid">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Organize Links</h1>
              <p className="text-sm text-muted-foreground">
                Arrange and categorize your links
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="switch" size="sm" />
            <Button onClick={saveChanges} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Folder className="mr-2 h-4 w-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category"
                    className="h-8"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addCategory}
                    disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  <Button 
                    variant={activeTab === 'all' ? 'default' : 'ghost'}
                    className="w-full justify-start h-8 px-2"
                    onClick={() => setActiveTab('all')}
                  >
                    All Links
                    <Badge variant="secondary" className="ml-2">
                      {links.length}
                    </Badge>
                  </Button>
                  
                  {categories.map(category => {
                    const categoryCount = links.filter(link => 
                      (category === 'Uncategorized' && (!link.category || link.category === 'Uncategorized')) || 
                      link.category === category
                    ).length;
                    return (
                      <Button 
                        key={category}
                        variant={activeTab === category ? 'default' : 'ghost'}
                        className="w-full justify-start h-8 px-2"
                        onClick={() => setActiveTab(category)}
                      >
                        {category}
                        <Badge variant="secondary" className="ml-2">
                          {categoryCount}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                {filteredLinks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-md p-6">
                    {searchQuery ? (
                      <>
                        <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-base font-medium mb-2">No links found</p>
                        <p className="text-sm">Try adjusting your search terms</p>
                      </>
                    ) : activeTab !== 'All' ? (
                      <>
                        <Folder className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-base font-medium mb-2">No links in this category</p>
                        <p className="text-sm">Drag and drop links here from other categories</p>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-base font-medium mb-2">No links available</p>
                        <p className="text-sm">Create some links to get started with organization</p>
                      </>
                    )}
                  </div>
                ) : (
                  <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={filteredLinks.map(link => link.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {filteredLinks.map((link) => (
                          <SortableItem
                            key={link.id}
                            link={link}
                            categories={categories}
                            updateLinkCategory={updateLinkCategory}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizeLinks;
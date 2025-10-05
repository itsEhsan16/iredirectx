import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Check, Copy, Tags, Clock } from 'lucide-react';
import clipboardCopy from 'clipboard-copy';
import LinkTagsManager from '@/components/LinkTagsManager';
import LinkExpirationSetting from './LinkExpirationSetting';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';

const linkFormSchema = z.object({
  destinationUrl: z.string().url('Please enter a valid URL'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Slug can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type LinkFormData = z.infer<typeof linkFormSchema>;

interface LinkFormProps {
  initialData?: Partial<LinkFormData & { id: string; expires_at: string | null }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LinkForm: React.FC<LinkFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [createdLinkId, setCreatedLinkId] = useState<string>('');

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      destinationUrl: initialData?.destinationUrl || '',
      slug: initialData?.slug || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
    },
  });

  const generateSlug = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      const randomString = Math.random().toString(36).substring(2, 8);
      return `${domain}-${randomString}`;
    } catch {
      return Math.random().toString(36).substring(2, 10);
    }
  };

  const onSubmit = async (data: LinkFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const slug = data.slug || generateSlug(data.destinationUrl);

      // Check if slug already exists
      const { data: existingLink } = await supabase
        .from('links')
        .select('id')
        .eq('slug', slug)
        .neq('id', initialData?.id || '')
        .single();

      if (existingLink) {
        form.setError('slug', { message: 'This slug is already taken' });
        setIsSubmitting(false);
        return;
      }

      const linkData = {
        user_id: user.id,
        destination_url: data.destinationUrl,
        slug,
        title: data.title || null,
        description: data.description || null,
        active: true,
      };

      if (initialData?.id) {
        // Update existing link
        const { error } = await supabase
          .from('links')
          .update(linkData)
          .eq('id', initialData.id);

        if (error) throw error;
        
        // Invalidate queries to trigger real-time updates
        queryClient.invalidateQueries({ queryKey: ['links'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-links'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-links-count'] });
        
        toast({ title: 'Link updated successfully!' });
      } else {
        // Create new link
        const { data: newLink, error } = await supabase
          .from('links')
          .insert(linkData)
          .select('id')
          .single();

        if (error) throw error;
        
        // Save the created link ID for tag management
        if (newLink) {
          setCreatedLinkId(newLink.id);
        }
        
        // Invalidate queries to trigger real-time updates
        queryClient.invalidateQueries({ queryKey: ['links'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-links'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-links-count'] });
        
        const shortUrl = `${window.location.origin}/${slug}`;
        setGeneratedUrl(shortUrl);
        toast({ title: 'Link created successfully!' });
      }

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await clipboardCopy(generatedUrl);
      setCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
  };

  if (generatedUrl && !initialData?.id) {
    return (
      <div className="cosmic-card rounded-lg p-6 space-y-4">
        <div className="text-center space-y-4">
          <div className="cosmic-glow">
            <Check className="h-12 w-12 text-primary mx-auto" />
          </div>
          <h3 className="text-lg font-semibold">Link Created Successfully!</h3>
          <div className="cosmic-glass rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>Original URL</span>
            </div>
            <p className="text-sm break-all">{form.getValues('destinationUrl')}</p>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Link className="h-4 w-4" />
              <span>Short URL</span>
            </div>
            <div className="flex items-center gap-2">
              <Input value={generatedUrl} readOnly className="text-primary font-medium" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {createdLinkId && (
            <div className="cosmic-glass rounded-md p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tags className="h-4 w-4" />
                <span>Add Tags</span>
              </div>
              <LinkTagsManager linkId={createdLinkId} />
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setGeneratedUrl('');
                setCreatedLinkId('');
                form.reset();
              }}
              className="flex-1"
            >
              Create Another
            </Button>
            <Button
              type="button"
              onClick={onSuccess}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="destinationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/long-url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Slug (Optional)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">{window.location.origin}/</div>
                  <Input placeholder="custom-slug" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Link title for your reference" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add a description for your reference" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {initialData?.id && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tags className="h-4 w-4" />
              <span>Tags</span>
            </div>
            <LinkTagsManager linkId={initialData.id} onTagsChange={() => queryClient.invalidateQueries({ queryKey: ['links'] })} />
            
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expiration</span>
            </div>
            <LinkExpirationSetting 
              linkId={initialData.id} 
              initialExpiresAt={initialData.expires_at} 
              onExpirationChange={() => queryClient.invalidateQueries({ queryKey: ['links'] })}
            />
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Link' : 'Create Link'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LinkForm;
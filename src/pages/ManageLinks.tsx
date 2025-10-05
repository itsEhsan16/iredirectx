import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LinkForm from '@/components/LinkForm';
// Import lazy-loaded LinkTable instead of direct import
import { LazyLinkTable } from '@/components/LazyComponents';
import { useQueryClient } from '@tanstack/react-query';
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
}

const ManageLinks = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editDialog, setEditDialog] = useState<{ open: boolean; link?: Link }>({ open: false });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (link: Link) => {
    setEditDialog({ open: true, link });
  };

  const handleEditSuccess = () => {
    setEditDialog({ open: false });
    // Invalidate and refetch links query
    queryClient.invalidateQueries({ queryKey: ['links'] });
    setRefreshTrigger(prev => prev + 1);
  };

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
              <h1 className="text-xl font-semibold">Manage Links</h1>
              <p className="text-sm text-muted-foreground">
                View, edit, and manage all your shortened links
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="switch" size="sm" />
            <Button
              onClick={() => navigate('/dashboard/create')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Link
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <LazyLinkTable 
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      </main>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open })}>
        <DialogContent className="cosmic-glass max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          {editDialog.link && (
            <LinkForm
              initialData={{
                id: editDialog.link.id,
                destinationUrl: editDialog.link.destination_url,
                slug: editDialog.link.slug,
                title: editDialog.link.title || '',
                description: editDialog.link.description || '',
              }}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditDialog({ open: false })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageLinks;
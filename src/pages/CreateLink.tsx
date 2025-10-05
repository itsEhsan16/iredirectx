import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LinkForm from '@/components/LinkForm';
import ThemeToggle from '@/components/ThemeToggle';

const CreateLink = () => {
  const navigate = useNavigate();

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
              <h1 className="text-xl font-semibold">Create New Link</h1>
              <p className="text-sm text-muted-foreground">
                Shorten your URL and make it easy to share
              </p>
            </div>
          </div>
          <ThemeToggle variant="switch" size="sm" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <LinkForm
            onSuccess={() => navigate('/dashboard')}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      </main>
    </div>
  );
};

export default CreateLink;
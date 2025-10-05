import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LinkExpirationSettingProps {
  linkId: string;
  initialExpiresAt: string | null;
  onExpirationChange?: (expiresAt: string | null) => void;
}

const LinkExpirationSetting: React.FC<LinkExpirationSettingProps> = ({
  linkId,
  initialExpiresAt,
  onExpirationChange,
}) => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState<boolean>(!!initialExpiresAt);
  const [date, setDate] = useState<Date | undefined>(
    initialExpiresAt ? new Date(initialExpiresAt) : undefined
  );
  const [time, setTime] = useState<string>(
    initialExpiresAt 
      ? format(new Date(initialExpiresAt), 'HH:mm') 
      : '23:59'
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Update expiration in database
  const updateExpiration = async () => {
    if (!linkId) return;
    
    setIsUpdating(true);
    
    try {
      let expiresAt: string | null = null;
      
      if (isEnabled && date) {
        // Combine date and time
        const [hours, minutes] = time.split(':').map(Number);
        const expirationDate = new Date(date);
        expirationDate.setHours(hours, minutes, 0, 0);
        expiresAt = expirationDate.toISOString();
      }
      
      const { error } = await supabase
        .from('links')
        .update({ expires_at: expiresAt })
        .eq('id', linkId);
      
      if (error) throw error;
      
      toast({ title: 'Expiration updated successfully' });
      
      if (onExpirationChange) {
        onExpirationChange(expiresAt);
      }
    } catch (error) {
      console.error('Error updating expiration:', error);
      toast({
        title: 'Failed to update expiration',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle toggle change
  const handleToggleChange = (checked: boolean) => {
    setIsEnabled(checked);
    
    if (!checked) {
      // If disabling, clear the expiration immediately
      updateExpiration();
    }
  };

  // Generate time options for select
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="expiration-toggle">Link Expiration</Label>
          <div className="text-sm text-muted-foreground">
            Set a date and time when this link will expire
          </div>
        </div>
        <Switch
          id="expiration-toggle"
          checked={isEnabled}
          onCheckedChange={handleToggleChange}
        />
      </div>

      {isEnabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiration-date" className="text-sm">Expiration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="expiration-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2 text-xs sm:text-sm",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="expiration-time" className="text-sm">Expiration Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="expiration-time" className="mt-2 text-xs sm:text-sm">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeOptions().map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {timeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={updateExpiration} 
            disabled={!date || isUpdating}
            className="w-full sm:w-auto"
            size="sm"
          >
            {isUpdating ? 'Updating...' : 'Save Expiration'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LinkExpirationSetting;
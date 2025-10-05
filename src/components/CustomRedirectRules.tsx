import React, { useState, useEffect } from 'react';
import { PlusCircle, X, ChevronDown, ChevronUp, Smartphone, Globe, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RedirectRule {
  id: string;
  type: 'device' | 'location' | 'time';
  condition: string;
  destination_url: string;
  active: boolean;
  priority?: number;
  link_id?: string;
}

interface CustomRedirectRulesProps {
  linkId: string;
  initialRules?: RedirectRule[];
  onRulesChange?: (rules: RedirectRule[]) => void;
}

const CustomRedirectRules: React.FC<CustomRedirectRulesProps> = ({
  linkId,
  initialRules = [],
  onRulesChange,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use React Query to fetch rules
  const { data: rules = initialRules, isLoading: isLoadingRules } = useQuery({
    queryKey: ['redirect-rules', linkId],
    queryFn: async () => {
      if (!linkId) return initialRules;
      
      try {
        const { data, error } = await supabase
          .from('links')
          .select('redirect_rules')
          .eq('id', linkId)
          .single();
        
        if (error) throw error;
        
        return data?.redirect_rules || initialRules;
      } catch (error) {
        console.error('Error fetching redirect rules:', error);
        toast({
          title: 'Failed to load redirect rules',
          variant: 'destructive',
        });
        return initialRules;
      }
    },
    enabled: !!linkId,
    initialData: initialRules,
  });

  // Save rules mutation
  const saveRulesMutation = useMutation({
    mutationFn: async (updatedRules: RedirectRule[]) => {
      if (!linkId) return updatedRules;
      
      try {
        // Add priority to each rule
        const rulesWithPriority = updatedRules.map((rule, index) => ({
          ...rule,
          priority: index,
        }));
        
        const { error } = await supabase
          .from('links')
          .update({ redirect_rules: rulesWithPriority })
          .eq('id', linkId);
        
        if (error) throw error;
        
        return rulesWithPriority;
      } catch (error) {
        console.error('Error saving redirect rules:', error);
        throw error;
      }
    },
    onSuccess: (updatedRules) => {
      toast({ title: 'Redirect rules saved successfully' });
      
      if (onRulesChange) {
        onRulesChange(updatedRules);
      }
      
      queryClient.invalidateQueries({ queryKey: ['redirect-rules', linkId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to save redirect rules',
        variant: 'destructive',
      });
    },
  });
  
  // Save rules to database
  const saveRules = () => {
    saveRulesMutation.mutate(rules);
  };

  // Add a new rule
  const addRule = () => {
    const newRule: RedirectRule = {
      id: crypto.randomUUID(),
      type: 'device',
      condition: 'mobile',
      destination_url: '',
      active: true,
      link_id: linkId,
      priority: rules.length,
    };
    
    queryClient.setQueryData(['redirect-rules', linkId], [...rules, newRule]);
  };

  // Remove a rule
  const removeRule = (id: string) => {
    queryClient.setQueryData(
      ['redirect-rules', linkId], 
      rules.filter(rule => rule.id !== id)
    );
  };

  // Update a rule
  const updateRule = (id: string, field: keyof RedirectRule, value: any) => {
    queryClient.setQueryData(
      ['redirect-rules', linkId],
      rules.map(rule => {
        if (rule.id === id) {
          return { ...rule, [field]: value };
        }
        return rule;
      })
    );
  };

  // Get condition options based on rule type
  const getConditionOptions = (type: string) => {
    switch (type) {
      case 'device':
        return [
          { value: 'mobile', label: 'Mobile Devices' },
          { value: 'desktop', label: 'Desktop Computers' },
          { value: 'tablet', label: 'Tablets' },
          { value: 'ios', label: 'iOS Devices' },
          { value: 'android', label: 'Android Devices' },
        ];
      case 'location':
        return [
          { value: 'us', label: 'United States' },
          { value: 'eu', label: 'Europe' },
          { value: 'asia', label: 'Asia' },
          { value: 'other', label: 'Other Regions' },
        ];
      case 'time':
        return [
          { value: 'weekday', label: 'Weekdays' },
          { value: 'weekend', label: 'Weekends' },
          { value: 'business_hours', label: 'Business Hours (9AM-5PM)' },
          { value: 'after_hours', label: 'After Hours' },
        ];
      default:
        return [];
    }
  };

  // Get icon based on rule type
  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'device':
        return <Smartphone className="h-4 w-4" />;
      case 'location':
        return <Globe className="h-4 w-4" />;
      case 'time':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
        <CardTitle className="text-lg sm:text-xl">Custom Redirect Rules</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Create conditional redirects based on device, location, or time
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        {rules.length === 0 ? (
          <div className="text-center py-4 sm:py-6 border rounded-md border-dashed">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              No redirect rules configured yet
            </p>
            <Button onClick={addRule} variant="outline" size="sm" className="text-xs sm:text-sm">
              <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Add Your First Rule
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-3 sm:space-y-4">
            {rules.map((rule, index) => (
              <AccordionItem key={rule.id} value={rule.id} className="border rounded-md p-1 sm:p-2">
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {getRuleIcon(rule.type)}
                    <span className="font-medium text-xs sm:text-sm">
                      Rule {index + 1}: {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)} Based
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-5 sm:h-6 px-1 sm:px-2 text-xs sm:text-sm ${rule.active ? 'text-green-500' : 'text-muted-foreground'}`}
                      onClick={() => updateRule(rule.id, 'active', !rule.active)}
                    >
                      {rule.active ? 'Active' : 'Inactive'}
                    </Button>
                    <AccordionTrigger className="h-5 w-5 sm:h-6 sm:w-6 p-0" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive"
                      onClick={() => removeRule(rule.id)}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
                
                <AccordionContent className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Rule Type</Label>
                      <Select
                        value={rule.type}
                        onValueChange={(value) => updateRule(rule.id, 'type', value)}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder="Select rule type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="device">Device Type</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="time">Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Condition</Label>
                      <Select
                        value={rule.condition}
                        onValueChange={(value) => updateRule(rule.id, 'condition', value)}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {getConditionOptions(rule.type).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Redirect URL</Label>
                    <Input
                      placeholder="https://example.com"
                      value={rule.destination_url}
                      onChange={(e) => updateRule(rule.id, 'destination_url', e.target.value)}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4 sm:px-6 sm:pb-6 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
        <Button 
          variant="outline" 
          onClick={addRule}
          disabled={isLoading}
          className="text-xs sm:text-sm w-full sm:w-auto"
          size="sm"
        >
          <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Add Rule
        </Button>
        <Button 
          onClick={saveRules} 
          disabled={isLoadingRules || saveRulesMutation.isPending || rules.some(rule => !rule.destination_url)}
          className="text-xs sm:text-sm w-full sm:w-auto"
          size="sm"
        >
          {saveRulesMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save Rules'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomRedirectRules;
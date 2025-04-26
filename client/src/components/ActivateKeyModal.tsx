import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema for license key activation
const activateKeySchema = z.object({
  key: z.string().min(10, 'Please enter a valid license key')
});

interface ActivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivateKeyModal({ isOpen, onClose }: ActivateKeyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form for activating a license key
  const form = useForm<z.infer<typeof activateKeySchema>>({
    resolver: zodResolver(activateKeySchema),
    defaultValues: {
      key: ''
    }
  });
  
  // Activate key mutation
  const activateKeyMutation = useMutation({
    mutationFn: async (values: z.infer<typeof activateKeySchema>) => {
      const response = await apiRequest('POST', '/api/license/activate', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/license/status'] });
      toast({
        title: "License Activated",
        description: "Your license key has been successfully activated.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Activation Failed",
        description: error.message || "The license key could not be activated. Please check the key and try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: z.infer<typeof activateKeySchema>) => {
    activateKeyMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-surface text-foreground">
        <DialogHeader>
          <DialogTitle>Activate License Key</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="TWITCH-XXXX-XXXX-XXXX" 
                      className="bg-surfaceLight border-gray-700 font-mono"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-sm text-textSecondary">
              <p>Enter your license key to activate premium features. If you don't have a key yet, please contact support or purchase one from an authorized reseller.</p>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-surfaceLight border-gray-700 text-foreground"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gradient-premium"
                disabled={activateKeyMutation.isPending}
              >
                {activateKeyMutation.isPending ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Activating...
                  </>
                ) : (
                  'Activate License'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LicenseKey } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

const generateKeySchema = z.object({
  keyType: z.string().min(1, 'Key type is required'),
  durationDays: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  count: z.coerce.number().min(1, 'Must generate at least 1 key').max(100, 'Cannot generate more than 100 keys at once'),
  prefix: z.string().optional()
});

export default function AdminKeyGeneration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerateKeyOpen, setIsGenerateKeyOpen] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<LicenseKey[]>([]);
  
  // Load license keys from API
  const { data: licenseKeys = [], isLoading } = useQuery<LicenseKey[]>({
    queryKey: ['/api/admin/keys'],
  });
  
  // Form for generating keys
  const form = useForm<z.infer<typeof generateKeySchema>>({
    resolver: zodResolver(generateKeySchema),
    defaultValues: {
      keyType: 'standard',
      durationDays: 30,
      count: 10,
      prefix: 'TWITCH'
    }
  });
  
  // Generate keys mutation
  const generateKeysMutation = useMutation({
    mutationFn: async (values: z.infer<typeof generateKeySchema>) => {
      const response = await apiRequest('POST', '/api/admin/keys/generate', values);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedKeys(data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/keys'] });
      toast({
        title: "Keys Generated",
        description: `Successfully generated ${data.length} license keys.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Generate Keys",
        description: error.message || "An error occurred while generating keys.",
        variant: "destructive",
      });
    }
  });
  
  // Revoke key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest('POST', '/api/admin/keys/revoke', { key });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/keys'] });
      toast({
        title: "Key Revoked",
        description: "The license key has been successfully revoked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Revoke Key",
        description: error.message || "An error occurred while revoking the key.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: z.infer<typeof generateKeySchema>) => {
    generateKeysMutation.mutate(values);
  };
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Key Copied",
      description: "The license key has been copied to clipboard.",
      variant: "default",
    });
  };
  
  const handleRevokeKey = (key: string) => {
    if (confirm('Are you sure you want to revoke this key? This action cannot be undone.')) {
      revokeKeyMutation.mutate(key);
    }
  };
  
  // Get key status label and class
  const getKeyStatus = (key: LicenseKey): { label: string; className: string } => {
    if (key.revokedAt) {
      return { 
        label: 'Revoked', 
        className: 'bg-error bg-opacity-20 text-error' 
      };
    } else if (key.usedAt) {
      return { 
        label: 'Active', 
        className: 'bg-info bg-opacity-20 text-info' 
      };
    } else {
      return { 
        label: 'Unused', 
        className: 'bg-success bg-opacity-20 text-success' 
      };
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">License Key Management</h2>
        <Button 
          onClick={() => setIsGenerateKeyOpen(true)}
          className="px-3 py-1.5 gradient-gold text-gray-900 hover:opacity-90 transition-opacity rounded-md text-sm font-medium shadow-gold"
        >
          <i className="fas fa-key mr-2"></i>
          Generate New Keys
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Generation Form */}
        <div className="premium-border lg:col-span-1">
          <div className="bg-surface rounded-lg shadow-sm p-5">
            <h3 className="text-md font-semibold mb-4">Key Generation</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="keyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-surfaceLight border-gray-700">
                            <SelectValue placeholder="Select a key type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-surface border-gray-700">
                          <SelectItem value="standard">Standard (30 days)</SelectItem>
                          <SelectItem value="premium">Premium (90 days)</SelectItem>
                          <SelectItem value="lifetime">Lifetime</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="durationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          className="bg-surfaceLight border-gray-700" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Keys</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100" 
                          className="bg-surfaceLight border-gray-700" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Prefix (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="TWITCH-" 
                          className="bg-surfaceLight border-gray-700" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full px-3 py-2 gradient-premium rounded-md text-white font-medium shadow-sm mt-2"
                  disabled={generateKeysMutation.isPending}
                >
                  {generateKeysMutation.isPending ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      Generating...
                    </>
                  ) : (
                    'Generate Keys'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Recent Keys */}
        <div className="premium-border lg:col-span-2">
          <div className="bg-surface rounded-lg shadow-sm h-full">
            <div className="p-5">
              <h3 className="text-md font-semibold mb-4">Recently Generated Keys</h3>
              
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full mx-auto"></div>
                  <p className="text-textSecondary mt-2">Loading keys...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead>
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Key</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {licenseKeys.slice(0, 5).map((key) => {
                        const status = getKeyStatus(key);
                        return (
                          <tr key={key.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                              {key.key}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {key.keyType === 'standard' ? 'Standard' : key.keyType === 'premium' ? 'Premium' : 'Lifetime'} 
                              {key.keyType !== 'lifetime' && ` (${key.durationDays} days)`}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {format(new Date(key.createdAt), 'yyyy-MM-dd')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <button 
                                  className="text-textSecondary hover:text-primary transition-colors" 
                                  title="Copy"
                                  onClick={() => handleCopyKey(key.key)}
                                >
                                  <i className="fas fa-copy"></i>
                                </button>
                                {!key.revokedAt && (
                                  <button 
                                    className="text-textSecondary hover:text-error transition-colors" 
                                    title="Revoke"
                                    onClick={() => handleRevokeKey(key.key)}
                                    disabled={revokeKeyMutation.isPending}
                                  >
                                    <i className="fas fa-ban"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <a href="/admin/keys" className="text-sm text-primary hover:text-accent transition-colors">View All Keys →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Generated Keys Dialog */}
      <Dialog open={generatedKeys.length > 0} onOpenChange={() => setGeneratedKeys([])}>
        <DialogContent className="bg-surface text-foreground">
          <DialogHeader>
            <DialogTitle>Generated License Keys</DialogTitle>
          </DialogHeader>
          
          <div className="my-4 max-h-[400px] overflow-y-auto premium-border p-1">
            <div className="bg-surfaceLight p-3 rounded-md font-mono text-sm">
              {generatedKeys.map((key, index) => (
                <div key={key.id} className="flex justify-between items-center mb-2 last:mb-0">
                  <div>{key.key}</div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleCopyKey(key.key)}
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setGeneratedKeys([])}
              className="gradient-premium"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

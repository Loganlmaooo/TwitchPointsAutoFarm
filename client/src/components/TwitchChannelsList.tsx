import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TwitchChannel } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import twitchService from '../lib/twitchService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const addChannelSchema = z.object({
  channelName: z.string().min(3, 'Channel name must be at least 3 characters')
});

export default function TwitchChannelsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [processingChannel, setProcessingChannel] = useState<number | null>(null);
  
  // Load channels from API
  const { data: channels = [], isLoading } = useQuery<TwitchChannel[]>({
    queryKey: ['/api/channels'],
  });
  
  // Enhance channel data with Twitch API info
  const [enhancedChannels, setEnhancedChannels] = useState<TwitchChannel[]>([]);
  
  useEffect(() => {
    const enhanceChannelData = async () => {
      if (!channels.length) return;
      
      const enhanced = await Promise.all(channels.map(async (channel) => {
        try {
          const channelInfo = await twitchService.getChannelInfo(channel.channelName);
          return { ...channel, ...channelInfo };
        } catch (error) {
          return channel;
        }
      }));
      
      setEnhancedChannels(enhanced);
    };
    
    enhanceChannelData();
  }, [channels]);
  
  // Form for adding a new channel
  const form = useForm<z.infer<typeof addChannelSchema>>({
    resolver: zodResolver(addChannelSchema),
    defaultValues: {
      channelName: ''
    }
  });
  
  // Add new channel mutation
  const addChannelMutation = useMutation({
    mutationFn: async (values: z.infer<typeof addChannelSchema>) => {
      const response = await apiRequest('POST', '/api/channels', { 
        channelName: values.channelName,
        isActive: true
      });
      return response.json();
    },
    onSuccess: () => {
      setIsAddChannelOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      toast({
        title: "Channel Added",
        description: "The Twitch channel has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Channel",
        description: error.message || "An error occurred while adding the channel.",
        variant: "destructive",
      });
    }
  });
  
  // Toggle channel status mutation
  const toggleChannelMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/channels/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      setProcessingChannel(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Channel",
        description: error.message || "An error occurred while updating the channel.",
        variant: "destructive",
      });
      setProcessingChannel(null);
    }
  });
  
  // Remove channel mutation
  const removeChannelMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/channels/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      setProcessingChannel(null);
      toast({
        title: "Channel Removed",
        description: "The Twitch channel has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove Channel",
        description: error.message || "An error occurred while removing the channel.",
        variant: "destructive",
      });
      setProcessingChannel(null);
    }
  });
  
  const onSubmit = (values: z.infer<typeof addChannelSchema>) => {
    addChannelMutation.mutate(values);
  };
  
  const handleToggleChannel = (id: number, isActive: boolean) => {
    setProcessingChannel(id);
    toggleChannelMutation.mutate({ id, isActive: !isActive });
  };
  
  const handleRemoveChannel = (id: number) => {
    setProcessingChannel(id);
    removeChannelMutation.mutate(id);
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">Active Farming</h2>
        <Button 
          onClick={() => setIsAddChannelOpen(true)}
          className="px-3 py-1.5 bg-accent hover:bg-primary transition-colors rounded-md text-white text-sm font-medium shadow-sm"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Channel
        </Button>
      </div>

      <div className="premium-border">
        <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
              <p className="text-textSecondary">Loading channels...</p>
            </div>
          ) : enhancedChannels.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-tv text-3xl text-textSecondary mb-2"></i>
              <h3 className="text-lg font-medium mb-2">No Channels Added</h3>
              <p className="text-textSecondary mb-4">Start farming points by adding Twitch channels to track.</p>
              <Button 
                onClick={() => setIsAddChannelOpen(true)}
                className="gradient-premium"
              >
                Add Your First Channel
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-surfaceLight">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Channel</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Points/Hour</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Watch Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {enhancedChannels.map((channel) => (
                    <tr key={channel.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-surfaceLight overflow-hidden">
                            {channel.avatarUrl ? (
                              <img 
                                src={channel.avatarUrl} 
                                alt={channel.channelName} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-textSecondary">
                                <i className="fas fa-user"></i>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">{channel.channelName}</div>
                            <div className="text-xs text-textSecondary">{channel.game || 'Unknown Game'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {channel.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success bg-opacity-20 text-success">
                            <i className="fas fa-circle text-xs mr-1 animate-pulse"></i> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning bg-opacity-20 text-warning">
                            <i className="fas fa-exclamation-circle text-xs mr-1"></i> Paused
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium">{channel.pointsPerHour}/hr</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium">
                          {Math.floor(channel.totalWatchTimeMinutes / 60)}h {channel.totalWatchTimeMinutes % 60}m
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button 
                            className={`text-textSecondary hover:${channel.isActive ? 'text-warning' : 'text-success'} transition-colors`}
                            onClick={() => handleToggleChannel(channel.id, channel.isActive)}
                            disabled={processingChannel === channel.id}
                          >
                            {processingChannel === channel.id ? (
                              <i className="fas fa-circle-notch fa-spin"></i>
                            ) : channel.isActive ? (
                              <i className="fas fa-pause"></i>
                            ) : (
                              <i className="fas fa-play"></i>
                            )}
                          </button>
                          <button 
                            className="text-textSecondary hover:text-error transition-colors"
                            onClick={() => handleRemoveChannel(channel.id)}
                            disabled={processingChannel === channel.id}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Channel Dialog */}
      <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
        <DialogContent className="bg-surface text-foreground">
          <DialogHeader>
            <DialogTitle>Add Twitch Channel</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter Twitch channel name" 
                        className="bg-surfaceLight border-gray-700" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddChannelOpen(false)}
                  className="bg-surfaceLight border-gray-700 text-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="gradient-premium"
                  disabled={addChannelMutation.isPending}
                >
                  {addChannelMutation.isPending ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      Adding...
                    </>
                  ) : (
                    'Add Channel'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

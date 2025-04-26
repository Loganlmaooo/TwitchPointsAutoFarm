import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { User } from '../types';
import { apiRequest } from '@/lib/queryClient';

export default function TwitchStatusCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  const refreshConnection = async () => {
    setIsRefreshing(true);
    
    try {
      // In a real implementation, this would refresh the Twitch auth token
      // For now, we'll just simulate a delay and show a success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connection Refreshed",
        description: "Your Twitch connection has been successfully refreshed.",
      });
      
      // After refreshing, we should update the user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh Twitch connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-surface rounded-xl overflow-hidden shadow-premium">
        <div className="relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3')] bg-cover bg-center opacity-10"></div>
          <div className="p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-heading font-semibold mb-1">Twitch Account Status</h2>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user?.twitchUsername 
                      ? "bg-success bg-opacity-20 text-success" 
                      : "bg-red-500 bg-opacity-20 text-red-500"
                  }`}>
                    <i className={`fas ${user?.twitchUsername ? "fa-check-circle" : "fa-times-circle"} mr-1`}></i>
                    {user?.twitchUsername ? "Connected" : "Not Connected"}
                  </span>
                  {user?.twitchUsername && (
                    <span className="text-sm text-textSecondary">{user.twitchUsername}</span>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Button 
                  onClick={refreshConnection}
                  disabled={isRefreshing}
                  className="px-4 py-2 gradient-premium rounded-md text-white font-medium hover:opacity-90 transition-opacity shadow-sm"
                >
                  {isRefreshing ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync-alt mr-2"></i>
                      Refresh Connection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

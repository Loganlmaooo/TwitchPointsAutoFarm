import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { twitchService } from '@/lib/twitchService';
import { useToast } from '@/hooks/use-toast';

interface TwitchLoginButtonProps {
  onSuccess?: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function TwitchLoginButton({ 
  onSuccess, 
  variant = 'default',
  size = 'default',
  className = ''
}: TwitchLoginButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleTwitchLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get the Twitch auth URL from the backend
      const response = await fetch('/api/auth/twitch');
      const data = await response.json();
      
      if (data.url) {
        // Check if client ID is missing in the URL (after client_id=)
        if (data.url.includes('client_id=&')) {
          toast({
            title: 'Configuration Error',
            description: 'Twitch API credentials are not configured. Please check the README for setup instructions.',
            variant: 'destructive',
          });
          return;
        }
        
        // Open Twitch OAuth in a new window
        window.location.href = data.url;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to initialize Twitch login',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Twitch login error:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to Twitch',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTwitchLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`bg-[#6441a5] hover:bg-[#7d5bbe] text-white ${className}`}
    >
      {isLoading ? 'Connecting...' : 'Login with Twitch'}
    </Button>
  );
}
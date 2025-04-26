import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { twitchService } from '@/lib/twitchService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function TwitchCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleTwitchCallback() {
      try {
        // Extract code and state from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code) {
          setError('No authorization code provided');
          return;
        }

        if (state && !twitchService.verifyState(state)) {
          setError('Invalid state parameter, possible security issue');
          return;
        }

        // Link the Twitch account if we already have a session
        await twitchService.linkAccount(code);
        
        // Redirect to dashboard
        toast({
          title: 'Success',
          description: 'Successfully linked Twitch account',
        });
        
        setLocation('/dashboard');
      } catch (error) {
        console.error('Twitch callback error:', error);
        setError('Failed to process Twitch authentication');
      } finally {
        setIsProcessing(false);
      }
    }

    handleTwitchCallback();
  }, [setLocation, toast]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Processing Twitch Login</h1>
        <p className="text-gray-500">Please wait while we complete your authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => setLocation('/login')}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return null;
}
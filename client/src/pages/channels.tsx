import Layout from '@/components/Layout';
import TwitchChannelsList from '@/components/TwitchChannelsList';
import { useQuery } from '@tanstack/react-query';
import { TwitchChannel } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Channels() {
  const { data: channels = [] } = useQuery<TwitchChannel[]>({
    queryKey: ['/api/channels'],
  });

  const activeChannels = channels.filter(channel => channel.isActive);
  const inactiveChannels = channels.filter(channel => !channel.isActive);

  // Calculate total stats
  const totalPoints = channels.reduce((sum, channel) => sum + channel.totalPointsEarned, 0);
  const totalMinutes = channels.reduce((sum, channel) => sum + channel.totalWatchTimeMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <Layout>
      {/* Channels Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-heading font-semibold mb-4">Channels Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">Total Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{channels.length}</span>
                  <div className="ml-4">
                    <div className="text-xs text-success">
                      <span className="inline-flex items-center">
                        <i className="fas fa-circle text-[8px] mr-1 animate-pulse"></i> {activeChannels.length} Active
                      </span>
                    </div>
                    <div className="text-xs text-textSecondary mt-1">
                      <span>{inactiveChannels.length} Inactive</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{totalPoints.toLocaleString()}</span>
                  <div className="ml-4 text-xs text-textSecondary">
                    Across all channels
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">Total Watch Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{totalHours}<span className="text-sm font-normal ml-1">h</span></span>
                  <span className="text-2xl font-bold ml-2">{remainingMinutes}<span className="text-sm font-normal ml-1">m</span></span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Channels List */}
      <Tabs defaultValue="active" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="active">Active Channels ({activeChannels.length})</TabsTrigger>
            <TabsTrigger value="all">All Channels ({channels.length})</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="active">
          <TwitchChannelsList />
        </TabsContent>
        
        <TabsContent value="all">
          <TwitchChannelsList />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

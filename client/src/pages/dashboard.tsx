import Layout from '@/components/Layout';
import TwitchStatusCard from '@/components/TwitchStatusCard';
import StatsOverview from '@/components/StatsOverview';
import TwitchChannelsList from '@/components/TwitchChannelsList';
import RecentActivity from '@/components/RecentActivity';

export default function Dashboard() {
  return (
    <Layout>
      {/* Twitch Account Status */}
      <TwitchStatusCard />
      
      {/* Stats Overview */}
      <StatsOverview />
      
      {/* Active Channels */}
      <TwitchChannelsList />
      
      {/* Recent Activity */}
      <RecentActivity />
    </Layout>
  );
}

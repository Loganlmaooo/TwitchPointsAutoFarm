import { useQuery } from '@tanstack/react-query';
import { Stats, TwitchChannel } from '../types';
import twitchService from '../lib/twitchService';

export default function StatsOverview() {
  // Get channels to calculate stats
  const { data: channels = [] } = useQuery<TwitchChannel[]>({
    queryKey: ['/api/channels'],
  });
  
  // Get license status
  const { data: licenseData } = useQuery({
    queryKey: ['/api/license/status'],
    onError: () => {}, // Prevent error toast on license check
  });

  // Calculate stats from channels data
  const stats: Stats = {
    pointsEarned: channels.reduce((total, channel) => total + channel.totalPointsEarned, 0),
    watchTime: formatWatchTime(channels.reduce((total, channel) => total + channel.totalWatchTimeMinutes, 0)),
    activeChannels: channels.filter(c => c.isActive).length,
    totalChannels: channels.length,
    pointsRate: '+24%', // Placeholder for now
    pointsToday: `+${Math.floor(Math.random() * 2000)} today`, // Placeholder for now
    watchTimeWeek: `+${Math.floor(Math.random() * 50)} hours this week`, // Placeholder for now
    licenseStatus: licenseData ? 'active' : 'inactive',
    licenseExpiry: licenseData ? `Expires in ${calculateDaysRemaining(licenseData)} days` : undefined
  };

  function formatWatchTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  function calculateDaysRemaining(license: any): number {
    if (!license || !license.usedAt || !license.durationDays) return 0;
    
    const usedDate = new Date(license.usedAt);
    const expiryDate = new Date(usedDate);
    expiryDate.setDate(expiryDate.getDate() + license.durationDays);
    
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-heading font-semibold mb-4">Farming Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Points Earned */}
        <div className="premium-border">
          <div className="bg-surface p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-textSecondary">Points Earned</h3>
              <span className="text-primary text-2xl bg-primary bg-opacity-10 w-10 h-10 rounded-full flex items-center justify-center">
                <i className="fas fa-coins"></i>
              </span>
            </div>
            <div className="flex items-end">
              <p className="text-2xl font-bold">
                {stats.pointsEarned.toLocaleString()}
              </p>
              <span className="ml-2 text-xs text-success flex items-center">
                <i className="fas fa-arrow-up mr-1"></i>
                <span>{stats.pointsRate}</span>
              </span>
            </div>
            <div className="mt-2 text-xs text-textSecondary">
              <span>{stats.pointsToday}</span>
            </div>
          </div>
        </div>

        {/* Watch Time */}
        <div className="premium-border">
          <div className="bg-surface p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-textSecondary">Watch Time</h3>
              <span className="text-info text-2xl bg-info bg-opacity-10 w-10 h-10 rounded-full flex items-center justify-center">
                <i className="fas fa-clock"></i>
              </span>
            </div>
            <div className="flex items-end">
              <p className="text-2xl font-bold">{stats.watchTime}</p>
            </div>
            <div className="mt-2 text-xs text-textSecondary">
              <span>{stats.watchTimeWeek}</span>
            </div>
          </div>
        </div>

        {/* Active Channels */}
        <div className="premium-border">
          <div className="bg-surface p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-textSecondary">Active Channels</h3>
              <span className="text-secondary text-2xl bg-secondary bg-opacity-10 w-10 h-10 rounded-full flex items-center justify-center">
                <i className="fas fa-tv"></i>
              </span>
            </div>
            <div className="flex items-end">
              <p className="text-2xl font-bold">{stats.activeChannels}</p>
              {stats.activeChannels > 0 && (
                <span className="ml-2 text-xs text-secondary flex items-center">
                  <i className="fas fa-circle mr-1 animate-pulse"></i>
                  <span>Live</span>
                </span>
              )}
            </div>
            <div className="mt-2 text-xs text-textSecondary">
              <span>{stats.totalChannels} total channels</span>
            </div>
          </div>
        </div>

        {/* License Status */}
        <div className="premium-border">
          <div className="bg-surface p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-textSecondary">License Status</h3>
              <span className={`${stats.licenseStatus === 'active' ? 'text-success bg-success' : 'text-error bg-error'} text-2xl bg-opacity-10 w-10 h-10 rounded-full flex items-center justify-center`}>
                <i className="fas fa-key"></i>
              </span>
            </div>
            <div className="flex items-end">
              <p className={`text-2xl font-bold ${stats.licenseStatus === 'active' ? 'text-success' : 'text-error'}`}>
                {stats.licenseStatus === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="mt-2 text-xs text-textSecondary">
              {stats.licenseExpiry && <span>{stats.licenseExpiry}</span>}
              {!stats.licenseExpiry && <span>No active license</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

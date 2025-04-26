import { useQuery } from '@tanstack/react-query';
import { ActivityLog } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function RecentActivity() {
  const { data: activityLogs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/logs'],
  });

  // Function to get icon and color based on action type
  const getActivityIcon = (action: string): { icon: string; bgColor: string; textColor: string } => {
    switch (action) {
      case 'user_registered':
      case 'user_login':
        return { 
          icon: 'fa-user', 
          bgColor: 'bg-primary bg-opacity-20', 
          textColor: 'text-primary' 
        };
      case 'channel_added':
      case 'channel_updated':
        return { 
          icon: 'fa-tv', 
          bgColor: 'bg-success bg-opacity-20', 
          textColor: 'text-success' 
        };
      case 'channel_removed':
        return { 
          icon: 'fa-times', 
          bgColor: 'bg-error bg-opacity-20', 
          textColor: 'text-error' 
        };
      case 'license_activated':
      case 'keys_generated':
      case 'key_revoked':
        return { 
          icon: 'fa-key', 
          bgColor: 'bg-secondary bg-opacity-20', 
          textColor: 'text-secondary' 
        };
      default:
        return { 
          icon: 'fa-info-circle', 
          bgColor: 'bg-info bg-opacity-20', 
          textColor: 'text-info' 
        };
    }
  };

  // Function to format the activity details for display
  const formatActivityDetails = (log: ActivityLog): string => {
    if (!log.details) return '';
    
    // Extract just the relevant part for display
    const colonIndex = log.details.indexOf(':');
    if (colonIndex !== -1) {
      return log.details.substring(colonIndex + 1).trim();
    }
    
    return log.details;
  };

  // Format the timestamp as a relative time
  const formatTimestamp = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'unknown time';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">Recent Activity</h2>
        <a href="#" className="text-sm text-primary hover:text-accent transition-colors">View All →</a>
      </div>

      <div className="premium-border">
        <div className="bg-surface rounded-lg shadow-sm p-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full mx-auto"></div>
              <p className="text-textSecondary mt-2">Loading activity...</p>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-history text-2xl text-textSecondary mb-2"></i>
              <p className="text-textSecondary">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityLogs.slice(0, 5).map((log) => {
                const { icon, bgColor, textColor } = getActivityIcon(log.action);
                return (
                  <div key={log.id} className="flex">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${bgColor}`}>
                        <i className={`fas ${icon} ${textColor}`}></i>
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm">{formatActivityDetails(log)}</p>
                      <p className="text-xs text-textSecondary mt-1">{formatTimestamp(log.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

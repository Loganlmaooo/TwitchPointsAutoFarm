import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { ActivityLog } from '../types';
import { formatDistanceToNow, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function Activity() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get activity logs
  const { data: activityLogs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/logs'],
  });
  
  // Filter logs based on action type and search term
  const filteredLogs = activityLogs.filter(log => {
    const matchesFilter = filter === 'all' || log.action.includes(filter);
    const matchesSearch = !searchTerm || 
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });
  
  // Get icon and color based on action type
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
  
  // Format activity details for display
  const formatActivityDetails = (log: ActivityLog): string => {
    if (!log.details) return '';
    
    // Extract just the relevant part for display
    const colonIndex = log.details.indexOf(':');
    if (colonIndex !== -1) {
      return log.details.substring(colonIndex + 1).trim();
    }
    
    return log.details;
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string): {relative: string, exact: string} => {
    try {
      const date = new Date(timestamp);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        exact: format(date, 'MMM dd, yyyy HH:mm:ss')
      };
    } catch (error) {
      return {
        relative: 'unknown time',
        exact: 'unknown time'
      };
    }
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-lg font-heading font-semibold mb-4">Activity Logs</h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="bg-surfaceLight border-gray-700">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-gray-700">
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="user">User Activities</SelectItem>
                <SelectItem value="channel">Channel Activities</SelectItem>
                <SelectItem value="license">License Activities</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Input
              placeholder="Search logs..."
              className="bg-surfaceLight border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Activity Logs */}
        <div className="premium-border">
          <Card className="bg-surface shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
                  <p className="text-textSecondary">Loading activity logs...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fas fa-history text-3xl text-textSecondary mb-2"></i>
                  <p className="text-textSecondary">No activity logs found.</p>
                  {searchTerm && (
                    <p className="text-textSecondary text-sm mt-2">Try adjusting your search criteria.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log) => {
                    const { icon, bgColor, textColor } = getActivityIcon(log.action);
                    const time = formatTimestamp(log.timestamp);
                    
                    return (
                      <div key={log.id} className="flex p-3 hover:bg-surfaceLight rounded-lg transition-colors">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${bgColor}`}>
                            <i className={`fas ${icon} ${textColor} text-lg`}></i>
                          </span>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">{formatActivityDetails(log)}</p>
                            <span className="text-xs text-textSecondary" title={time.exact}>{time.relative}</span>
                          </div>
                          <p className="text-xs text-textSecondary mt-1">
                            Action: {log.action.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

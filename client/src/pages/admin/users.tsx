import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { User } from '../../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminUsers() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Check if user is admin
  const { data: currentUser, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });
  
  // Mock users data (in a real app, this would come from an API endpoint)
  const users: User[] = [
    { 
      id: 1, 
      username: 'admin', 
      email: 'admin@twitchfarmpro.com', 
      role: 'admin', 
      isActive: true,
      twitchUsername: 'admintwitch'
    },
    { 
      id: 2, 
      username: 'john_doe', 
      email: 'john@example.com', 
      role: 'user', 
      isActive: true,
      twitchUsername: 'johntv'
    },
    { 
      id: 3, 
      username: 'jane_smith', 
      email: 'jane@example.com', 
      role: 'user', 
      isActive: true 
    },
    { 
      id: 4, 
      username: 'robert_jones', 
      email: 'robert@example.com', 
      role: 'user', 
      isActive: false 
    }
  ];
  
  // If not admin, redirect to dashboard
  if (!isUserLoading && currentUser && currentUser.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }
  
  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  return (
    <Layout>
      {/* User Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-heading font-semibold mb-4">User Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{users.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{users.filter(u => u.isActive).length}</span>
                  <span className="ml-2 text-xs text-success flex items-center">
                    <i className="fas fa-circle mr-1 animate-pulse"></i>
                    <span>Online</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">Admin Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{users.filter(u => u.role === 'admin').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">Twitch Connected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{users.filter(u => u.twitchUsername).length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* User Management */}
      <div className="mb-8">
        <h2 className="text-lg font-heading font-semibold mb-4">User Management</h2>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="md:w-1/4">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-surfaceLight border-gray-700">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-gray-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              className="bg-surfaceLight border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Button className="gradient-premium w-full">
              <i className="fas fa-user-plus mr-2"></i>
              Add User
            </Button>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="premium-border">
          <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
            {isUserLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
                <p className="text-textSecondary">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <i className="fas fa-users text-3xl text-textSecondary mb-2"></i>
                <p className="text-textSecondary">No users found.</p>
                {(searchTerm || roleFilter !== 'all') && (
                  <p className="text-textSecondary text-sm mt-2">Try adjusting your filters.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-surfaceLight">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Twitch</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-surfaceLight">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 bg-primary">
                              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <div className="text-sm font-medium">{user.username}</div>
                              <div className="text-xs text-textSecondary">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-secondary bg-opacity-90 text-black' : 'bg-primary bg-opacity-20 text-primary border-primary'}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={user.isActive ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-destructive bg-opacity-10 text-destructive border-destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.twitchUsername ? (
                            <span className="inline-flex items-center text-primary">
                              <i className="fab fa-twitch mr-1"></i> {user.twitchUsername}
                            </span>
                          ) : (
                            <span className="text-textSecondary">Not connected</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-3">
                            <button 
                              className="text-textSecondary hover:text-primary transition-colors" 
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="text-textSecondary hover:text-info transition-colors" 
                              title="Reset Password"
                            >
                              <i className="fas fa-key"></i>
                            </button>
                            {user.isActive ? (
                              <button 
                                className="text-textSecondary hover:text-destructive transition-colors" 
                                title="Disable"
                              >
                                <i className="fas fa-ban"></i>
                              </button>
                            ) : (
                              <button 
                                className="text-textSecondary hover:text-success transition-colors" 
                                title="Enable"
                              >
                                <i className="fas fa-check-circle"></i>
                              </button>
                            )}
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
      </div>
    </Layout>
  );
}

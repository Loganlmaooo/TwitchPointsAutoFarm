import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { User } from '../types';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
          variant: "default"
        });
        navigate('/login');
      } else {
        throw new Error('Failed to logout');
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Force redirect to login if not authenticated
  useEffect(() => {
    if (error && location !== '/login') {
      navigate('/login');
    }
  }, [error, location, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
      </div>
    );
  }

  // Skip layout for login page
  if (location === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className={`md:w-64 bg-surface md:fixed md:inset-y-0 z-50 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'fixed inset-0' : 'hidden md:block'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full gradient-premium flex items-center justify-center">
                <i className="fas fa-bolt text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-heading font-bold text-white">TwitchFarm<span className="text-secondary">Pro</span></h1>
            </div>
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
            <div className="mb-6">
              <p className="px-3 text-xs font-medium text-textSecondary uppercase tracking-wider mb-2">Main</p>
              <Link href="/dashboard">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === '/dashboard' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                } group`}>
                  <i className={`fas fa-chart-line mr-3 ${location === '/dashboard' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                  Dashboard
                </a>
              </Link>
              <Link href="/channels">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mt-1 ${
                  location === '/channels' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                } group`}>
                  <i className={`fas fa-tv mr-3 ${location === '/channels' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                  Active Channels
                </a>
              </Link>
              <Link href="/license">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mt-1 ${
                  location === '/license' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                } group`}>
                  <i className={`fas fa-key mr-3 ${location === '/license' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                  License Keys
                </a>
              </Link>
              <Link href="/activity">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mt-1 ${
                  location === '/activity' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                } group`}>
                  <i className={`fas fa-history mr-3 ${location === '/activity' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                  Activity Logs
                </a>
              </Link>
            </div>

            {user && user.role === 'admin' && (
              <div className="mb-6">
                <p className="px-3 text-xs font-medium text-textSecondary uppercase tracking-wider mb-2">Administration</p>
                <Link href="/admin">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === '/admin' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                  } group`}>
                    <i className={`fas fa-user-shield mr-3 ${location === '/admin' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                    Admin Panel
                  </a>
                </Link>
                <Link href="/admin/keys">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mt-1 ${
                    location === '/admin/keys' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                  } group`}>
                    <i className={`fas fa-key mr-3 ${location === '/admin/keys' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                    Key Management
                  </a>
                </Link>
                <Link href="/admin/users">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mt-1 ${
                    location === '/admin/users' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                  } group`}>
                    <i className={`fas fa-users mr-3 ${location === '/admin/users' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                    User Management
                  </a>
                </Link>
              </div>
            )}

            <div>
              <p className="px-3 text-xs font-medium text-textSecondary uppercase tracking-wider mb-2">Settings</p>
              <Link href="/settings">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === '/settings' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                } group`}>
                  <i className={`fas fa-cog mr-3 ${location === '/settings' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                  Settings
                </a>
              </Link>
              <Link href="/support">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mt-1 ${
                  location === '/support' ? 'bg-primary bg-opacity-20 text-white' : 'text-textSecondary hover:text-white hover:bg-surfaceLight'
                } group`}>
                  <i className={`fas fa-question-circle mr-3 ${location === '/support' ? 'text-primary' : 'text-textSecondary group-hover:text-primary'}`}></i>
                  Help &amp; Support
                </a>
              </Link>
            </div>
          </nav>
          
          {/* User Profile */}
          {user && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.username}</p>
                  <p className="text-xs text-textSecondary">{user.role === 'admin' ? 'Admin' : 'Premium Plan'}</p>
                </div>
                <div className="ml-auto">
                  <button 
                    className="text-textSecondary hover:text-white"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-surface shadow-md">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center">
              <button 
                className="md:hidden text-gray-400 hover:text-white mr-3" 
                onClick={() => setSidebarOpen(true)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <h1 className="text-xl font-heading font-medium">
                {location === '/dashboard' && 'Dashboard'}
                {location === '/channels' && 'Active Channels'}
                {location === '/license' && 'License Management'}
                {location === '/activity' && 'Activity Logs'}
                {location === '/admin' && 'Admin Panel'}
                {location === '/admin/keys' && 'Key Management'}
                {location === '/admin/users' && 'User Management'}
                {location === '/settings' && 'Settings'}
                {location === '/support' && 'Help & Support'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="text-textSecondary hover:text-white">
                  <i className="fas fa-bell"></i>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error"></span>
                </button>
              </div>
              <div className="relative inline-block">
                <div className="premium-border">
                  <button className="bg-surfaceLight px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                    <span className="text-secondary"><i className="fas fa-crown"></i></span>
                    <span>Premium</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6">
          {children}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

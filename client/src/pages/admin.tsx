import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import Layout from '@/components/Layout';
import AdminKeyGeneration from '@/components/AdminKeyGeneration';
import { User } from '../types';

export default function AdminPanel() {
  const [, navigate] = useLocation();
  
  // Check if user is admin
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });
  
  // If not admin, redirect to dashboard
  if (!isLoading && user && user.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }
  
  return (
    <Layout>
      {/* Admin Key Generation */}
      <AdminKeyGeneration />
      
      {/* Admin Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="premium-border">
          <div className="bg-surface p-5 rounded-lg shadow-sm">
            <h3 className="text-md font-semibold mb-4">System Overview</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-textSecondary">Active Users</span>
                  <span className="text-sm font-medium">24</span>
                </div>
                <div className="h-2 bg-surfaceLight rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-textSecondary">Active Licenses</span>
                  <span className="text-sm font-medium">42 / 50</span>
                </div>
                <div className="h-2 bg-surfaceLight rounded-full">
                  <div className="h-2 bg-secondary rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-textSecondary">Server Load</span>
                  <span className="text-sm font-medium">28%</span>
                </div>
                <div className="h-2 bg-surfaceLight rounded-full">
                  <div className="h-2 bg-success rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-textSecondary">Revenue</span>
                  <span className="text-sm font-medium">$2,450</span>
                </div>
                <div className="h-2 bg-surfaceLight rounded-full">
                  <div className="h-2 bg-info rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="premium-border">
          <div className="bg-surface p-5 rounded-lg shadow-sm">
            <h3 className="text-md font-semibold mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-surfaceLight hover:bg-gray-800 transition-colors rounded-lg text-center">
                <i className="fas fa-users text-2xl text-primary mb-2"></i>
                <p className="text-sm font-medium">Manage Users</p>
              </button>
              
              <button className="p-4 bg-surfaceLight hover:bg-gray-800 transition-colors rounded-lg text-center">
                <i className="fas fa-chart-line text-2xl text-info mb-2"></i>
                <p className="text-sm font-medium">View Analytics</p>
              </button>
              
              <button className="p-4 bg-surfaceLight hover:bg-gray-800 transition-colors rounded-lg text-center">
                <i className="fas fa-cog text-2xl text-secondary mb-2"></i>
                <p className="text-sm font-medium">System Settings</p>
              </button>
              
              <button className="p-4 bg-surfaceLight hover:bg-gray-800 transition-colors rounded-lg text-center">
                <i className="fas fa-file-alt text-2xl text-success mb-2"></i>
                <p className="text-sm font-medium">Export Reports</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

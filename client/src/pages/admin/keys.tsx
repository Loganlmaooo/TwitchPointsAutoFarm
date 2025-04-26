import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import AdminKeyGeneration from '@/components/AdminKeyGeneration';
import { LicenseKey, User } from '../../types';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function AdminKeys() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Check if user is admin
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });
  
  // Get all keys
  const { data: keys = [], isLoading: isKeysLoading } = useQuery<LicenseKey[]>({
    queryKey: ['/api/admin/keys'],
    enabled: !!user && user.role === 'admin'
  });
  
  // If not admin, redirect to dashboard
  if (!isUserLoading && user && user.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }
  
  // Filter keys based on filters and search
  const filteredKeys = keys.filter(key => {
    const matchesSearch = !searchTerm || key.key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && key.usedAt && !key.revokedAt) ||
      (statusFilter === 'unused' && !key.usedAt && !key.revokedAt) ||
      (statusFilter === 'revoked' && !!key.revokedAt);
      
    const matchesType = typeFilter === 'all' || key.keyType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Get key status
  const getKeyStatus = (key: LicenseKey): { label: string; className: string } => {
    if (key.revokedAt) {
      return { 
        label: 'Revoked', 
        className: 'bg-destructive bg-opacity-20 text-destructive border-destructive' 
      };
    } else if (key.usedAt) {
      return { 
        label: 'Active', 
        className: 'bg-info bg-opacity-20 text-info border-info' 
      };
    } else {
      return { 
        label: 'Unused', 
        className: 'bg-success bg-opacity-20 text-success border-success' 
      };
    }
  };
  
  return (
    <Layout>
      {/* Key Generation Component */}
      <AdminKeyGeneration />
      
      {/* Keys Management */}
      <div className="mb-8">
        <h2 className="text-lg font-heading font-semibold mb-4">All License Keys</h2>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="md:w-1/4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-surfaceLight border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-gray-700">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unused">Unused</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:w-1/4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-surfaceLight border-gray-700">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Input
              placeholder="Search keys..."
              className="bg-surfaceLight border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Button className="gradient-premium w-full">
              <i className="fas fa-download mr-2"></i>
              Export
            </Button>
          </div>
        </div>
        
        {/* Keys Table */}
        <div className="premium-border">
          <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
            {isUserLoading || isKeysLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
                <p className="text-textSecondary">Loading license keys...</p>
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="text-center py-10">
                <i className="fas fa-key text-3xl text-textSecondary mb-2"></i>
                <p className="text-textSecondary">No license keys found.</p>
                {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                  <p className="text-textSecondary text-sm mt-2">Try adjusting your filters.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-surfaceLight">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Key</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Duration</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Created</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Used By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredKeys.map((key) => {
                      const status = getKeyStatus(key);
                      return (
                        <tr key={key.id} className="hover:bg-surfaceLight">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {key.key}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {key.keyType.charAt(0).toUpperCase() + key.keyType.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {key.keyType === 'lifetime' ? 'Lifetime' : `${key.durationDays} days`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {format(new Date(key.createdAt), 'yyyy-MM-dd')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className={status.className}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {key.usedBy ? `User ID: ${key.usedBy}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-3">
                              <button 
                                className="text-textSecondary hover:text-primary transition-colors" 
                                title="Copy"
                                onClick={() => {
                                  navigator.clipboard.writeText(key.key);
                                }}
                              >
                                <i className="fas fa-copy"></i>
                              </button>
                              {!key.revokedAt && (
                                <button 
                                  className="text-textSecondary hover:text-destructive transition-colors" 
                                  title="Revoke"
                                >
                                  <i className="fas fa-ban"></i>
                                </button>
                              )}
                              <button 
                                className="text-textSecondary hover:text-accent transition-colors" 
                                title="Details"
                              >
                                <i className="fas fa-info-circle"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ActivateKeyModal from '@/components/ActivateKeyModal';
import { format, addDays } from 'date-fns';

export default function License() {
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  
  // Get license status
  const { data: licenseData, isLoading, error } = useQuery({
    queryKey: ['/api/license/status'],
    onError: () => {}, // Prevent error toast on license check
  });

  // Format expiry date
  const formatExpiryDate = (licenseData: any) => {
    if (!licenseData || !licenseData.usedAt || !licenseData.durationDays) {
      return null;
    }
    
    const usedDate = new Date(licenseData.usedAt);
    const expiryDate = addDays(usedDate, licenseData.durationDays);
    return {
      formatted: format(expiryDate, 'MMMM dd, yyyy'),
      daysLeft: Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };
  };
  
  const expiryInfo = licenseData ? formatExpiryDate(licenseData) : null;
  const hasActiveLicense = !!licenseData && !licenseData.revokedAt;
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* License Status Card */}
        <div className="mb-8">
          <h2 className="text-lg font-heading font-semibold mb-4">License Status</h2>
          
          <div className="premium-border">
            <Card className="bg-surface shadow-premium">
              <div className="relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3')] bg-cover bg-center opacity-5"></div>
                
                <CardContent className="p-6 relative">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <i className={`fas fa-key text-2xl ${hasActiveLicense ? 'text-secondary' : 'text-gray-500'}`}></i>
                        <h3 className="text-xl font-bold">{hasActiveLicense ? 'Active License' : 'No Active License'}</h3>
                        {hasActiveLicense && (
                          <Badge variant="outline" className="bg-success bg-opacity-10 text-success border-success">
                            Active
                          </Badge>
                        )}
                        {!hasActiveLicense && (
                          <Badge variant="outline" className="bg-destructive bg-opacity-10 text-destructive border-destructive">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      
                      {isLoading ? (
                        <p className="text-textSecondary">Checking license status...</p>
                      ) : hasActiveLicense ? (
                        <>
                          <p className="text-textSecondary">License Type: <span className="text-foreground font-medium">{licenseData.keyType.charAt(0).toUpperCase() + licenseData.keyType.slice(1)}</span></p>
                          <p className="text-textSecondary">Key: <span className="font-mono text-foreground">{licenseData.key}</span></p>
                          {expiryInfo && (
                            <p className="text-textSecondary mt-2">
                              Expires: <span className="text-foreground font-medium">{expiryInfo.formatted}</span>
                              <span className="ml-2 text-xs text-success">({expiryInfo.daysLeft} days left)</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-textSecondary">You don't have an active license. Please activate a license key to access premium features.</p>
                      )}
                    </div>
                    
                    <div>
                      <Button 
                        onClick={() => setActivateModalOpen(true)}
                        className="gradient-premium rounded-md text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        <i className="fas fa-key mr-2"></i>
                        {hasActiveLicense ? 'Update License' : 'Activate License'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
        
        {/* License Features */}
        <div className="mb-8">
          <h2 className="text-lg font-heading font-semibold mb-4">License Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="premium-border">
              <Card className="bg-surface h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-2">
                    <i className="fas fa-robot text-primary text-xl"></i>
                  </div>
                  <CardTitle>Auto Farming</CardTitle>
                  <CardDescription>Automatically collect points while you're away</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>24/7 points collection</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>Multiple channels support</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>Automatic reconnection</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="premium-border">
              <Card className="bg-surface h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mb-2">
                    <i className="fas fa-chart-line text-secondary text-xl"></i>
                  </div>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Track your points collection progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>Detailed statistics</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>Points per hour tracking</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>Watch time monitoring</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="premium-border">
              <Card className="bg-surface h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center mb-2">
                    <i className="fas fa-shield-alt text-accent text-xl"></i>
                  </div>
                  <CardTitle>Premium Support</CardTitle>
                  <CardDescription>Get help when you need it</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>Feature requests</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <span>Early access to updates</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* License FAQs */}
        <div className="mb-8">
          <h2 className="text-lg font-heading font-semibold mb-4">License FAQ</h2>
          
          <div className="premium-border">
            <Card className="bg-surface">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">How do I get a license key?</h3>
                    <p className="text-textSecondary">License keys can be purchased from authorized resellers. Contact our support team for more information on where to buy.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Can I use my license on multiple devices?</h3>
                    <p className="text-textSecondary">Each license key is tied to a single account but can be used on multiple devices as long as you're logged into the same account.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">What happens when my license expires?</h3>
                    <p className="text-textSecondary">When your license expires, auto-farming features will be disabled. You'll need to activate a new license key to continue using premium features.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Can I get a refund if I'm not satisfied?</h3>
                    <p className="text-textSecondary">Please contact the reseller you purchased from regarding their refund policy. We generally don't offer refunds for activated license keys.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Activate Key Modal */}
      <ActivateKeyModal 
        isOpen={activateModalOpen} 
        onClose={() => setActivateModalOpen(false)} 
      />
    </Layout>
  );
}

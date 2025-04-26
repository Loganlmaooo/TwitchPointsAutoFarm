import { useState } from 'react';
import Layout from '@/components/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  twitchUsername: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pointsMilestones: z.boolean(),
  watchTimeMilestones: z.boolean(),
  licenseExpiry: z.boolean(),
  newFeatures: z.boolean(),
});

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnectingTwitch, setIsConnectingTwitch] = useState(false);

  // Get user data
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      twitchUsername: user?.twitchUsername || '',
    },
    values: {
      username: user?.username || '',
      email: user?.email || '',
      twitchUsername: user?.twitchUsername || '',
    }
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Notification form
  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pointsMilestones: true,
      watchTimeMilestones: true,
      licenseExpiry: true,
      newFeatures: true,
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      // In a real app, this would update the user profile
      // For now just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update profile",
        variant: "destructive",
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      // In a real app, this would change the password
      // For now just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Password Change Failed",
        description: error instanceof Error ? error.message : "Could not update password",
        variant: "destructive",
      });
    }
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof notificationSchema>) => {
      // In a real app, this would update notification settings
      // For now just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      return values;
    },
    onSuccess: () => {
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update notification settings",
        variant: "destructive",
      });
    }
  });

  // Connect to Twitch function
  const connectTwitch = async () => {
    setIsConnectingTwitch(true);
    try {
      // In a real app, this would initiate Twitch OAuth
      // For now just simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Twitch Connected",
        description: "Your Twitch account has been successfully connected.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Twitch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnectingTwitch(false);
    }
  };

  // Form submissions
  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(values);
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(values);
  };

  const onNotificationsSubmit = (values: z.infer<typeof notificationSchema>) => {
    updateNotificationsMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-heading font-semibold mb-4">Account Settings</h2>
        
        <Tabs defaultValue="profile" className="mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="premium-border">
              <Card className="bg-surface">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input className="bg-surfaceLight border-gray-700" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input className="bg-surfaceLight border-gray-700" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your email address is used for notifications and account recovery.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="gradient-premium"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <i className="fas fa-circle-notch fa-spin mr-2"></i>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Password Tab */}
          <TabsContent value="password">
            <div className="premium-border">
              <Card className="bg-surface">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" className="bg-surfaceLight border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" className="bg-surfaceLight border-gray-700" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 6 characters long.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" className="bg-surfaceLight border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="gradient-premium"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <i className="fas fa-circle-notch fa-spin mr-2"></i>
                            Updating...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="premium-border">
              <Card className="bg-surface">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)} className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-gray-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="pointsMilestones"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-gray-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Points Milestones</FormLabel>
                              <FormDescription>
                                Get notified when you reach point milestones
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="watchTimeMilestones"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-gray-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Watch Time Milestones</FormLabel>
                              <FormDescription>
                                Get notified when you reach watch time milestones
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="licenseExpiry"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-gray-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">License Expiry</FormLabel>
                              <FormDescription>
                                Get notified before your license expires
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="newFeatures"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-gray-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">New Features</FormLabel>
                              <FormDescription>
                                Get notified about new features and updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="gradient-premium"
                        disabled={updateNotificationsMutation.isPending}
                      >
                        {updateNotificationsMutation.isPending ? (
                          <>
                            <i className="fas fa-circle-notch fa-spin mr-2"></i>
                            Saving...
                          </>
                        ) : (
                          'Save Preferences'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Connections Tab */}
          <TabsContent value="connections">
            <div className="premium-border">
              <Card className="bg-surface">
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>Manage your connected accounts and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Twitch Connection */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#9147FF] flex items-center justify-center">
                          <i className="fab fa-twitch text-white text-xl"></i>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-base font-medium">Twitch</h3>
                          <p className="text-sm text-textSecondary">
                            {user?.twitchUsername 
                              ? `Connected as ${user.twitchUsername}` 
                              : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant={user?.twitchUsername ? 'destructive' : 'default'}
                        className={user?.twitchUsername ? '' : 'gradient-premium'}
                        onClick={connectTwitch}
                        disabled={isConnectingTwitch}
                      >
                        {isConnectingTwitch ? (
                          <>
                            <i className="fas fa-circle-notch fa-spin mr-2"></i>
                            Connecting...
                          </>
                        ) : user?.twitchUsername ? (
                          <>
                            <i className="fas fa-unlink mr-2"></i>
                            Disconnect
                          </>
                        ) : (
                          <>
                            <i className="fas fa-link mr-2"></i>
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Discord Connection - Placeholder */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center">
                          <i className="fab fa-discord text-white text-xl"></i>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-base font-medium">Discord</h3>
                          <p className="text-sm text-textSecondary">Not connected</p>
                        </div>
                      </div>
                      
                      <Button className="gradient-premium">
                        <i className="fas fa-link mr-2"></i>
                        Connect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

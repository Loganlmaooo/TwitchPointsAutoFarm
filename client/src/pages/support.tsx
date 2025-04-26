import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export default function Support() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  // Contact form
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    setIsSending(true);
    try {
      // In a real app, this would send the message to backend
      // For now just simulate a success scenario
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Message Sent",
        description: "Your support request has been submitted successfully.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "There was an error submitting your support request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-heading font-semibold mb-4">Help & Support</h2>
        
        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-2">
                  <i className="fas fa-question-circle text-primary text-xl"></i>
                </div>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>Find answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-textSecondary mb-4">
                  Our comprehensive FAQ section covers most common questions and issues.
                </p>
                <Button className="w-full gradient-premium">
                  Browse FAQ
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mb-2">
                  <i className="fas fa-book text-secondary text-xl"></i>
                </div>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Learn how to use our platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-textSecondary mb-4">
                  Our detailed documentation provides step-by-step guides and tutorials.
                </p>
                <Button className="w-full bg-surfaceLight hover:bg-gray-800">
                  Read Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="premium-border">
            <Card className="bg-surface h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center mb-2">
                  <i className="fab fa-discord text-accent text-xl"></i>
                </div>
                <CardTitle>Discord Community</CardTitle>
                <CardDescription>Join our community for help</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-textSecondary mb-4">
                  Connect with other users and get help from our support team.
                </p>
                <Button className="w-full bg-[#5865F2] hover:bg-[#4752c4]">
                  <i className="fab fa-discord mr-2"></i>
                  Join Discord
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-lg font-heading font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="premium-border">
            <Card className="bg-surface">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How does TwitchFarm Pro work?</AccordionTrigger>
                    <AccordionContent>
                      TwitchFarm Pro automatically connects to Twitch channels of your choice and collects channel points while simulating viewer activity. It runs 24/7 in the background, requiring minimal setup and maintenance.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is this against Twitch's Terms of Service?</AccordionTrigger>
                    <AccordionContent>
                      Using automation tools for Twitch may violate Twitch's Terms of Service. Please make sure to review Twitch's ToS before using our platform. We are not responsible for any actions taken by Twitch against your account.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I connect my Twitch account?</AccordionTrigger>
                    <AccordionContent>
                      Go to Settings &gt; Connections and click the "Connect" button next to Twitch. You'll be redirected to Twitch to authorize the connection. Once authorized, you'll be redirected back to TwitchFarm Pro.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How many channels can I track simultaneously?</AccordionTrigger>
                    <AccordionContent>
                      The number of channels you can track simultaneously depends on your license type. Standard licenses allow up to 5 channels, Premium licenses allow up to 10 channels, and Lifetime licenses allow unlimited channels.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Can I use TwitchFarm Pro on multiple devices?</AccordionTrigger>
                    <AccordionContent>
                      Yes, you can use TwitchFarm Pro on multiple devices as long as you're logged into the same account. However, please note that the same Twitch account cannot be actively farming on multiple devices simultaneously.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="mb-8">
          <h2 className="text-lg font-heading font-semibold mb-4">Contact Support</h2>
          
          <div className="premium-border">
            <Card className="bg-surface">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Have a specific question or issue? Send us a message and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input className="bg-surfaceLight border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input className="bg-surfaceLight border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input className="bg-surfaceLight border-gray-700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="bg-surfaceLight border-gray-700 min-h-[150px]" 
                              placeholder="Describe your issue or question in detail..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="gradient-premium"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin mr-2"></i>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

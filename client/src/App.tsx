import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import TwitchCallback from "@/pages/twitch-callback";
import Channels from "@/pages/channels";
import License from "@/pages/license";
import Activity from "@/pages/activity";
import Admin from "@/pages/admin";
import AdminKeys from "@/pages/admin/keys";
import AdminUsers from "@/pages/admin/users";
import Settings from "@/pages/settings";
import Support from "@/pages/support";

function Router() {
  return (
    <Switch>
      {/* Auth pages */}
      <Route path="/login" component={Login} />
      <Route path="/twitch/callback" component={TwitchCallback} />
      
      {/* Main pages */}
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/channels" component={Channels} />
      <Route path="/license" component={License} />
      <Route path="/activity" component={Activity} />
      
      {/* Admin pages */}
      <Route path="/admin" component={Admin} />
      <Route path="/admin/keys" component={AdminKeys} />
      <Route path="/admin/users" component={AdminUsers} />
      
      {/* Settings pages */}
      <Route path="/settings" component={Settings} />
      <Route path="/support" component={Support} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

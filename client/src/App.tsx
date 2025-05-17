import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import EventDetails from "@/pages/event-details";
import BookingConfirmation from "@/pages/booking-confirmation";
import MyBookings from "@/pages/my-bookings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminEvents from "@/pages/admin/events";
import { useAuth } from "./context/auth-context";
import { Navbar } from "./components/ui/navigation/navbar";

function ProtectedRoute({ component: Component, requireAdmin = false, ...rest }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="container py-5 text-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <NotFound />;
  }
  
  if (requireAdmin && !user.isAdmin) {
    return <NotFound />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/events/:id" component={EventDetails} />
        
        {/* Protected routes */}
        <Route path="/booking-confirmation/:id">
          {(params) => <ProtectedRoute component={BookingConfirmation} id={params.id} />}
        </Route>
        <Route path="/my-bookings">
          {() => <ProtectedRoute component={MyBookings} />}
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin">
          {() => <ProtectedRoute component={AdminDashboard} requireAdmin={true} />}
        </Route>
        <Route path="/admin/events">
          {() => <ProtectedRoute component={AdminEvents} requireAdmin={true} />}
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/events/event-card";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, XCircle } from "lucide-react";

const MyBookings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
  
  // Fetch user bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch("/api/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    }
  });
  
  // Fetch recommended events
  const { data: recommendedEvents, isLoading: loadingRecommended } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const events = await response.json();
      
      // Filter out events that the user has already booked
      const bookedEventIds = new Set(bookings?.map(booking => booking.eventId) || []);
      return events.filter(event => !bookedEventIds.has(event.id)).slice(0, 3);
    },
    enabled: !!bookings,
  });
  
  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: (bookingId: number) => {
      return apiRequest("DELETE", `/api/bookings/${bookingId}`);
    },
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleCancelBooking = (bookingId: number) => {
    setBookingToCancel(bookingId);
    setDeleteDialogOpen(true);
  };
  
  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      cancelMutation.mutate(bookingToCancel);
    }
    setDeleteDialogOpen(false);
  };
  
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your bookings...</p>
      </div>
    );
  }
  
  if (!bookings || bookings.length === 0) {
    return (
      <div className="container py-5">
        <h1 className="mb-4 font-heading">My Bookings</h1>
        <div className="card shadow-sm mb-4">
          <div className="card-body p-5 text-center">
            <p className="mb-4">You haven't booked any events yet.</p>
            <Link href="/">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </div>
        
        {!loadingRecommended && recommendedEvents && recommendedEvents.length > 0 && (
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h2 className="h5 mb-0">Events You Might Like</h2>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {recommendedEvents.map(event => (
                  <div key={event.id} className="col-md-6 col-lg-4">
                    <EventCard event={event} showDetailsOnly={true} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-4 font-heading">My Bookings</h1>
        
        <div className="card shadow-sm mb-4">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th scope="col">Event</th>
                    <th scope="col">Date</th>
                    <th scope="col">Venue</th>
                    <th scope="col">Booking Reference</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={booking.event.image} 
                            alt={booking.event.name} 
                            className="rounded me-3" 
                            style={{ width: "50px", height: "30px", objectFit: "cover" }}
                          />
                          <div>
                            <p className="mb-0 fw-medium">{booking.event.name}</p>
                            <small className="text-muted">Standard Admission</small>
                          </div>
                        </div>
                      </td>
                      <td>{format(new Date(booking.event.date), "MMM d, yyyy")}</td>
                      <td>{booking.event.venue}</td>
                      <td className="font-monospace">{booking.referenceNumber}</td>
                      <td>
                        <span className="badge bg-success">
                          {new Date(booking.event.date) > new Date() ? "Confirmed" : "Completed"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link href={`/events/${booking.event.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {new Date(booking.event.date) > new Date() && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancelMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {!loadingRecommended && recommendedEvents && recommendedEvents.length > 0 && (
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h2 className="h5 mb-0">Events You Might Like</h2>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {recommendedEvents.map(event => (
                  <div key={event.id} className="col-md-6 col-lg-4">
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your booking for this event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelBooking}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default MyBookings;

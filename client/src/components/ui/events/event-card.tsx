import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";

interface EventCardProps {
  event: Event;
  isBooked?: boolean;
  showDetailsOnly?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isBooked = false,
  showDetailsOnly = false
}) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = React.useState(false);
  
  const bookEvent = async () => {
    if (!isAuthenticated) {
      return toast({
        title: "Authentication Required",
        description: "Please log in to book this event",
        variant: "destructive",
      });
    }
    
    try {
      setBooking(true);
      const response = await apiRequest("POST", "/api/bookings", { eventId: event.id });
      const data = await response.json();
      
      // Invalidate bookings query
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      
      // Navigate to confirmation page
      window.location.href = `/booking-confirmation/${data.id}`;
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "An error occurred while booking the event.",
        variant: "destructive",
      });
      setBooking(false);
    }
  };
  
  return (
    <div className="card h-100 shadow-sm card-hover transition-all">
      <div className="position-relative">
        <img 
          src={event.image} 
          alt={event.name} 
          className="card-img-top event-image"
        />
        {isBooked && (
          <Badge className="badge-booked" variant="secondary">Booked</Badge>
        )}
        <div className="position-absolute bottom-0 start-0 w-100 bg-gradient-to-t from-black to-transparent p-3">
          <div className="flex gap-2">
            <Badge variant="primary" className="text-white">
              {event.categoryId === 1 ? "Music" : 
               event.categoryId === 2 ? "Technology" : 
               event.categoryId === 3 ? "Food & Drink" : 
               event.categoryId === 4 ? "Education" : 
               event.categoryId === 5 ? "Business" : 
               event.categoryId === 6 ? "Health & Fitness" : "Event"}
            </Badge>
            <Badge variant="secondary" className="bg-light text-dark">
              {event.price === 0 ? "Free" : `$${event.price}`}
            </Badge>
          </div>
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title font-medium text-lg">{event.name}</h5>
        <p className="card-text text-muted mb-2 text-sm">
          <Calendar className="inline h-4 w-4 mr-1" /> 
          {format(new Date(event.date), "MMM d, yyyy")} | 
          <MapPin className="inline h-4 w-4 mx-1" /> 
          {event.venue}
        </p>
        <p className="card-text line-clamp-2">
          {event.description.length > 100 
            ? `${event.description.substring(0, 97)}...` 
            : event.description
          }
        </p>
      </div>
      <div className="card-footer bg-white border-0 flex justify-between items-center">
        <Link href={`/events/${event.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        
        {!showDetailsOnly && (
          isBooked ? (
            <Button variant="secondary" disabled>Booked</Button>
          ) : (
            <Button onClick={bookEvent} disabled={booking}>
              {booking ? "Booking..." : "Book Now"}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar, MapPin, Tag, Users, Ticket, Share2, Mail, Phone } from "lucide-react";

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState(false);
  
  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${id}`],
  });
  
  // Check if user has already booked this event
  const { data: bookingCheck, isLoading: checkingBooking } = useQuery({
    queryKey: [`/api/bookings/check/${id}`],
    enabled: isAuthenticated && !!id,
    queryFn: async () => {
      const response = await fetch(`/api/bookings/check/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to check booking status");
      return response.json();
    }
  });
  
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
      const response = await apiRequest("POST", "/api/bookings", { eventId: parseInt(id!) });
      const data = await response.json();
      
      // Invalidate bookings query
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/check/${id}`] });
      
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
  
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading event details...</p>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container py-5 text-center">
        <h2>Event Not Found</h2>
        <p>The event you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <section className="py-5">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{event.name}</li>
          </ol>
        </nav>

        <div className="row g-5">
          <div className="col-lg-8">
            <img 
              src={event.image} 
              alt={event.name} 
              className="img-fluid rounded-3 mb-4 shadow"
            />
            
            <h1 className="mb-3 font-heading">{event.name}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary" className="p-2">
                {event.categoryId === 1 ? "Music" : 
                 event.categoryId === 2 ? "Technology" : 
                 event.categoryId === 3 ? "Food & Drink" : 
                 event.categoryId === 4 ? "Education" : 
                 event.categoryId === 5 ? "Business" : 
                 event.categoryId === 6 ? "Health & Fitness" : "Event"}
              </Badge>
              {event.price === 0 && (
                <Badge variant="secondary" className="p-2">Free</Badge>
              )}
              <Badge variant="secondary" className="p-2">
                {new Date(event.date) > new Date() ? "Upcoming" : "Past Event"}
              </Badge>
            </div>
            
            <div className="mb-4">
              <h2 className="h4 mb-3">About This Event</h2>
              <p>{event.description}</p>
            </div>
            
            <div className="mb-4">
              <h2 className="h4 mb-3">What to Expect</h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item bg-light">
                  <svg className="text-success mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                  </svg>
                  Professional networking opportunities
                </li>
                <li className="list-group-item">
                  <svg className="text-success mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                  </svg>
                  Interactive sessions and workshops
                </li>
                <li className="list-group-item bg-light">
                  <svg className="text-success mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                  </svg>
                  Insights from industry experts
                </li>
                <li className="list-group-item">
                  <svg className="text-success mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                  </svg>
                  Opportunities for questions and discussions
                </li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h2 className="h4 mb-3">Venue Information</h2>
              <div className="mb-3 rounded-3 overflow-hidden" style={{ height: "250px", background: "#f0f0f0" }}>
                <iframe 
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304605!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2s${encodeURIComponent(event.address)}!5e0!3m2!1sen!2s!4v1659545586230!5m2!1sen!2s`} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
              <h3 className="h5">{event.venue}</h3>
              <p><MapPin className="text-danger inline mr-1" size={16} /> {event.address}</p>
            </div>
          </div>
          
          <div className="col-lg-4">
            <Card className="shadow-sm sticky-top" style={{ top: "100px" }}>
              <div className="card-body">
                <h3 className="card-title h4 mb-4">Event Details</h3>
                
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-primary rounded-full p-2 mr-3 text-white">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h4 className="h6 mb-0">Date & Time</h4>
                      <p className="mb-0">{format(new Date(event.date), "MMM d, yyyy | h:mm a")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="bg-primary rounded-full p-2 mr-3 text-white">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h4 className="h6 mb-0">Location</h4>
                      <p className="mb-0">{event.venue}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="bg-primary rounded-full p-2 mr-3 text-white">
                      <Ticket size={16} />
                    </div>
                    <div>
                      <h4 className="h6 mb-0">Price</h4>
                      <p className="mb-0">{event.price === 0 ? "Free" : `$${event.price} per person`}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-primary rounded-full p-2 mr-3 text-white">
                      <Users size={16} />
                    </div>
                    <div>
                      <h4 className="h6 mb-0">Availability</h4>
                      <p className="mb-0">{event.capacity} spots available</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-grid">
                    {checkingBooking ? (
                      <Button disabled>Checking booking status...</Button>
                    ) : bookingCheck?.isBooked ? (
                      <Button variant="secondary" disabled>Already Booked</Button>
                    ) : (
                      <Button 
                        onClick={bookEvent} 
                        disabled={booking}
                        size="lg"
                      >
                        {booking ? "Processing..." : "Book Now"}
                      </Button>
                    )}
                  </div>
                  <small className="text-muted mt-2 block text-center">Secure your spot today</small>
                </div>
                
                <div className="mb-4">
                  <h4 className="h6 mb-3">Share this event</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                      </svg>
                    </Button>
                    <Button size="sm" variant="outline">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                      </svg>
                    </Button>
                    <Button size="sm" variant="outline">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                      </svg>
                    </Button>
                    <Button size="sm" variant="outline">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="h6 mb-3">Contact Organizer</h4>
                  <p className="mb-2 flex items-center">
                    <Mail className="mr-2 text-muted" size={16} /> events@eventhub.com
                  </p>
                  <p className="mb-0 flex items-center">
                    <Phone className="mr-2 text-muted" size={16} /> (123) 456-7890
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;

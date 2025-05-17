import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

const BookingConfirmation: React.FC = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  // Fetch booking details
  const { data: bookingData, isLoading, error } = useQuery({
    queryKey: [`/api/bookings/${id}`],
    enabled: isAuthenticated && !!id,
    queryFn: async () => {
      const response = await fetch(`/api/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch booking details");
      const bookings = await response.json();
      
      // Find the specific booking
      return bookings.find(booking => booking.id === parseInt(id!));
    }
  });
  
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading booking details...</p>
      </div>
    );
  }
  
  if (!bookingData) {
    return (
      <div className="container py-5 text-center">
        <h2>Booking Not Found</h2>
        <p>The booking you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }
  
  const event = bookingData.event;
  
  return (
    <section className="py-5 bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <Card className="shadow-lg border-0">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <div className="bg-success text-white rounded-full mx-auto flex items-center justify-center" style={{ width: "80px", height: "80px" }}>
                    <CheckCircle size={40} />
                  </div>
                </div>
                
                <h1 className="mb-4 h2 font-heading">Booking Confirmed!</h1>
                <p className="lead mb-4">Thank you for booking your ticket to {event.name}. We're excited to see you there!</p>
                
                <Card className="mb-4 border-0 bg-light">
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-sm-6 text-sm-end text-start text-muted">Event:</div>
                      <div className="col-sm-6 text-sm-start text-start fw-bold">{event.name}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-sm-6 text-sm-end text-start text-muted">Date & Time:</div>
                      <div className="col-sm-6 text-sm-start text-start">
                        {format(new Date(event.date), "MMM d, yyyy | h:mm a")}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-sm-6 text-sm-end text-start text-muted">Venue:</div>
                      <div className="col-sm-6 text-sm-start text-start">{event.venue}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-sm-6 text-sm-end text-start text-muted">Ticket Type:</div>
                      <div className="col-sm-6 text-sm-start text-start">Standard Admission</div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6 text-sm-end text-start text-muted">Booking Reference:</div>
                      <div className="col-sm-6 text-sm-start text-start font-monospace">{bookingData.referenceNumber}</div>
                    </div>
                  </div>
                </Card>
                
                <p className="mb-4">A confirmation email has been sent to your registered email address with all the details.</p>
                
                <div className="flex flex-col flex-sm-row gap-2 justify-content-center">
                  <Link href="/">
                    <Button className="w-full sm:w-auto">Back to Home</Button>
                  </Link>
                  <Link href="/my-bookings">
                    <Button variant="outline" className="w-full sm:w-auto">View My Bookings</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingConfirmation;

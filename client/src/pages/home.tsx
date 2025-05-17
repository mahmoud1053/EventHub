import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { EventCard } from "@/components/ui/events/event-card";
import { CategoryFilter } from "@/components/ui/events/category-filter";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;
  
  // Fetch all events
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/events?categoryId=${selectedCategory}` 
        : "/api/events";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    }
  });
  
  // Fetch user bookings if authenticated
  const { data: bookings, isLoading: loadingBookings } = useQuery({
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
  
  // Filter events by search term
  const filteredEvents = events?.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Check if user has booked an event
  const hasBooked = (eventId: number) => {
    return bookings?.some(booking => booking.eventId === eventId);
  };
  
  // Pagination logic
  const totalPages = Math.ceil((filteredEvents?.length || 0) / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = filteredEvents?.slice(startIndex, startIndex + eventsPerPage);
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Reset pagination when changing filters
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);
  
  return (
    <div id="home-page">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">Discover Amazing Events Near You</h1>
              <p className="lead mb-4">Browse through hundreds of events, from conferences to workshops, concerts to workshops. Book your spot with just a few clicks.</p>
              <div className="flex flex-wrap gap-2">
                <a href="#events" className="btn btn-light btn-lg px-4 me-md-2">Explore Events</a>
                <a href="#featured" className="btn btn-outline-light btn-lg px-4">Featured Events</a>
              </div>
            </div>
            <div className="col-lg-6">
              {/* A crowded concert with people enjoying live music */}
              <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=800" alt="Exciting event with audience" className="img-fluid rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      {/* Event Listing */}
      <section id="events" className="py-5">
        <div className="container">
          <h2 className="mb-4 font-heading">
            {selectedCategory ? "Filtered Events" : "Upcoming Events"}
            {searchTerm && ` - Search: "${searchTerm}"`}
          </h2>
          
          {isLoading ? (
            <div className="row g-4">
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading events...</p>
              </div>
            </div>
          ) : filteredEvents?.length === 0 ? (
            <div className="row g-4">
              <div className="col-12 text-center py-5">
                <p className="lead">No events found. Please try a different search or category.</p>
                <Button onClick={() => { setSelectedCategory(null); setSearchTerm(""); }}>
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {paginatedEvents?.map(event => (
                <div key={event.id} className="col-md-6 col-lg-4">
                  <EventCard
                    event={event}
                    isBooked={isAuthenticated && hasBooked(event.id)}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav aria-label="Event pagination">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </button>
                  </li>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/ui/admin/sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Users, Ticket, DollarSign, ArrowRight } from "lucide-react";

const AdminDashboard: React.FC = () => {
  // Fetch events
  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    }
  });
  
  // Fetch bookings
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["/api/bookings"],
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
  
  const isLoading = loadingEvents || loadingBookings;
  
  // Calculate dashboard stats
  const totalEvents = events?.length || 0;
  const totalBookings = bookings?.length || 0;
  const totalRevenue = bookings?.reduce((sum, booking) => {
    const event = events?.find(e => e.id === booking.eventId);
    return sum + (event?.price || 0);
  }, 0) || 0;
  
  // Prepare chart data for events by category
  const eventsByCategory = events?.reduce((acc, event) => {
    const categoryName = 
      event.categoryId === 1 ? "Music" : 
      event.categoryId === 2 ? "Technology" : 
      event.categoryId === 3 ? "Food & Drink" : 
      event.categoryId === 4 ? "Education" : 
      event.categoryId === 5 ? "Business" : 
      event.categoryId === 6 ? "Health & Fitness" : "Other";
    
    const existingCategory = acc.find(c => c.name === categoryName);
    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      acc.push({ name: categoryName, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]) || [];
  
  // Get upcoming events
  const upcomingEvents = events
    ?.filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
  
  // Get recent bookings
  const recentBookings = bookings
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return (
    <div className="container-fluid">
      <div className="row">
        <AdminSidebar />
        
        <div className="col-lg-10 p-0 bg-light">
          <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0">Dashboard</h1>
            <div className="d-flex align-items-center">
              <span className="mr-2 text-muted">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </header>
          
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading dashboard data...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6 col-lg-3">
                    <Card className="h-100">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h2 className="h6 mb-0 text-muted">Total Events</h2>
                          <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                            <Calendar className="text-primary" size={24} />
                          </div>
                        </div>
                        <h3 className="h2 mb-0">{totalEvents}</h3>
                        <div className="progress mt-3" style={{ height: "4px" }}>
                          <div className="progress-bar bg-primary" style={{ width: "75%" }}></div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="col-md-6 col-lg-3">
                    <Card className="h-100">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h2 className="h6 mb-0 text-muted">Total Bookings</h2>
                          <div className="bg-secondary bg-opacity-10 p-2 rounded-circle">
                            <Ticket className="text-secondary" size={24} />
                          </div>
                        </div>
                        <h3 className="h2 mb-0">{totalBookings}</h3>
                        <div className="progress mt-3" style={{ height: "4px" }}>
                          <div className="progress-bar bg-secondary" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="col-md-6 col-lg-3">
                    <Card className="h-100">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h2 className="h6 mb-0 text-muted">Total Revenue</h2>
                          <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                            <DollarSign className="text-success" size={24} />
                          </div>
                        </div>
                        <h3 className="h2 mb-0">${totalRevenue.toFixed(2)}</h3>
                        <div className="progress mt-3" style={{ height: "4px" }}>
                          <div className="progress-bar bg-success" style={{ width: "85%" }}></div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="col-md-6 col-lg-3">
                    <Card className="h-100">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h2 className="h6 mb-0 text-muted">Booking Rate</h2>
                          <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                            <Users className="text-info" size={24} />
                          </div>
                        </div>
                        <h3 className="h2 mb-0">
                          {totalEvents > 0 
                            ? Math.round((totalBookings / totalEvents) * 100) 
                            : 0}%
                        </h3>
                        <div className="progress mt-3" style={{ height: "4px" }}>
                          <div 
                            className="progress-bar bg-info" 
                            style={{ 
                              width: `${totalEvents > 0 
                                ? Math.round((totalBookings / totalEvents) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                
                {/* Events by Category Chart */}
                <div className="row g-4 mb-4">
                  <div className="col-lg-8">
                    <Card className="h-100">
                      <div className="card-header bg-white py-3">
                        <h2 className="h5 mb-0">Events by Category</h2>
                      </div>
                      <div className="card-body">
                        <div style={{ height: "300px" }}>
                          {eventsByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={eventsByCategory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Number of Events" />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="d-flex justify-content-center align-items-center h-100">
                              <p className="text-muted">No category data available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="col-lg-4">
                    <Card className="h-100">
                      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h2 className="h5 mb-0">Upcoming Events</h2>
                        <Link href="/admin/events">
                          <Button variant="ghost" size="sm" className="p-0">
                            <ArrowRight size={16} />
                          </Button>
                        </Link>
                      </div>
                      <div className="card-body p-0">
                        <ul className="list-group list-group-flush">
                          {upcomingEvents?.length ? (
                            upcomingEvents.map(event => (
                              <li key={event.id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="fw-medium mb-0">{event.name}</p>
                                    <small className="text-muted">
                                      {new Date(event.date).toLocaleDateString()} | {event.venue}
                                    </small>
                                  </div>
                                  <Badge className={
                                    event.categoryId === 1 ? "bg-primary" : 
                                    event.categoryId === 2 ? "bg-info" : 
                                    event.categoryId === 3 ? "bg-success" : 
                                    event.categoryId === 4 ? "bg-warning" : 
                                    event.categoryId === 5 ? "bg-danger" : "bg-secondary"
                                  }>
                                    {event.categoryId === 1 ? "Music" : 
                                     event.categoryId === 2 ? "Technology" : 
                                     event.categoryId === 3 ? "Food & Drink" : 
                                     event.categoryId === 4 ? "Education" : 
                                     event.categoryId === 5 ? "Business" : 
                                     event.categoryId === 6 ? "Health & Fitness" : "Other"}
                                  </Badge>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="list-group-item text-center py-4">
                              <p className="mb-0 text-muted">No upcoming events</p>
                            </li>
                          )}
                        </ul>
                      </div>
                    </Card>
                  </div>
                </div>
                
                {/* Recent Bookings */}
                <div className="row">
                  <div className="col-12">
                    <Card>
                      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h2 className="h5 mb-0">Recent Bookings</h2>
                        <Link href="/admin/bookings">
                          <Button variant="ghost" size="sm" className="p-0">
                            <ArrowRight size={16} />
                          </Button>
                        </Link>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="bg-light">
                              <tr>
                                <th scope="col">Reference</th>
                                <th scope="col">Event</th>
                                <th scope="col">User</th>
                                <th scope="col">Date</th>
                                <th scope="col">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentBookings?.length ? (
                                recentBookings.map(booking => {
                                  const event = events?.find(e => e.id === booking.eventId);
                                  return (
                                    <tr key={booking.id}>
                                      <td className="font-monospace">{booking.referenceNumber}</td>
                                      <td>{event?.name || 'Unknown Event'}</td>
                                      <td>User #{booking.userId}</td>
                                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                                      <td>
                                        <span className="badge bg-success">Confirmed</span>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-4">
                                    <p className="mb-0 text-muted">No recent bookings</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, className }) => {
  return (
    <span className={`badge ${className}`}>{children}</span>
  );
};

export default AdminDashboard;

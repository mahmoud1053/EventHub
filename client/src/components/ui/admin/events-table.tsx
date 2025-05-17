import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
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
import { AddEventModal } from "../events/add-event-modal";
import { format } from "date-fns";
import { Edit, Trash, Eye } from "lucide-react";
import { Link } from "wouter";

export const EventsTable: React.FC = () => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (id: number) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete);
    }
    setDeleteDialogOpen(false);
  };
  
  const handleEdit = (event: Event) => {
    setEventToEdit(event);
    setAddEventModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEventToEdit(null);
    setAddEventModalOpen(true);
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading events...</div>;
  }
  
  return (
    <>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="h5 mb-0">All Events</h2>
          <p className="text-muted mb-0 small">Manage your events</p>
        </div>
        <Button onClick={handleAddNew}>
          <span className="material-icons-outlined mr-1">add</span> Add New Event
        </Button>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" style={{ width: "50px" }}>#</th>
                  <th scope="col">Event</th>
                  <th scope="col">Date</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col">Capacity</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ width: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events?.map((event, index) => (
                  <tr key={event.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={event.image} 
                          alt={event.name} 
                          className="rounded mr-3" 
                          style={{ width: "50px", height: "30px", objectFit: "cover" }}
                        />
                        <span>{event.name}</span>
                      </div>
                    </td>
                    <td>{format(new Date(event.date), "MMM d, yyyy")}</td>
                    <td>
                      {event.categoryId === 1 ? "Music" : 
                       event.categoryId === 2 ? "Technology" : 
                       event.categoryId === 3 ? "Food & Drink" : 
                       event.categoryId === 4 ? "Education" : 
                       event.categoryId === 5 ? "Business" : 
                       event.categoryId === 6 ? "Health & Fitness" : "Other"}
                    </td>
                    <td>{event.price === 0 ? "Free" : `$${event.price}`}</td>
                    <td>{event.capacity}</td>
                    <td>
                      <span className="badge bg-success">Active</span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Link href={`/events/${event.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {events?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      No events found. Click "Add New Event" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event and all associated bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AddEventModal 
        isOpen={addEventModalOpen} 
        onOpenChange={setAddEventModalOpen}
        eventToEdit={eventToEdit}
      />
    </>
  );
};

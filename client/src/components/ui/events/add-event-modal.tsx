import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

const eventSchema = z.object({
  name: z.string().min(3, { message: "Event name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  date: z.string().min(1, { message: "Please provide a date" }),
  time: z.string().min(1, { message: "Please provide a time" }),
  venue: z.string().min(3, { message: "Venue must be at least 3 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  price: z.string().min(0, { message: "Price must be a positive number" }),
  capacity: z.string().min(1, { message: "Please provide capacity" }),
  image: z.string().url({ message: "Please provide a valid image URL" }),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AddEventModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventToEdit?: any; // Use proper type if editing functionality is implemented
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ 
  isOpen, 
  onOpenChange,
  eventToEdit
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: eventToEdit?.name || "",
      description: eventToEdit?.description || "",
      categoryId: eventToEdit?.categoryId?.toString() || "",
      date: eventToEdit?.date ? new Date(eventToEdit.date).toISOString().split("T")[0] : "",
      time: eventToEdit?.date ? new Date(eventToEdit.date).toTimeString().slice(0, 5) : "",
      venue: eventToEdit?.venue || "",
      address: eventToEdit?.address || "",
      price: eventToEdit?.price?.toString() || "0",
      capacity: eventToEdit?.capacity?.toString() || "100",
      image: eventToEdit?.image || "",
    },
  });
  
  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const eventDate = new Date(`${data.date}T${data.time}`);
      
      const eventData = {
        name: data.name,
        description: data.description,
        categoryId: parseInt(data.categoryId),
        date: eventDate.toISOString(),
        venue: data.venue,
        address: data.address,
        price: parseFloat(data.price),
        capacity: parseInt(data.capacity),
        image: data.image,
      };
      
      if (eventToEdit) {
        // Update existing event
        await apiRequest("PUT", `/api/events/${eventToEdit.id}`, eventData);
        toast({
          title: "Event Updated",
          description: "The event has been updated successfully.",
        });
      } else {
        // Create new event
        await apiRequest("POST", "/api/events", eventData);
        toast({
          title: "Event Created",
          description: "The new event has been created successfully.",
        });
      }
      
      // Invalidate events query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            {eventToEdit ? "Edit Event" : "Add New Event"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCategories ? (
                          <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                        ) : (
                          categories?.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time*</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter venue name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter venue address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)*</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="Enter price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity*</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="Enter capacity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Event Image URL*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter event description" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : eventToEdit ? "Update Event" : "Save Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

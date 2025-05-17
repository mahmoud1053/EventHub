import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { z } from "zod";
import { authenticate, authorizeAdmin, attachUser, generateToken } from "./middleware/auth";
import { insertEventSchema, insertUserSchema, loginSchema, registerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Attach user data for all requests
  app.use(attachUser);
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Create user (password hashing is done in storage)
      const { confirmPassword, ...userData } = data;
      const user = await storage.createUser(userData);
      
      // Generate JWT token
      const token = generateToken(user.id, user.isAdmin);
      
      // Return user info without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = generateToken(user.id, user.isAdmin);
      
      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to log in" });
    }
  });
  
  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      // Get user from storage
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user info without password
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user info" });
    }
  });
  
  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let events;
      if (categoryId) {
        events = await storage.getEventsByCategory(categoryId);
      } else {
        events = await storage.getEvents();
      }
      
      return res.json(events);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      return res.json(event);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  
  app.post("/api/events", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      
      return res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  app.put("/api/events/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      
      const event = await storage.updateEvent(id, eventData);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      return res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  app.delete("/api/events/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      return res.json({ message: "Event deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Bookings routes
  app.get("/api/bookings", authenticate, async (req, res) => {
    try {
      // Regular users can only see their own bookings
      // Admins can see all bookings
      const bookings = req.user!.isAdmin
        ? await storage.getBookings()
        : await storage.getUserBookings(req.user!.userId);
      
      // Get related events for each booking
      const bookingsWithEvents = await Promise.all(
        bookings.map(async (booking) => {
          const event = await storage.getEvent(booking.eventId);
          return {
            ...booking,
            event
          };
        })
      );
      
      return res.json(bookingsWithEvents);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  app.post("/api/bookings", authenticate, async (req, res) => {
    try {
      const { eventId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }
      
      // Check if event exists
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user already booked this event
      const existingBooking = await storage.getUserBookingForEvent(req.user!.userId, parseInt(eventId));
      if (existingBooking) {
        return res.status(400).json({ message: "You have already booked this event" });
      }
      
      // Create booking
      const booking = await storage.createBooking({
        userId: req.user!.userId,
        eventId: parseInt(eventId),
        referenceNumber: "" // Will be generated in storage
      });
      
      return res.status(201).json({
        ...booking,
        event
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  app.delete("/api/bookings/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the booking
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if the user owns the booking or is an admin
      if (booking.userId !== req.user!.userId && !req.user!.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to cancel this booking" });
      }
      
      // Delete the booking
      const success = await storage.deleteBooking(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to cancel booking" });
      }
      
      return res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to cancel booking" });
    }
  });
  
  // Check if user has booked an event
  app.get("/api/bookings/check/:eventId", authenticate, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      const booking = await storage.getUserBookingForEvent(req.user!.userId, eventId);
      
      return res.json({
        isBooked: !!booking,
        booking
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to check booking status" });
    }
  });
  
  return httpServer;
}

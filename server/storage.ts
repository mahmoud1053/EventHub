import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import {
  User,
  InsertUser,
  Event,
  InsertEvent,
  Category,
  InsertCategory,
  Booking,
  InsertBooking,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByCategory(categoryId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getUserBookingForEvent(userId: number, eventId: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Initialize default data
  initializeDefaultData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private events: Map<number, Event>;
  private bookings: Map<number, Booking>;
  private userId: number;
  private categoryId: number;
  private eventId: number;
  private bookingId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.events = new Map();
    this.bookings = new Map();
    this.userId = 1;
    this.categoryId = 1;
    this.eventId = 1;
    this.bookingId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, password: hashedPassword, createdAt };
    
    this.users.set(id, user);
    return user;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    
    this.categories.set(id, category);
    return category;
  }
  
  // Event operations
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventsByCategory(categoryId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.categoryId === categoryId
    );
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const createdAt = new Date();
    const event: Event = { ...insertEvent, id, createdAt };
    
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    
    if (!event) {
      return undefined;
    }
    
    const updatedEvent: Event = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  
  async getUserBookingForEvent(userId: number, eventId: number): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      (booking) => booking.userId === userId && booking.eventId === eventId
    );
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const createdAt = new Date();
    
    // Generate a reference number if not provided
    const referenceNumber = insertBooking.referenceNumber || this.generateReferenceNumber(insertBooking.eventId);
    
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt,
      referenceNumber
    };
    
    this.bookings.set(id, booking);
    return booking;
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }
  
  // Helper method to generate a unique booking reference
  private generateReferenceNumber(eventId: number): string {
    const event = this.events.get(eventId);
    const prefix = event ? event.name.substring(0, 2).toUpperCase() : "EV";
    const year = new Date().getFullYear();
    const random = nanoid(8).toUpperCase();
    
    return `${prefix}${year}-${random}`;
  }
  
  // Initialize with default data
  async initializeDefaultData(): Promise<void> {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin: User = {
      id: this.userId++,
      username: "admin",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      email: "admin@eventhub.com",
      isAdmin: true,
      createdAt: new Date()
    };
    this.users.set(admin.id, admin);
    
    // Create regular user
    const userPassword = await bcrypt.hash("user123", 10);
    const user: User = {
      id: this.userId++,
      username: "johndoe",
      password: userPassword,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      isAdmin: false,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    
    // Create categories
    const categories = [
      { name: "Music", icon: "fas fa-music" },
      { name: "Technology", icon: "fas fa-laptop-code" },
      { name: "Food & Drink", icon: "fas fa-utensils" },
      { name: "Education", icon: "fas fa-graduation-cap" },
      { name: "Business", icon: "fas fa-briefcase" },
      { name: "Health & Fitness", icon: "fas fa-dumbbell" }
    ];
    
    for (const cat of categories) {
      await this.createCategory(cat);
    }
    
    // Create sample events
    const events = [
      {
        name: "Annual Tech Conference 2023",
        description: "Join us for the biggest tech event of the year featuring keynotes, workshops, and networking opportunities with industry leaders from around the world.",
        categoryId: 2, // Technology
        date: new Date("2023-10-15T09:00:00"),
        venue: "Tech Center",
        address: "123 Tech Avenue, New York, NY 10001",
        price: 199,
        capacity: 500,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500"
      },
      {
        name: "Summer Music Festival",
        description: "Experience the best music under the summer sky with top artists and bands from around the world.",
        categoryId: 1, // Music
        date: new Date("2023-08-20T14:00:00"),
        venue: "Central Park",
        address: "Central Park, New York, NY 10022",
        price: 85,
        capacity: 2000,
        image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500"
      },
      {
        name: "Food & Wine Festival 2023",
        description: "Taste exceptional cuisine from award-winning chefs paired with the finest wines from around the world.",
        categoryId: 3, // Food & Drink
        date: new Date("2023-09-10T12:00:00"),
        venue: "Grand Hotel",
        address: "500 Hotel Drive, Boston, MA 02108",
        price: 75,
        capacity: 1000,
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500"
      },
      {
        name: "Business Leadership Workshop",
        description: "Develop your leadership skills with industry experts in this intensive one-day workshop for professionals.",
        categoryId: 5, // Business
        date: new Date("2023-11-05T09:00:00"),
        venue: "Business Center",
        address: "789 Corporate Boulevard, Chicago, IL 60601",
        price: 120,
        capacity: 100,
        image: "https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500"
      },
      {
        name: "Fitness Expo 2023",
        description: "Discover the latest in fitness trends, equipment, supplements, and workout techniques from top trainers.",
        categoryId: 6, // Health & Fitness
        date: new Date("2023-10-28T10:00:00"),
        venue: "Sports Arena",
        address: "123 Stadium Way, Los Angeles, CA 90001",
        price: 50,
        capacity: 800,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500"
      },
      {
        name: "Future of AI Education Seminar",
        description: "Explore how artificial intelligence is transforming education with leading researchers and educators.",
        categoryId: 4, // Education
        date: new Date("2023-12-12T13:00:00"),
        venue: "University Hall",
        address: "100 University Drive, San Francisco, CA 94103",
        price: 0,
        capacity: 200,
        image: "https://pixabay.com/get/g5debfeeff0ffc054528e52d3998a02893927eefae1e090671f8b2273a983a911ec94992c49e49720ddb277aabae39ce949108b41e9952a80cdd3449abf9b41fa_1280.jpg"
      }
    ];
    
    for (const evt of events) {
      await this.createEvent(evt);
    }
    
    // Create a booking for the regular user
    const booking: InsertBooking = {
      userId: user.id,
      eventId: 2, // Summer Music Festival
      referenceNumber: "MF2023-ABCD1234"
    };
    
    await this.createBooking(booking);
  }
}

export const storage = new MemStorage();
storage.initializeDefaultData();

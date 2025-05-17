import React from "react";
import { Link, useLocation } from "wouter";
import { Calendar, LayoutDashboard, PieChart, Ticket, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export const AdminSidebar: React.FC = () => {
  const [location] = useLocation();
  const { logout } = useAuth();
  
  return (
    <div className="bg-sidebar col-lg-2 p-0 min-vh-100">
      <div className="d-flex flex-column text-white sticky-top" style={{ height: "100vh" }}>
        <div className="bg-primary p-3 d-flex align-items-center">
          <Calendar className="mr-2" />
          <span className="h5 mb-0 font-heading">Admin Panel</span>
        </div>
        <nav className="nav flex-column p-3">
          <Link href="/admin">
            <a className={`nav-link flex items-center py-2 text-white ${location === "/admin" ? "bg-sidebar-accent rounded" : ""}`}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </a>
          </Link>
          <Link href="/admin/events">
            <a className={`nav-link flex items-center py-2 text-white ${location === "/admin/events" ? "bg-sidebar-accent rounded" : ""}`}>
              <Calendar className="mr-2 h-4 w-4" /> Events
            </a>
          </Link>
          <Link href="/admin/bookings">
            <a className={`nav-link flex items-center py-2 text-white ${location === "/admin/bookings" ? "bg-sidebar-accent rounded" : ""}`}>
              <Ticket className="mr-2 h-4 w-4" /> Bookings
            </a>
          </Link>
          <Link href="/admin/users">
            <a className={`nav-link flex items-center py-2 text-white ${location === "/admin/users" ? "bg-sidebar-accent rounded" : ""}`}>
              <Users className="mr-2 h-4 w-4" /> Users
            </a>
          </Link>
          <Link href="/admin/settings">
            <a className={`nav-link flex items-center py-2 text-white ${location === "/admin/settings" ? "bg-sidebar-accent rounded" : ""}`}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </a>
          </Link>
        </nav>
        <div className="mt-auto p-3 border-top border-secondary">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

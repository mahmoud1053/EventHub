import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoginModal } from "../auth/login-modal";
import { RegisterModal } from "../auth/register-modal";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, LogOut, Settings, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center font-bold text-primary text-xl font-heading">
                <Calendar className="mr-2" />
                EventHub
              </a>
            </Link>
            
            <div className="hidden md:flex ml-8 space-x-4">
              <Link href="/">
                <a className={`nav-link ${location === "/" ? "text-primary font-medium" : "text-gray-600"}`}>
                  Home
                </a>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link href="/my-bookings">
                    <a className={`nav-link ${location === "/my-bookings" ? "text-primary font-medium" : "text-gray-600"}`}>
                      My Bookings
                    </a>
                  </Link>
                  
                  {user?.isAdmin && (
                    <Link href="/admin">
                      <a className={`nav-link ${location.startsWith("/admin") ? "text-primary font-medium" : "text-gray-600"}`}>
                        Admin Panel
                      </a>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => setLoginModalOpen(true)}>
                  Login
                </Button>
                <Button onClick={() => setRegisterModalOpen(true)}>
                  Register
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=40&h=40" />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings">
                      <a className="flex cursor-pointer items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>My Bookings</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button className="flex w-full cursor-pointer items-center" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      <LoginModal 
        isOpen={loginModalOpen} 
        onOpenChange={setLoginModalOpen}
        onRegisterClick={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
      />
      
      <RegisterModal 
        isOpen={registerModalOpen} 
        onOpenChange={setRegisterModalOpen} 
        onLoginClick={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </nav>
  );
};

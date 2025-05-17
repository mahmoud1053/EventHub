import React from "react";
import { AdminSidebar } from "@/components/ui/admin/sidebar";
import { EventsTable } from "@/components/ui/admin/events-table";

const AdminEvents: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <AdminSidebar />
        
        <div className="col-lg-10 p-0 bg-light">
          <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0">Events Management</h1>
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
            <EventsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;

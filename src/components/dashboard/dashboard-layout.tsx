"use client";

import React, { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import DashboardOverview from "./dashboard-overview";
import UsersPage from "./users-page";
import OrdersPage from "./orders-page";

interface DashboardLayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

const DashboardLayout = ({ children, onLogout }: DashboardLayoutProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen((prevState) => !prevState);
  };
  console.log("Google api key", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  console.log("ENV:", process.env);
  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UsersPage />;
      case "orders":
        return <OrdersPage />;
      case "settings":
        return (
          <div className="p-8 text-center text-gray-500">
            Settings page coming soon...
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={handleMenuClick} onLogout={onLogout} />

        <main className="flex-1 overflow-y-auto p-6">
          {children || renderPage()}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {/* {sidebarOpen && (
        <div
          className="fixed inset-0 opacity-50 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )} */}
    </div>
  );
};

export default DashboardLayout;

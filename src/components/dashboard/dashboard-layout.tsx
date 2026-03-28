"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import Header from "./header";
import DashboardOverview from "./dashboard-overview";
import UsersPage from "./users-page";
import OrdersPage from "./orders-page";
import api from "@/lib/axiosInstance";

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleMenuClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // redirect regardless — if logout API fails the session is likely already invalid
    } finally {
      router.push("/auth");
    }
  };

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
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={handleMenuClick} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

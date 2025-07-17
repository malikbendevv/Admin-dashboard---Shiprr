"use client";

import React from "react";
import { Users, ShoppingCart, Settings } from "lucide-react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: "Home" },

  { id: "users", label: "Users", icon: Users },

  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold  text-gray-800">Admin Panel</h1>
      </div>

      <nav className="mt-8">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-500 
                ${
                  activeTab === item.id
                    ? "bg-gray-100 border-r-2 border-blue-500"
                    : ""
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />

              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

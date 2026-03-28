"use client";

import React from "react";
import { Home, Users, ShoppingCart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "users", label: "Users", icon: Users },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, onLogout }: SidebarProps) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
      </div>

      <nav className="mt-4 flex-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors
                ${
                  activeTab === item.id
                    ? "bg-blue-50 border-r-2 border-blue-500 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {onLogout && (
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

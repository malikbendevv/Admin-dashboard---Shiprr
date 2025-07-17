export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Customer" | "Driver";
  avatar?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: unknown;
  color: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: unknown;
  href?: string;
}

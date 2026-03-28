export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface Address {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface PaginationInfo {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  usersFetched: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
  data?: User[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: User[] | number | PaginationInfo | undefined;
}

export interface Params {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  role?: "admin" | "customer" | "driver" | "";
}

export interface NeedsRefresh {
  needsRefresh: true;
  status: 401;
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

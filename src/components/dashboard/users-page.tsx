"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { useUsers, User } from "@/hooks/useUsers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserForm from "./models/userForm";

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

// Helper function to format date using Day.js
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = dayjs(dateString);
  return date.format("MMM D, YYYY h:mm A"); // e.g., "Jul 10, 2025 12:57 PM"
};

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [formType, setFormType] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [open, setOpen] = useState(false);

  // Sorting state (only for createdAt)
  const [sortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Status filter
  const [roleFilter, setRoleFilter] = useState<
    "customer" | "admin" | "driver" | ""
  >("");

  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Update debounced search term after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addOrEditUser = (type: string) => {
    if (type === "add") {
      setFormType("add");
    }
    {
      setFormType("edit");
    }
  };

  // Handle sort change (only for createdAt)
  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setPage(1); // Reset to first page when sorting
  };

  // Handle role filter change
  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const { data, isLoading, error } = useUsers({
    page,
    limit: 1, // Changed back to 1 as requested
    search: debouncedSearchTerm,
    sort: sortField,
    order: sortOrder,
    role: roleFilter,
  });

  console.log({ data });

  // Handle the new nested data structure
  const users = (data?.users || []) as User[];
  const pagination = data?.pagination;
  const total = pagination?.totalUsers || 0;
  const currentPage = pagination?.currentPage || 1;
  const limit = pagination?.limit || data?.limit || 1;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit);
  const hasNextPage = pagination?.hasNextPage || false;
  const hasPreviousPage = pagination?.hasPreviousPage || false;

  // Debug pagination values
  console.log("Pagination Debug:", {
    total,
    limit,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    calculatedTotalPages: Math.ceil(total / limit),
    paginationFromBackend: pagination?.totalPages,
  });

  // Remove frontend filtering since we're now using backend search
  const filteredUsers = users;

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: "Admin" | "Customer" | "Driver" | string) => {
    const colors = {
      Admin: "bg-purple-100 text-purple-800",
      Customer: "bg-blue-100 text-blue-800",
      Driver: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge
        className={
          colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {role}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-2">Loading users...</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading users...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-2">Error loading users</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-red-500">Error: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">
            Manage your users and their permissions ({total} total users)
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setFormType("add");
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Users ({total})</CardTitle>
            <div className="flex gap-4 items-center">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {/* Status Filter Dropdown */}
              <select
                value={roleFilter}
                onChange={handleRoleFilter}
                className="border rounded px-2 py-1 text-sm text-gray-700"
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="min-w-[120px] max-w-[180px] cursor-pointer select-none"
                  onClick={() => handleSort()}
                >
                  Name
                  {sortField === "firstName" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="min-w-[180px] max-w-[240px] cursor-pointer select-none"
                  onClick={() => handleSort()}
                >
                  Email
                  {sortField === "email" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="min-w-[100px] max-w-[120px] cursor-pointer select-none"
                  onClick={() => handleSort()}
                >
                  Role
                  {sortField === "role" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="min-w-[100px] max-w-[120px] cursor-pointer select-none"
                  onClick={() => handleSort()}
                >
                  Status
                  {sortField === "status" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="min-w-[140px] max-w-[180px] cursor-pointer select-none"
                  onClick={() => handleSort()}
                >
                  Join Date
                  {sortField === "createdAt" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </TableHead>
                <TableHead className="min-w-[100px] max-w-[120px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium truncate max-w-[180px]">
                      {user.firstName + " " + user.lastName || "N/A"}
                    </TableCell>
                    <TableCell className="truncate max-w-[240px]">
                      {user.email}
                    </TableCell>
                    <TableCell className="truncate max-w-[120px]">
                      {getRoleBadge(user.role || "Customer")}
                    </TableCell>
                    <TableCell className="truncate max-w-[120px]">
                      {getStatusBadge(user.status || "Active")}
                    </TableCell>
                    <TableCell className="truncate max-w-[180px]">
                      {formatDate(user.createdAt || "")}
                    </TableCell>
                    <TableCell className="truncate max-w-[120px]">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {formType === "add" ? "Add User" : "Edit User"}
                </DialogTitle>
              </DialogHeader>

              <UserForm
                mode={formType}
                initialValues={selectedUser}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          {total > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, total)} of {total} users
                {debouncedSearchTerm && (
                  <span className="ml-2 text-blue-600">
                    (filtered by &quot;{debouncedSearchTerm}&quot;)
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={!hasPreviousPage}
                  className="hidden sm:flex"
                >
                  First
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={!hasPreviousPage}
                >
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={!hasNextPage}
                  className="hidden sm:flex"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;

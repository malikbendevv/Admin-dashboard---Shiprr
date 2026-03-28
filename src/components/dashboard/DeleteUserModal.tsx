import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user?: { id: string; firstName?: string; lastName?: string; email?: string };
  loading?: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  open,
  onClose,
  onConfirm,
  user,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="text-red-600 font-semibold">
              Are you sure you want to delete this user?
            </div>
            <div className="text-gray-700">
              <span className="font-medium">Name:</span> {user?.firstName}{" "}
              {user?.lastName}
              <br />
              <span className="font-medium">Email:</span> {user?.email}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserModal;

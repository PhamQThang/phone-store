import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/lib/types";

interface UserDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetail({ open, onOpenChange, user }: UserDetailProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết người dùng
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>ID:</strong> {user.id}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Họ tên:</strong> {user.firstName} {user.lastName}
          </div>
          <div>
            <strong>Địa chỉ:</strong> {user.address || "Chưa có"}
          </div>
          <div>
            <strong>Số điện thoại:</strong> {user.phoneNumber || "Chưa có"}
          </div>
          <div>
            <strong>Vai trò:</strong> {user.role.name}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(user.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong>{" "}
            {new Date(user.updatedAt).toLocaleString()}
          </div>
          <div>
            <strong>Trạng thái:</strong>{" "}
            {user.isActive ? "Đang hoạt động" : "Đã xóa mềm"}
          </div>
          {user.deletedAt && (
            <div>
              <strong>Ngày xóa:</strong>{" "}
              {new Date(user.deletedAt).toLocaleString()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

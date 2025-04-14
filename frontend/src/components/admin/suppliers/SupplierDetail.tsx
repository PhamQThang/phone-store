// frontend/components/ui/admin/suppliers/SupplierDetail.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Supplier } from "@/lib/types";

interface SupplierDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

export function SupplierDetail({
  open,
  onOpenChange,
  supplier,
}: SupplierDetailProps) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết nhà cung cấp
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>ID:</strong> {supplier.id}
          </div>
          <div>
            <strong>Tên nhà cung cấp:</strong> {supplier.name}
          </div>
          <div>
            <strong>Địa chỉ:</strong> {supplier.address}
          </div>
          <div>
            <strong>Số điện thoại:</strong> {supplier.phone}
          </div>
          <div>
            <strong>Email:</strong> {supplier.email || "Không có"}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(supplier.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong>{" "}
            {new Date(supplier.updatedAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

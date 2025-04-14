// frontend/components/ui/admin/brands/BrandDetail.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Brand } from "@/lib/types";

interface BrandDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
}

export function BrandDetail({ open, onOpenChange, brand }: BrandDetailProps) {
  if (!brand) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết thương hiệu
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>ID:</strong> {brand.id}
          </div>
          <div>
            <strong>Tên thương hiệu:</strong> {brand.name}
          </div>
          <div>
            <strong>Slug:</strong> {brand.slug}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(brand.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong>{" "}
            {new Date(brand.updatedAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// frontend/components/ui/admin/models/ModelDetail.tsx
import { Model } from "@/api/admin/modelsApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModelDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: Model | null;
}

export function ModelDetail({ open, onOpenChange, model }: ModelDetailProps) {
  if (!model) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết model
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>ID:</strong> {model.id}
          </div>
          <div>
            <strong>Tên model:</strong> {model.name}
          </div>
          <div>
            <strong>Slug:</strong> {model.slug}
          </div>
          <div>
            <strong>Thương hiệu:</strong> {model.brand.name}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(model.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong>{" "}
            {new Date(model.updatedAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Color } from "@/lib/types";

interface ColorDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color: Color | null;
}

export function ColorDetail({ open, onOpenChange, color }: ColorDetailProps) {
  if (!color) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết màu sắc
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>ID:</strong> {color.id}
          </div>
          <div>
            <strong>Tên màu sắc:</strong> {color.name}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(color.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong>{" "}
            {new Date(color.updatedAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

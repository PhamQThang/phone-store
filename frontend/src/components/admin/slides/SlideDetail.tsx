"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slide } from "@/lib/types";
import Image from "next/image";

interface SlideDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: Slide | null;
}

export function SlideDetail({ open, onOpenChange, slide }: SlideDetailProps) {
  if (!slide) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết Slide</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>ID:</strong> {slide.id}
          </div>
          <div>
            <strong>Tiêu đề:</strong> {slide.title || "Không có tiêu đề"}
          </div>
          <div>
            <strong>Link:</strong> {slide.link || "Không có link"}
          </div>
          <div>
            <strong>Trạng thái:</strong>{" "}
            {slide.isActive ? "Hoạt động" : "Không hoạt động"}
          </div>
          <div>
            <strong>Thứ tự hiển thị:</strong> {slide.displayOrder}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(slide.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Hình ảnh:</strong>
            <div className="mt-2">
              <Image
                src={slide.image.url}
                alt={slide.title || "Slide"}
                width={128}
                height={128}
                className="w-full h-32 object-cover rounded"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

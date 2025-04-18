"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Color } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ColorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Color;
  isLoading: boolean;
}

export function ColorForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: ColorFormProps) {
  const [name, setName] = useState(initialData?.name || "");

  useEffect(() => {
    setName(initialData?.name || "");
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Sửa màu sắc" : "Thêm màu sắc"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm sm:text-base">
              Tên màu sắc
            </Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên màu sắc"
              className="text-sm sm:text-base"
              required
              minLength={2}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : initialData ? (
                "Cập nhật"
              ) : (
                "Thêm"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

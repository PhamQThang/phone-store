"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Warranty } from "@/lib/types";
import { Loader2 } from "lucide-react";

const warrantyStatusSchema = z.object({
  status: z.enum([
    "Requested",
    "Processing",
    "Repairing",
    "Repaired",
    "Returned",
    "Canceled",
  ]),
});

interface WarrantyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: string) => Promise<void>;
  initialData?: Warranty;
  isLoading: boolean;
}

export function WarrantyForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: WarrantyFormProps) {
  const form = useForm<z.infer<typeof warrantyStatusSchema>>({
    resolver: zodResolver(warrantyStatusSchema),
    defaultValues: {
      status: initialData?.status || "Requested",
    },
  });

  useEffect(() => {
    form.reset({
      status: initialData?.status || "Requested",
    });
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof warrantyStatusSchema>) => {
    try {
      await onSubmit(values.status);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const translateWarrantyStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Requested: "Đã yêu cầu",
      Processing: "Đang xử lý",
      Repairing: "Đang sửa chữa",
      Repaired: "Đã sửa xong",
      Returned: "Đã trả máy",
      Canceled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái phiếu bảo hành</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Requested">
                          {translateWarrantyStatus("Requested")}
                        </SelectItem>
                        <SelectItem value="Processing">
                          {translateWarrantyStatus("Processing")}
                        </SelectItem>
                        <SelectItem value="Repairing">
                          {translateWarrantyStatus("Repairing")}
                        </SelectItem>
                        <SelectItem value="Repaired">
                          {translateWarrantyStatus("Repaired")}
                        </SelectItem>
                        <SelectItem value="Returned">
                          {translateWarrantyStatus("Returned")}
                        </SelectItem>
                        <SelectItem value="Canceled">
                          {translateWarrantyStatus("Canceled")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Cập nhật"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

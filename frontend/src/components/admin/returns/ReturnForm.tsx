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
import { ProductReturn } from "@/lib/types";
import { Loader2 } from "lucide-react";

const returnStatusSchema = z.object({
  status: z.enum(["Pending", "Approved", "Rejected", "Completed"]),
});

interface ReturnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: string) => Promise<void>;
  initialData?: ProductReturn;
  isLoading: boolean;
}

export function ReturnForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: ReturnFormProps) {
  const form = useForm<z.infer<typeof returnStatusSchema>>({
    resolver: zodResolver(returnStatusSchema),
    defaultValues: {
      status: initialData?.status || "Pending",
    },
  });

  useEffect(() => {
    form.reset({
      status: initialData?.status || "Pending",
    });
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof returnStatusSchema>) => {
    try {
      await onSubmit(values.status);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const translateReturnStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Đang chờ",
      Approved: "Đã duyệt",
      Rejected: "Bị từ chối",
      Completed: "Hoàn tất",
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái yêu cầu đổi trả</DialogTitle>
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
                        <SelectItem value="Pending">
                          {translateReturnStatus("Pending")}
                        </SelectItem>
                        <SelectItem value="Approved">
                          {translateReturnStatus("Approved")}
                        </SelectItem>
                        <SelectItem value="Rejected">
                          {translateReturnStatus("Rejected")}
                        </SelectItem>
                        <SelectItem value="Completed">
                          {translateReturnStatus("Completed")}
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

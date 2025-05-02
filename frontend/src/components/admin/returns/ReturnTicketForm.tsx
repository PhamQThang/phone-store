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
import { ReturnTicket } from "@/lib/types";
import { Loader2 } from "lucide-react";

const returnTicketStatusSchema = z.object({
  status: z.enum([
    "Requested",
    "Processing",
    "Processed",
    "Returned",
    "Canceled",
  ]),
});

interface ReturnTicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: string) => Promise<void>;
  initialData?: ReturnTicket;
  isLoading: boolean;
}

export function ReturnTicketForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: ReturnTicketFormProps) {
  const form = useForm<z.infer<typeof returnTicketStatusSchema>>({
    resolver: zodResolver(returnTicketStatusSchema),
    defaultValues: {
      status: initialData?.status || "Requested",
    },
  });

  useEffect(() => {
    form.reset({
      status: initialData?.status || "Requested",
    });
  }, [initialData, form]);

  const handleSubmit = async (
    values: z.infer<typeof returnTicketStatusSchema>
  ) => {
    try {
      await onSubmit(values.status);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const translateReturnTicketStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Requested: "Đã yêu cầu",
      Processing: "Đang xử lý",
      Processed: "Đã xử lý",
      Returned: "Đã trả hàng",
      Canceled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái phiếu đổi trả</DialogTitle>
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
                          {translateReturnTicketStatus("Requested")}
                        </SelectItem>
                        <SelectItem value="Processing">
                          {translateReturnTicketStatus("Processing")}
                        </SelectItem>
                        <SelectItem value="Processed">
                          {translateReturnTicketStatus("Processed")}
                        </SelectItem>
                        <SelectItem value="Returned">
                          {translateReturnTicketStatus("Returned")}
                        </SelectItem>
                        <SelectItem value="Canceled">
                          {translateReturnTicketStatus("Canceled")}
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

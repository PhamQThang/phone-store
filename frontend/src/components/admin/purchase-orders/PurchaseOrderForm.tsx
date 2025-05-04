"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { getSuppliers } from "@/api/admin/suppliersApi";
import { getProducts } from "@/api/admin/productsApi";
import { getColors } from "@/api/admin/colorsApi";
import { Color, Product, PurchaseOrder, Supplier } from "@/lib/types";
import { Loader2 } from "lucide-react";

const purchaseOrderDetailSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  colorId: z.string().min(1, "Vui lòng chọn màu sắc"),
  imei: z.string().min(1, "IMEI không được để trống"),
  importPrice: z.number().min(0, "Giá nhập không được nhỏ hơn 0"),
});

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
  note: z.string().min(1, "Ghi chú không được để trống"),
  details: z.array(purchaseOrderDetailSchema).optional(),
});

interface PurchaseOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    supplierId: string;
    note?: string;
    status?: string;
    details: any[];
    detailsToDelete: string[];
    detailsToUpdate: any[];
  }) => Promise<void>;
  initialData?: PurchaseOrder;
  isLoading: boolean;
}

export function PurchaseOrderForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: PurchaseOrderFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [detailsToDelete, setDetailsToDelete] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: initialData?.supplierId || "",
      note: initialData?.note || "",
      details: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "details",
  });

  useEffect(() => {
    let isMounted = true;
    setIsFetching(true);
    const fetchData = async () => {
      try {
        const [suppliersData, productsData, colorsData] = await Promise.all([
          getSuppliers(),
          getProducts(),
          getColors(),
        ]);
        if (isMounted) {
          setSuppliers(suppliersData);
          setProducts(productsData.data);
          setColors(colorsData);
        }
      } catch (error: any) {
        toast.error("Lỗi khi lấy dữ liệu", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      const validDetails = (initialData.purchaseOrderDetails || []).map(
        (detail) => ({
          id: detail.id,
          productId: detail.productId,
          colorId: detail.colorId,
          imei: detail.imei || "",
          importPrice: detail.importPrice,
        })
      );
      form.reset({
        supplierId: initialData.supplierId,
        note: initialData.note || "",
        details: validDetails,
      });
      replace(validDetails);
      setDetailsToDelete([]);
    } else {
      form.reset({
        supplierId: "",
        note: "",
        details: [],
      });
      setDetailsToDelete([]);
    }
  }, [initialData, form, replace]);

  const handleDeleteDetail = (index: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chi tiết này?")) return;
    const detail = form.getValues(`details.${index}`);
    if (detail.id) {
      setDetailsToDelete((prev) => [...prev, detail.id]);
    }
    remove(index);
    toast.success("Đã xóa chi tiết khỏi giao diện");
  };

  const handleSubmit = async (values: z.infer<typeof purchaseOrderSchema>) => {
    if (!values.details || values.details.length === 0) {
      toast.error("Vui lòng thêm ít nhất một sản phẩm vào đơn nhập hàng");
      return;
    }

    const newDetails = values.details?.filter((detail) => !detail.id) || [];
    const updatedDetails = values.details?.filter((detail) => detail.id) || [];

    try {
      await onSubmit({
        supplierId: values.supplierId,
        note: values.note || undefined,
        status: initialData?.status || "Pending",
        details: newDetails,
        detailsToDelete,
        detailsToUpdate: updatedDetails,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Lỗi khi gửi dữ liệu", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Cập nhật đơn nhập hàng" : "Thêm đơn nhập hàng"}
          </DialogTitle>
        </DialogHeader>
        {isFetching ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Nhà cung cấp
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!initialData || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhà cung cấp" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Ghi chú
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập ghi chú"
                        {...field}
                        className="text-sm sm:text-base"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-medium">
                  Chi tiết đơn nhập hàng
                </h3>
                {fields.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-500">
                    Không có chi tiết đơn nhập hàng.
                  </p>
                ) : (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border p-4 rounded-md space-y-2"
                    >
                      <FormField
                        control={form.control}
                        name={`details.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">
                              Sản phẩm
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={
                                  !!form.getValues(`details.${index}.id`) ||
                                  isLoading
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn sản phẩm" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                    >
                                      {product.name} -{" "}
                                      {product.price.toLocaleString()} VNĐ
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-xs sm:text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`details.${index}.colorId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">
                              Màu sắc
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={
                                  !!form.getValues(`details.${index}.id`) ||
                                  isLoading
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn màu sắc" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colors.map((color) => (
                                    <SelectItem key={color.id} value={color.id}>
                                      {color.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-xs sm:text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`details.${index}.imei`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">
                              IMEI
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập IMEI"
                                {...field}
                                className="text-sm sm:text-base"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage className="text-xs sm:text-sm" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`details.${index}.importPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">
                              Giá nhập (VNĐ)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Nhập giá nhập"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                className="text-sm sm:text-base"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage className="text-xs sm:text-sm" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDetail(index)}
                        disabled={isLoading}
                      >
                        Xóa sản phẩm
                      </Button>
                    </div>
                  ))
                )}
                {(!initialData || initialData?.status === "Pending") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        productId: "",
                        colorId: "",
                        imei: "",
                        importPrice: 0,
                      })
                    }
                    disabled={isLoading}
                  >
                    Thêm sản phẩm
                  </Button>
                )}
                {form.formState.errors.details && (
                  <p className="text-red-500 text-xs sm:text-sm">
                    {form.formState.errors.details.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    setDetailsToDelete([]);
                  }}
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
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

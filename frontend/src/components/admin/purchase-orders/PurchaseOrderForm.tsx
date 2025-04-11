// frontend/components/admin/purchase-orders/PurchaseOrderForm.tsx
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
import { getSuppliers, Supplier } from "@/api/admin/suppliersApi";
import { getProducts, Product } from "@/api/admin/productsApi";
import { getColors, Color } from "@/api/admin/colorsApi";
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  PurchaseOrder,
  PurchaseOrderDetailInput,
} from "@/api/admin/purchaseOrdersApi";
import axiosInstance from "@/api/axiosConfig";

const purchaseOrderDetailSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  colorId: z.string().min(1, "Vui lòng chọn màu sắc"),
  imei: z.string().min(1, "IMEI không được để trống"),
  importPrice: z.number().min(0, "Giá nhập không được nhỏ hơn 0"),
});

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
  note: z.string().optional(),
  details: z.array(purchaseOrderDetailSchema).optional(),
});

interface PurchaseOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: PurchaseOrder;
}

export function PurchaseOrderForm({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: PurchaseOrderFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsToDelete, setDetailsToDelete] = useState<string[]>([]);

  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: initialData?.supplierId || "",
      note: initialData?.note || "",
      details:
        initialData?.purchaseOrderDetails?.map((detail) => ({
          id: detail.id,
          productId: detail.productId,
          colorId: detail.colorId,
          imei: detail.imei || "",
          importPrice: detail.importPrice,
        })) || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "details",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        supplierId: initialData.supplierId,
        note: initialData.note || "",
        details:
          initialData.purchaseOrderDetails?.map((detail) => ({
            id: detail.id,
            productId: detail.productId,
            colorId: detail.colorId,
            imei: detail.imei || "",
            importPrice: detail.importPrice,
          })) || [],
      });
      setDetailsToDelete([]);
    }
  }, [initialData, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, productsData, colorsData] = await Promise.all([
          getSuppliers(),
          getProducts(),
          getColors(),
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);
        setColors(colorsData);
      } catch (error: any) {
        toast.error("Lỗi khi lấy dữ liệu", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values: z.infer<typeof purchaseOrderSchema>) => {
    setLoading(true);
    try {
      if (initialData) {
        const newDetails = values.details?.filter((detail) => !detail.id) || [];
        const updatedDetails =
          values.details?.filter((detail) => detail.id) || [];

        await updatePurchaseOrder(initialData.id, {
          status: initialData.status,
          details: newDetails.map((detail) => ({
            productId: detail.productId,
            colorId: detail.colorId,
            imei: detail.imei,
            importPrice: detail.importPrice,
          })),
          detailsToDelete,
          detailsToUpdate: updatedDetails.map((detail) => ({
            id: detail.id!,
            productId: detail.productId,
            colorId: detail.colorId,
            imei: detail.imei,
            importPrice: detail.importPrice,
          })),
        });
        toast.success("Cập nhật đơn nhập hàng thành công");
      } else {
        const data = {
          supplierId: values.supplierId,
          note: values.note || undefined,
          details: (values.details || []).map((detail) => ({
            productId: detail.productId,
            colorId: detail.colorId,
            imei: detail.imei,
            importPrice: detail.importPrice,
          })) as PurchaseOrderDetailInput[],
        };
        await createPurchaseOrder(data);
        toast.success("Tạo đơn nhập hàng thành công");
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
      setDetailsToDelete([]);
    } catch (error: any) {
      if (error.code === "ECONNABORTED") {
        toast.warning("Yêu cầu mất quá nhiều thời gian", {
          description:
            "Dữ liệu có thể đã được lưu. Vui lòng kiểm tra lại danh sách đơn nhập hàng.",
          duration: 3000,
        });
        onSuccess();
        onOpenChange(false);
        form.reset();
        setDetailsToDelete([]);
      } else {
        toast.error(
          initialData
            ? "Cập nhật đơn nhập hàng thất bại"
            : "Tạo đơn nhập hàng thất bại",
          {
            description:
              error.response?.data?.message ||
              error.message ||
              "Vui lòng thử lại sau.",
            duration: 2000,
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDetail = async (index: number, detailId?: string) => {
    if (detailId) {
      try {
        const response = await axiosInstance.get(
          `/purchase-orders/details/${detailId}`
        );
        if (response.status === 200) {
          setDetailsToDelete([...detailsToDelete, detailId]);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast.error("Chi tiết đơn nhập hàng không tồn tại", {
            description: "Sản phẩm này có thể đã bị xóa trước đó.",
            duration: 2000,
          });
        } else {
          toast.error("Lỗi khi kiểm tra chi tiết đơn nhập hàng", {
            description: error.message || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
        return;
      }
    }
    remove(index);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Cập nhật đơn nhập hàng" : "Thêm đơn nhập hàng"}
          </DialogTitle>
        </DialogHeader>
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
                      disabled={!!initialData}
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
                    Ghi chú (không bắt buộc)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập ghi chú"
                      {...field}
                      className="text-sm sm:text-base"
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
                              disabled={!!field.id}
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
                                    {product.name} ({product.model.name} -{" "}
                                    {product.model.brand.name})
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
                              disabled={!!field.id}
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
                      onClick={() => handleDeleteDetail(index, field.id)}
                    >
                      Xóa sản phẩm
                    </Button>
                  </div>
                ))
              )}
              {/* Sửa điều kiện hiển thị nút "Thêm sản phẩm" */}
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
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

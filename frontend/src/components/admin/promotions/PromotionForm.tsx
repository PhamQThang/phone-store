"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Promotion, Product } from "@/lib/types";
import { Loader2, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const promotionSchema = z.object({
  code: z.string().min(2, "Mã khuyến mãi phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  discount: z.number().positive("Số tiền giảm giá phải là số dương"),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  isActive: z.boolean(),
});

interface PromotionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    code?: string;
    description?: string;
    discount?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    productIds?: string[];
  }) => Promise<void>;
  initialData?: Promotion;
  products: Product[];
  isLoading: boolean;
  checkPromotionStatusAction?: (id: string) => Promise<any>;
  addProductToPromotionAction: (
    promotionId: string,
    productId: string
  ) => Promise<any>;
  removeProductFromPromotionAction: (
    promotionId: string,
    productId: string
  ) => Promise<any>;
  getPromotionDetailAction: (id: string) => Promise<any>;
}

export function PromotionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  products,
  isLoading,
  checkPromotionStatusAction,
  addProductToPromotionAction,
  removeProductFromPromotionAction,
  getPromotionDetailAction,
}: PromotionFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isPromotionActive, setIsPromotionActive] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);

  const form = useForm<z.infer<typeof promotionSchema>>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: initialData?.code || "",
      description: initialData?.description || "",
      discount: initialData?.discount || 0,
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().slice(0, 16)
        : "",
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().slice(0, 16)
        : "",
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (initialData && checkPromotionStatusAction) {
        const result = await checkPromotionStatusAction(initialData.id);
        if (result.success) {
          setIsPromotionActive(result.isActive);
        }
      }
    };
    checkStatus();
  }, [initialData, checkPromotionStatusAction]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code || "",
        description: initialData.description || "",
        discount: initialData.discount || 0,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().slice(0, 16)
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().slice(0, 16)
          : "",
        isActive: initialData.isActive ?? true,
      });
      const initialProducts = initialData.products
        .map((p) => products.find((prod) => prod.id === p.productId))
        .filter((p): p is Product => p !== undefined);
      setSelectedProducts(initialProducts);
    } else {
      form.reset({
        code: "",
        description: "",
        discount: 0,
        startDate: "",
        endDate: "",
        isActive: true,
      });
      setSelectedProducts([]);
    }
  }, [initialData, form, products]);

  const availableProducts = products.filter(
    (product) => !selectedProducts.some((p) => p.id === product.id)
  );

  const handleAddProduct = async () => {
    if (!selectedProductId) {
      toast.error("Vui lòng chọn một sản phẩm");
      return;
    }
    // Bỏ kiểm tra isPromotionActive để cho phép thêm sản phẩm ngay cả khi khuyến mãi đang hoạt động
    if (!initialData) {
      const product = products.find((p) => p.id === selectedProductId);
      if (product) {
        setSelectedProducts((prev) => [...prev, product]);
        setSelectedProductId("");
      }
      return;
    }

    setIsProductLoading(true);
    try {
      const result = await addProductToPromotionAction(
        initialData.id,
        selectedProductId
      );
      if (result.success) {
        toast.success(result.message);
        const updatedPromotion = await getPromotionDetailAction(initialData.id);
        if (updatedPromotion.success) {
          const updatedData = updatedPromotion.promotion;
          form.reset({
            code: updatedData.code || "",
            description: updatedData.description || "",
            discount: updatedData.discount || 0,
            startDate: updatedData.startDate
              ? new Date(updatedData.startDate).toISOString().slice(0, 16)
              : "",
            endDate: updatedData.endDate
              ? new Date(updatedData.endDate).toISOString().slice(0, 16)
              : "",
            isActive: updatedData.isActive ?? true,
          });
          const updatedProducts = updatedData.products
            .map((p) => products.find((prod) => prod.id === p.productId))
            .filter((p): p is Product => p !== undefined);
          setSelectedProducts(updatedProducts);
          setSelectedProductId("");
        }
      } else {
        toast.error("Thêm sản phẩm thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm sản phẩm thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    // Bỏ kiểm tra isPromotionActive để cho phép xóa sản phẩm ngay cả khi khuyến mãi đang hoạt động
    if (!initialData) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
      return;
    }

    setIsProductLoading(true);
    try {
      const result = await removeProductFromPromotionAction(
        initialData.id,
        productId
      );
      if (result.success) {
        toast.success(result.message);
        const updatedPromotion = await getPromotionDetailAction(initialData.id);
        if (updatedPromotion.success) {
          const updatedData = updatedPromotion.promotion;
          form.reset({
            code: updatedData.code || "",
            description: updatedData.description || "",
            discount: updatedData.discount || 0,
            startDate: updatedData.startDate
              ? new Date(updatedData.startDate).toISOString().slice(0, 16)
              : "",
            endDate: updatedData.endDate
              ? new Date(updatedData.endDate).toISOString().slice(0, 16)
              : "",
            isActive: updatedData.isActive ?? true,
          });
          const updatedProducts = updatedData.products
            .map((p) => products.find((prod) => prod.id === p.productId))
            .filter((p): p is Product => p !== undefined);
          setSelectedProducts(updatedProducts);
        }
      } else {
        toast.error("Xóa sản phẩm thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Xóa sản phẩm thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof promotionSchema>) => {
    try {
      await onSubmit({
        ...values,
        productIds: selectedProducts.map((p) => p.id),
      });
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
            {initialData ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Mã khuyến mãi
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập mã khuyến mãi"
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
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Số tiền giảm giá (VNĐ)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập số tiền giảm giá"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Ngày bắt đầu
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
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
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Ngày kết thúc
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
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
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm sm:text-base">
                      Mô tả
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập mô tả khuyến mãi"
                        {...field}
                        value={field.value || ""}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 sm:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm sm:text-base">
                      Hoạt động
                    </FormLabel>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-sm sm:text-base">
                Sản phẩm áp dụng
              </FormLabel>
              {selectedProducts.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {selectedProducts.map((product) => (
                    <li
                      key={product.id}
                      className="flex justify-between items-center bg-gray-100 p-2 rounded"
                    >
                      <span className="text-sm">
                        {product.name} - {product.price.toLocaleString()} VNĐ
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.id)}
                        disabled={isLoading || isProductLoading} // Bỏ isPromotionActive
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Chưa có sản phẩm nào được chọn.
                </p>
              )}
            </div>

            {availableProducts.length > 0 && (
              <div>
                <FormLabel className="text-sm sm:text-base">
                  Thêm sản phẩm
                </FormLabel>
                <div className="flex items-center space-x-2 mt-2">
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                    disabled={isProductLoading} // Bỏ isPromotionActive
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.price.toLocaleString()} VNĐ
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddProduct}
                    disabled={isLoading || isProductLoading} // Bỏ isPromotionActive
                  >
                    {isProductLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Thêm"
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
                disabled={isLoading || isProductLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isLoading || isProductLoading}
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
      </DialogContent>
    </Dialog>
  );
}

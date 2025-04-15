"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Promotion, Product } from "@/lib/types";

interface PromotionDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: Promotion | null;
  products: Product[];
  role: string;
  checkPromotionStatusAction: (id: string) => Promise<any>;
}

export function PromotionDetail({
  open,
  onOpenChange,
  promotion,
  products,
}: PromotionDetailProps) {
  if (!promotion) return null;

  const associatedProducts = promotion.products
    .map((p) => products.find((prod) => prod.id === p.productId))
    .filter((p): p is Product => p !== undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết khuyến mãi
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm sm:text-base">
              <strong>ID:</strong> {promotion.id}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Mã khuyến mãi:</strong> {promotion.code}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Mô tả:</strong> {promotion.description || "-"}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Giảm giá:</strong> {promotion.discount}%
            </p>
            <p className="text-sm sm:text-base">
              <strong>Ngày bắt đầu:</strong>{" "}
              {new Date(promotion.startDate).toLocaleString()}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Ngày kết thúc:</strong>{" "}
              {new Date(promotion.endDate).toLocaleString()}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Trạng thái:</strong>{" "}
              {promotion.isActive ? "Hoạt động" : "Không hoạt động"}
            </p>
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-medium">
              Sản phẩm áp dụng
            </h3>
            {associatedProducts.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {associatedProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded"
                  >
                    <span className="text-sm">
                      {product.name} - {product.price.toLocaleString()} VNĐ
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Chưa có sản phẩm nào được liên kết.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

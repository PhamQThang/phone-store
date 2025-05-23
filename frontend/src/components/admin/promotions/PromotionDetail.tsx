"use client";

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
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết khuyến mãi
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>ID:</strong> {promotion.id}
          </div>
          <div>
            <strong>Mã khuyến mãi:</strong> {promotion.code}
          </div>
          <div>
            <strong>Mô tả:</strong> {promotion.description || "-"}
          </div>
          <div>
            <strong>Giảm giá:</strong> {promotion.discount} VNĐ
          </div>
          <div>
            <strong>Ngày bắt đầu:</strong>{" "}
            {new Date(promotion.startDate).toLocaleString()}
          </div>
          <div>
            <strong>Ngày kết thúc:</strong>{" "}
            {new Date(promotion.endDate).toLocaleString()}
          </div>
          <div>
            <strong>Trạng thái:</strong>{" "}
            {promotion.isActive ? "Hoạt động" : "Không hoạt động"}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(promotion.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong>{" "}
            {new Date(promotion.updatedAt).toLocaleString()}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

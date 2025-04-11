// components/admin/products/ProductDetail.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/api/admin/productsApi";
import Image from "next/image";

interface ProductDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetail({
  open,
  onOpenChange,
  product,
}: ProductDetailProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>ID:</strong> {product.id}
          </div>
          <div>
            <strong>Tên sản phẩm:</strong> {product.name}
          </div>
          <div>
            <strong>Slug:</strong> {product.slug}
          </div>
          <div>
            <strong>Giá:</strong> {product.price.toLocaleString()} VNĐ
          </div>
          <div>
            <strong>Dung lượng lưu trữ:</strong> {product.storage} GB
          </div>
          <div>
            <strong>RAM:</strong> {product.ram} GB
          </div>
          <div>
            <strong>Model:</strong> {product.model.name} (
            {product.model.brand.name})
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(product.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Ảnh sản phẩm:</strong>
            {product.productFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {product.productFiles.map((pf) => (
                  <div key={pf.file.url} className="relative">
                    <Image
                      src={pf.file.url}
                      alt={product.name}
                      width={128}
                      height={128}
                      className="w-full h-32 object-cover rounded"
                    />
                    {pf.isMain && (
                      <p className="text-sm text-green-600 absolute top-0 left-0">
                        Ảnh chính
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Không có ảnh</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product, ProductFiles } from "@/lib/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="w-full max-w-3xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết sản phẩm
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Tên sản phẩm</h3>
            <p className="text-sm sm:text-base">{product.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Giá</h3>
            <p className="text-sm sm:text-base">
              {product.price.toLocaleString()} VNĐ
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Dung lượng lưu trữ</h3>
            <p className="text-sm sm:text-base">{product.storage} GB</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">RAM</h3>
            <p className="text-sm sm:text-base">{product.ram} GB</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Kích thước màn hình</h3>
            <p className="text-sm sm:text-base">{product.screenSize} inch</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Dung lượng pin</h3>
            <p className="text-sm sm:text-base">{product.battery} mAh</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Chip</h3>
            <p className="text-sm sm:text-base">{product.chip}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Hệ điều hành</h3>
            <p className="text-sm sm:text-base">{product.operatingSystem}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Model</h3>
            <p className="text-sm sm:text-base">
              {product.model.name} ({product.model.brand.name})
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Ngày tạo</h3>
            <p className="text-sm sm:text-base">
              {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>
          {product.productFiles && product.productFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">Ảnh sản phẩm</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {product.productFiles.map((productFile: ProductFiles) => (
                  <div key={productFile.fileId} className="relative">
                    <div className="relative w-full h-24">
                      <Image
                        src={productFile.file.url}
                        alt="Product image"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    {productFile.isMain && (
                      <p className="text-xs text-green-600 mt-1">Ảnh chính</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

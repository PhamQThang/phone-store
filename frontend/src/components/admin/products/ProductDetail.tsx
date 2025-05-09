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
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Chi tiết sản phẩm
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Tên sản phẩm
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.name}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Giá
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.price.toLocaleString()} VNĐ
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Dung lượng lưu trữ
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.storage} GB
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                RAM
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.ram} GB
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Kích thước màn hình
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.screenSize} inch
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Dung lượng pin
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.battery} mAh
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Chip
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.chip}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Hệ điều hành
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.operatingSystem}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Model
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {product.model.name} ({product.model.brand.name})
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Ngày tạo
              </h3>
              <p className="text-sm sm:text-base text-gray-900">
                {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {product.productFiles && product.productFiles.length > 0 && (
            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Ảnh sản phẩm
              </h3>
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
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-sm sm:text-base border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

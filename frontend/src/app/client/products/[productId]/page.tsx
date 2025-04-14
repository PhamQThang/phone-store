// app/client/products/[productId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { addToCart } from "@/api/cart/cartApi";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Thêm Select để chọn màu
import { getProductById } from "@/api/admin/productsApi";
import { getColors } from "@/api/admin/colorsApi";
import { Color, Product, ProductIdentity } from "@/lib/types";

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { productId } = useParams();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchProduct = async () => {
    try {
      const productData = await getProductById(productId as string);
      setProduct(productData);
      // Chọn màu mặc định (màu đầu tiên chưa được bán)
      const firstAvailableColor = productData.productIdentities.find(
        (pi: ProductIdentity) => !pi.isSold
      )?.colorId;
      setSelectedColorId(firstAvailableColor || null);
    } catch (error: any) {
      setError(error.message || "Không thể lấy thông tin sản phẩm");
      toast.error("Lỗi", {
        description: error.message || "Không thể lấy thông tin sản phẩm",
        duration: 2000,
      });
    }
  };

  // Lấy danh sách màu sắc
  const fetchColors = async () => {
    try {
      const colorsData = await getColors();
      setColors(colorsData);
    } catch (error) {
      console.error("Không thể lấy danh sách màu sắc:", error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      router.push("/auth/login");
      return;
    }

    if (!selectedColorId) {
      toast.error("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng");
      return;
    }

    try {
      await addToCart(cartId, {
        productId: product!.id,
        colorId: selectedColorId,
        quantity: 1,
      });
      toast.success("Đã thêm vào giỏ hàng", {
        duration: 2000,
      });
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể thêm vào giỏ hàng",
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchColors();
    }
  }, [fetchProduct, productId]);

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-10">Sản phẩm không tồn tại</div>;
  }

  // Lấy danh sách màu sắc có sẵn (chưa được bán)
  const availableColors = product.productIdentities
    .filter((pi) => !pi.isSold) // Chỉ lấy các màu chưa được bán
    .map((pi) => {
      const color = colors.find((c) => c.id === pi.colorId);
      return color || null;
    })
    .filter((color) => color !== null) as Color[];

  const mainImage =
    product.productFiles.find((pf) => pf.isMain)?.file.url ||
    "/placeholder.png";
  const otherImages = product.productFiles
    .filter((pf) => !pf.isMain)
    .map((pf) => pf.file.url);

  return (
    <div className="container mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hình ảnh sản phẩm */}
            <div>
              <div className="relative w-full h-96">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex space-x-4 mt-4">
                {otherImages.map((url, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <Image
                      src={url}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div>
              <p className="text-2xl font-semibold text-primary mb-4">
                {product.price.toLocaleString("vi-VN")} VNĐ
              </p>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Dung lượng:</span>{" "}
                  {product.storage} GB
                </p>
                <p>
                  <span className="font-semibold">RAM:</span> {product.ram} GB
                </p>
                <p>
                  <span className="font-semibold">Kích thước màn hình:</span>{" "}
                  {product.screenSize} inch
                </p>
                <p>
                  <span className="font-semibold">Pin:</span> {product.battery}{" "}
                  mAh
                </p>
                <p>
                  <span className="font-semibold">Chip:</span> {product.chip}
                </p>
                <p>
                  <span className="font-semibold">Hệ điều hành:</span>{" "}
                  {product.operatingSystem}
                </p>
                {/* Hiển thị danh sách màu sắc */}
                {availableColors.length > 0 ? (
                  <div>
                    <span className="font-semibold">Màu sắc:</span>
                    <Select
                      onValueChange={(value) => setSelectedColorId(value)}
                      value={selectedColorId || ""}
                    >
                      <SelectTrigger className="w-[200px] mt-2">
                        <SelectValue placeholder="Chọn màu sắc" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="text-red-600">Sản phẩm đã hết hàng</p>
                )}
              </div>
              {availableColors.length > 0 && (
                <Button onClick={handleAddToCart} className="mt-6 w-full">
                  Thêm vào giỏ hàng
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

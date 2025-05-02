"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { addToCart } from "@/api/cart/cartApi";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, ChevronRight, Check } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { getProductById, getSimilarProducts } from "@/api/admin/productsApi";
import { getColors } from "@/api/admin/colorsApi";
import { Color, Product, ProductIdentity } from "@/lib/types";
import ProductCard from "@/components/client/ProductCard";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const { productId } = useParams();

  const fetchData = useCallback(async () => {
    try {
      const [productData, colorsData, similarProductsData] = await Promise.all([
        getProductById(productId as string),
        getColors(),
        getSimilarProducts(productId as string),
      ]);

      setProduct(productData);
      setColors(colorsData);
      setSimilarProducts(similarProductsData);

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
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [fetchData, productId]);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

    setIsAddingToCart(true);

    // Hiển thị toast ngay lập tức
    const toastId = toast.loading("Đang thêm vào giỏ hàng...");

    try {
      // Optimistic update - giả định thành công
      toast.success("Đã thêm vào giỏ hàng", {
        id: toastId,
        duration: 2000,
      });

      // Gọi API trong background
      await addToCart(cartId, {
        productId: product!.id,
        colorId: selectedColorId,
        quantity: 1,
      });

      // Nếu API thành công, không cần làm gì thêm vì đã hiển thị thành công trước
    } catch (error: any) {
      // Nếu thất bại, hiển thị thông báo lỗi và rollback UI
      toast.error("Lỗi", {
        id: toastId,
        description: error.message || "Không thể thêm vào giỏ hàng",
        duration: 2000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 w-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-10">Sản phẩm không tồn tại</div>;
  }

  // Lọc màu sắc không trùng lặp
  const uniqueColorIds = new Set<string>();
  const availableColors = product.productIdentities
    .filter((pi) => {
      if (!pi.isSold && !uniqueColorIds.has(pi.colorId)) {
        uniqueColorIds.add(pi.colorId);
        return true;
      }
      return false;
    })
    .map((pi) => colors.find((c) => c.id === pi.colorId))
    .filter(Boolean) as Color[];

  const productImages = product.productFiles.map((pf) => ({
    url: pf.file.url,
    isMain: pf.isMain,
  }));

  // Khuyến mãi
  const activePromotion = product.promotions?.find(({ promotion }) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return promotion.isActive && startDate <= now && now <= endDate;
  });

  const originalPrice = product.price;
  const discountedPrice = product.discountedPrice ?? originalPrice;
  const rating =
    product.rating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span className="hover:text-red-500 cursor-pointer">Trang chủ</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="hover:text-red-500 cursor-pointer">Điện thoại</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-red-500">{product.name}</span>
      </div>

      {/* Product Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {product.name}
        </h1>
        <div className="flex items-center mt-2 md:mt-0">
          <div className="flex items-center mr-4">
            {Array(fullStars)
              .fill(0)
              .map((_, index) => (
                <Star
                  key={index}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ))}
            {hasHalfStar && (
              <Star
                key="half"
                className="w-5 h-5 text-yellow-400 fill-yellow-400"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
            {Array(emptyStars)
              .fill(0)
              .map((_, index) => (
                <Star
                  key={index + fullStars + (hasHalfStar ? 1 : 0)}
                  className="w-5 h-5 text-gray-300"
                />
              ))}
            <span className="ml-2 text-gray-600">
              ({Math.floor(rating * 10)} đánh giá)
            </span>
          </div>
          <span className="text-green-600 font-medium">Còn hàng</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-sm">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {productImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-96 md:h-[500px] flex items-center justify-center bg-gray-50">
                    <Image
                      src={image.url}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-contain"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Thumbnails */}
          <div className="flex space-x-3 mt-4 px-4 pb-4 overflow-x-auto">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  current === index + 1
                    ? "border-red-500"
                    : "border-transparent"
                }`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Price Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            {activePromotion ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-red-600">
                    {discountedPrice.toLocaleString("vi-VN")}₫
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {originalPrice.toLocaleString("vi-VN")}₫
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                    -{Math.round(100 - (discountedPrice / originalPrice) * 100)}
                    %
                  </span>
                </div>
                <div className="text-green-600 font-medium">
                  Tiết kiệm:{" "}
                  {(originalPrice - discountedPrice).toLocaleString("vi-VN")}₫
                </div>
              </div>
            ) : (
              <span className="text-3xl font-bold text-red-600">
                {originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Màu sắc:</h3>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColorId(color.id)}
                  className={`relative flex items-center justify-center px-4 py-2 rounded-full border transition-all ${
                    selectedColorId === color.id
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-300 hover:border-red-300"
                  }`}
                >
                  {selectedColorId === color.id && (
                    <Check className="w-4 h-4 absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5" />
                  )}
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Promotion */}
          <div className="border border-red-200 rounded-lg overflow-hidden">
            <div className="bg-red-50 px-4 py-3 flex items-center">
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">!</span>
              </div>
              <h3 className="font-semibold text-red-600">
                Khuyến mãi đặc biệt
              </h3>
            </div>
            <ul className="px-4 py-3 space-y-2 text-gray-700">
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                <span>Giảm thêm tới 500.000đ khi thanh toán qua VNPAY-QR</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                <span>Trả góp 0% lãi suất qua thẻ tín dụng</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                <span>Tặng ốp lưng chính hãng trị giá 350.000đ</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                <span>Bảo hành 2 năm chính hãng</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 bg-red-600 hover:bg-red-700 h-14 text-lg font-medium"
            >
              {isAddingToCart ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang thêm...
                </div>
              ) : (
                <>
                  <ShoppingCart className="mr-2" />
                  Thêm vào giỏ hàng
                </>
              )}
            </Button>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">✓</div>
              <span className="font-medium">Giao hàng nhanh trong 2 giờ</span>
            </div>
            <div className="flex items-center">
              <div className="text-green-600 mr-3">✓</div>
              <span className="font-medium">
                Miễn phí vận chuyển cho đơn từ 500.000đ
              </span>
            </div>
            <div className="flex items-center">
              <div className="text-green-600 mr-3">✓</div>
              <span className="font-medium">Đổi trả trong 7 ngày nếu lỗi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Specifications */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">
            Thông số kỹ thuật
          </h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold bg-gray-50">
                    Hệ điều hành
                  </TableCell>
                  <TableCell>{product.operatingSystem}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold bg-gray-50">
                    Chip
                  </TableCell>
                  <TableCell>{product.chip}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold bg-gray-50">
                    RAM
                  </TableCell>
                  <TableCell>{product.ram}GB</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold bg-gray-50">
                    Bộ nhớ trong
                  </TableCell>
                  <TableCell>{product.storage}GB</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold bg-gray-50">
                    Pin
                  </TableCell>
                  <TableCell>{product.battery}mAh</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Warranty Info */}
        <div>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">
            Chính sách bảo hành
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-lg">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Bảo hành chính hãng</h3>
                <p className="text-gray-600 text-sm">
                  12 tháng tại các trung tâm bảo hành của hãng
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-lg">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Đổi mới 30 ngày</h3>
                <p className="text-gray-600 text-sm">
                  Đổi trả miễn phí nếu có lỗi từ nhà sản xuất
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-lg">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Hỗ trợ phần mềm trọn đời</h3>
                <p className="text-gray-600 text-sm">
                  Cập nhật phần mềm miễn phí tại cửa hàng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Không có sản phẩm tương tự
          </div>
        )}
      </div>
    </div>
  );
}

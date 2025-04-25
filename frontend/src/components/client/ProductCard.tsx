import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { Star, CreditCard } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Kiểm tra xem có khuyến mãi đang áp dụng không
  const activePromotion = product.promotions?.find(({ promotion }) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return promotion.isActive && startDate <= now && now <= endDate;
  });

  const originalPrice = product.price;
  const discountedPrice = product.discountedPrice ?? originalPrice;
  const discount = activePromotion ? originalPrice - discountedPrice : 0;

  const generateRandomRating = () => {
    return (Math.random() * 1.5 + 3.5).toFixed(1); // Phạm vi 3.5 - 5.0
  };
  const rating = product.rating || parseFloat(generateRandomRating());

  // Tính số sao đầy, nửa sao và sao rỗng
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);

  // Thông số sản phẩm
  const screenSize = product.screenSize || 6.2; // inches
  const ram = product.ram || 12; // GB
  const storage = product.storage || 256; // GB

  return (
    <Card className="w-full bg-white border-none rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col min-h-[400px]">
      {/* Hình ảnh sản phẩm */}
      <Link href={`/client/products/${product.id}`}>
        <div className="relative p-4">
          {activePromotion && (
            <div className="absolute z-10 top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center">
              Giảm {discount.toLocaleString("vi-VN")} VNĐ
              <span className="ml-1 text-yellow-300">✨</span>
            </div>
          )}
          <Image
            src={product.productFiles[0]?.file.url || "/placeholder.png"}
            alt={product.name}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-40 object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            priority
          />
        </div>
      </Link>

      {/* Nội dung */}
      <CardContent className="px-4 py-2 flex-1 flex flex-col">
        {/* Thông số */}
        <p className="text-xs text-gray-500 text-center mb-2">
          {screenSize}″ | {ram}GB RAM | {storage}GB
        </p>

        {/* Tên sản phẩm - Giới hạn chiều cao */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 text-center mb-2 h-14">
          {product.name}
        </h3>

        {/* Giá */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <p className="text-xl font-bold text-red-600">
            {discountedPrice.toLocaleString("vi-VN")}đ
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1 mb-3">
          {Array(fullStars)
            .fill(0)
            .map((_, index) => (
              <Star
                key={index}
                className="w-4 h-4 text-yellow-400 fill-yellow-400"
              />
            ))}
          {hasHalfStar && (
            <Star
              key="half"
              className="w-4 h-4 text-yellow-400 fill-yellow-400"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          )}
          {Array(emptyStars)
            .fill(0)
            .map((_, index) => (
              <Star
                key={index + fullStars + (hasHalfStar ? 1 : 0)}
                className="w-4 h-4 text-gray-300"
              />
            ))}
          <span className="text-xs text-gray-600 ml-1">({rating}/5)</span>
        </div>

        {/* Thông tin trả góp */}
        <div className="flex items-center justify-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-md mt-auto">
          <CreditCard className="w-4 h-4" />
          <span>Trả góp 0% qua thẻ, 3-6 tháng</span>
        </div>
      </CardContent>

      {/* Footer: Button */}
      <CardFooter className="px-4 pb-4">
        <Button
          asChild
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Link href={`/client/products/${product.id}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

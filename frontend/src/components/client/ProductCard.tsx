import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  console.log("ProductCard render", product);

  // Kiểm tra khuyến mãi áp dụng
  const activePromotion = product.promotions?.find(({ promotion }) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return promotion.isActive && startDate <= now && now <= endDate;
  });

  // Tính giá sau giảm (giảm tiền cố định)
  const originalPrice = product.price;
  const discount = activePromotion?.promotion.discount || 0;
  const discountedPrice = Math.max(0, originalPrice - discount);

  const generateRandomRating = () => {
    return (Math.random() * 1.5 + 3.5).toFixed(1); // Phạm vi 3.5 - 5.0
  };
  const rating = product.rating || parseFloat(generateRandomRating());

  // Tính số sao đầy và nửa sao
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);

  // Giả định thông tin sản phẩm
  const screenSize = product.screenSize || 6.2; // inches
  const ram = product.ram || 12; // GB
  const storage = product.storage || 256; // GB

  return (
    <Card className="w-full h-auto bg-white shadow-lg rounded-lg overflow-hidden border-none">
      <Link href={`/client/products/${product.id}`}>
        <div className="relative p-2">
          {activePromotion && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-tl-lg rounded-br-lg flex items-center">
              Giảm {discount.toLocaleString("vi-VN")}VNĐ
              <span className="ml-1 text-yellow-300">✨</span>
            </div>
          )}
          <Image
            src={product.productFiles[0]?.file.url || "/placeholder.png"}
            alt={product.name}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto object-contain max-h-60"
            priority
          />
        </div>
      </Link>
      <CardContent className="p-2 text-center">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {screenSize} inches | {ram} GB | {storage} GB
        </p>
        <div className="mt-2">
          {activePromotion ? (
            <div className="flex items-center justify-center gap-2">
              <p className="text-xl font-bold text-red-600">
                {discountedPrice.toLocaleString("vi-VN")}đ
              </p>
              <p className="text-md text-gray-500 line-through">
                {originalPrice.toLocaleString("vi-VN")}đ
              </p>
            </div>
          ) : (
            <p className="text-xl font-bold text-gray-900">
              {originalPrice.toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>
        {activePromotion && (
          <p className="text-xs text-gray-500 mt-1">
            Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6
            tháng
          </p>
        )}
        <div className="flex items-center justify-center mt-2">
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
        </div>
      </CardContent>
      <CardFooter className="p-2">
        <Button
          asChild
          className="w-full bg-black text-white hover:bg-gray-800 text-sm py-1"
        >
          <Link href={`/client/products/${product.id}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

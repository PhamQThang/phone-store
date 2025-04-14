// components/client/ProductCard.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { addToCart } from "@/api/cart/cartApi";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  productFiles: { file: { url: string } }[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = async () => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }

    try {
      await addToCart(cartId, {
        productId: product.id,
        colorId: "color-1",
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <Link href={`/client/products/${product.id}`}>
          <Image
            src={product.productFiles[0]?.file.url || "/placeholder.png"}
            alt={product.name}
            width={200}
            height={200}
            className="mx-auto object-contain"
            priority
          />
        </Link>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <p className="text-primary font-semibold mt-2">
          {product.price.toLocaleString("vi-VN")} VNĐ
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAddToCart} className="w-full">
          Thêm vào giỏ hàng
        </Button>
      </CardFooter>
    </Card>
  );
}

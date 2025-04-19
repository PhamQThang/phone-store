"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { addToCart } from "@/api/cart/cartApi";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react"; // Import ShoppingCart and Star icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

      console.log("similarProductsData", similarProductsData);

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

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-10">Sản phẩm không tồn tại</div>;
  }

  const availableColors = product.productIdentities
    .filter((pi) => !pi.isSold)
    .map((pi) => {
      const color = colors.find((c) => c.id === pi.colorId);
      return color || null;
    })
    .filter((color) => color !== null) as Color[];

  const productImages = product.productFiles.map((pf) => ({
    url: pf.file.url,
    isMain: pf.isMain,
  }));

  // Kiểm tra xem có khuyến mãi áp dụng không
  const activePromotion = product.promotions?.find(({ promotion }) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return promotion.isActive && startDate <= now && now <= endDate;
  });

  const originalPrice = product.price;
  const discountedPrice = product.discountedPrice ?? originalPrice;
  const generateRandomRating = () => {
    return (Math.random() * 1.5 + 3.5).toFixed(1); // Phạm vi 3.5 - 5.0
  };
  const rating = product.rating || parseFloat(generateRandomRating());

  // Tính số sao đầy và nửa sao
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);
  //const description = product.description || "Không có mô tả cho sản phẩm này.";

  return (
    <div className="container mx-auto px-4 py-10">
      <CardHeader className="flex flex-row gap-5 items-center">
        <CardTitle className="text-3xl">{product.name}</CardTitle>
        <div className="flex items-center mt-2">
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
        </div>
      </CardHeader>
      <Card className="border-none shadow-none">
        <CardContent className="border-none shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-[7fr_5fr] gap-8 ">
            {/* Phần hình ảnh sản phẩm với Carousel */}
            <div className="border-2 rounded-md p-5">
              <div>
                {/* Carousel chính */}
                <Carousel setApi={setApi} className="w-full">
                  <CarouselContent>
                    {productImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="relative w-full h-96">
                          <Image
                            src={image.url}
                            alt={`${product.name} - Image ${index + 1}`}
                            fill
                            className="object-contain rounded-md"
                            priority={index === 0}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Danh sách ảnh nhỏ để chọn */}
                <div className="flex space-x-4 mt-4 overflow-x-auto py-2">
                  {productImages.map((image, index) => (
                    <Button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 border-gray-200 ${current === index + 1
                        ? "border-red-500"
                        : ""
                        }`}
                    >
                      <Image
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </Button>
                  ))}

                </div>
              </div>

            </div>

            {/* Thông tin sản phẩm */}
            <div>
              {activePromotion ? (
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-2xl font-semibold text-red-600">
                    {discountedPrice.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <p className="text-xl text-gray-500 line-through">
                    {originalPrice.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-semibold mb-4 text-red-600">
                  {originalPrice.toLocaleString("vi-VN")} VNĐ
                </p>
              )}
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

              <div className="mt-4 rounded-md border-1 border-red-300">
                <div className="px-3 py-1 bg-red-100 rounded-t-md">
                  <h3 className="text-lg font-semibold mb-2 text-red-600">Khuyến mãi</h3>
                </div>
                <ul className=" pl-8 py-2 list-disc text-gray-700">
                  <li>Đặc quyền trợ giá lên đến 4 triệu khi thu cũ đổi iPhone</li>
                  <li>Trả góp 0% lãi suất, tối đa 12 tháng, trả trước từ 10% qua CTTC hoặc 0đ qua thẻ tín dụng</li>
                  <li>Tặng voucher 500.000đ mua Gia dụng (áp dụng 1 số sản phẩm nhất định)</li>
                  <li>
                    Tặng Sim / Esim Viettel 5G có 8GB data/ngày kèm TV360 4K & 30GB Mybox - miễn phí 1 tháng sử dụng
                    (Chỉ áp dụng tại cửa hàng)
                  </li>
                </ul>

              </div>

              {availableColors.length > 0 && (
                <Button onClick={handleAddToCart} className="mt-6 w-full flex items-center justify-center gap-2 bg-white border-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition duration-300">
                  <ShoppingCart className="w-5 h-5" /> {/* Icon giỏ hàng */}
                  Thêm vào giỏ hàng
                </Button>
              )}


            </div>
            <div>
              {/* <p className="text-gray-700">{product.description}</p> */}
              <p>Mô tả sản phẩm</p>
            </div>
            <div className="my-5">
              <h3 className="text-lg font-semibold mb-3 text-center">THÔNG SỐ KỸ THUẬT</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Dung lượng</TableCell>
                    <TableCell>{product.storage} GB</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">RAM</TableCell>
                    <TableCell>{product.ram} GB</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Kích thước màn hình</TableCell>
                    <TableCell>{product.screenSize} inch</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Pin</TableCell>
                    <TableCell>{product.battery} mAh</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Chip</TableCell>
                    <TableCell>{product.chip}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Hệ điều hành</TableCell>
                    <TableCell>{product.operatingSystem}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Section sản phẩm tương tự */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Sản phẩm tương tự</h2>
        {similarProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có sản phẩm tương tự.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

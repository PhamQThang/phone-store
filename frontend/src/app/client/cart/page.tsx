"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "@/api/cart/cartApi";
import { CartItem } from "@/lib/types";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const cartId = localStorage.getItem("cartId");
  const user = localStorage.getItem("fullName");

  useEffect(() => {
    if (!cartId || !user) {
      router.push("/auth/login");
      return;
    }

    fetchCartItems();
  }, [cartId, user, router]);

  const fetchCartItems = async () => {
    try {
      const response = await getCartItems(cartId!);
      console.log("Cart Items Response:", response); // Log dữ liệu để kiểm tra
      setCartItems(response); // Lấy mảng từ response.data
    } catch (error: any) {
      setError(error.message || "Không thể lấy giỏ hàng");
      toast.error("Lỗi", {
        description: error.message || "Không thể lấy giỏ hàng",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const cartData = {
        productId: "product-1",
        colorId: "color-1",
        quantity: 1,
      };
      const newItem = await addToCart(cartId!, cartData);
      setCartItems((prevItems) => [...prevItems, newItem]);
      toast.success("Thêm sản phẩm thành công", {
        duration: 2000,
      });
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể thêm sản phẩm vào giỏ hàng",
        duration: 2000,
      });
    }
  };

  const handleUpdateQuantity = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      toast.error("Số lượng phải lớn hơn hoặc bằng 1");
      return;
    }

    try {
      const updatedItem = await updateCartItem(cartId!, cartItemId, {
        quantity: newQuantity,
      });
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: updatedItem.quantity }
            : item
        )
      );
      toast.success("Cập nhật số lượng thành công", {
        duration: 2000,
      });
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể cập nhật số lượng",
        duration: 2000,
      });
    }
  };

  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      await removeFromCart(cartId!, cartItemId);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartItemId)
      );
      setSelectedItems((prevSelected) =>
        prevSelected.filter((id) => id !== cartItemId)
      );
      toast.success("Xóa sản phẩm thành công", {
        duration: 2000,
      });
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể xóa sản phẩm",
        duration: 2000,
      });
    }
  };

  const handleSelectItem = (cartItemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, cartItemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== cartItemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Tính tổng tiền của các sản phẩm được chọn (dùng discountedPrice, với fallback)
  const selectedTotalAmount = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce(
      (sum, item) =>
        sum +
        (item.product.discountedPrice ?? item.product.price) * item.quantity,
      0
    );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán", {
        duration: 2000,
      });
      return;
    }

    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    localStorage.setItem("cartIdForCheckout", cartId!);

    router.push("/client/checkout");
  };

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pt-10">
        <p className="text-2xl font-bold !px-0">Giỏ hàng của bạn</p>
      <div className="flex items-center gap-3 flex-row border-b py-3">
        <Checkbox
          checked={selectedItems.length === cartItems.length}
          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
        />
        <p className="font-medium">Chọn tất cả</p>
      </div>
      <Card>

        <CardContent>
          {cartItems.length === 0 ? (
            <p className="text-center">Giỏ hàng của bạn đang trống.</p>
          ) : (
            <>

              <div className="space-y-4">
                {cartItems.map((item) => {
                  // Fallback cho discountedPrice: nếu không có thì dùng price
                  const displayPrice =
                    item.product.discountedPrice ?? item.product.price;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b p-3 flex-wrap md:flex-nowrap"
                    >
                      <div className="flex items-center space-x-4 w-full md:w-auto">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(item.id, checked as boolean)
                          }
                        />
                        <img
                          src={
                            item.product.productFiles?.length > 0
                              ? item.product.productFiles[0].file.url
                              : "/placeholder.png"
                          }
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded md:w-20 md:h-20"
                        />
                        <div className="text-sm md:text-base">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-gray-500">{item.color.name}</p>
                          <span className="text-red-500">
                            {displayPrice.toLocaleString("vi-VN")} VNĐ
                          </span>
                          {item.product.discountedPrice != null &&
                            item.product.discountedPrice < item.product.price && (
                              <span className="text-gray-500 line-through ml-2">
                                {item.product.price.toLocaleString("vi-VN")} VNĐ
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end w-full md:w-auto mt-4 md:mt-0">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-16 md:w-20 mt-2"
                          min={1}
                        />
                        <p className="font-medium text-red-500 text-sm md:text-base">
                          {(displayPrice * item.quantity).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </p>

                      </div>
                    </div>
                  );
                })}
              </div>

            </>
          )}

        </CardContent>
      </Card>
      <div className="flex flex-col md:flex-row justify-between items-center border-2 rounded bg-white p-4 shadow-md mt-5">
        <p className="text-base md:text-lg font-semibold text-red-500 mb-4 md:mb-0">
          Tổng tiền (đã chọn):{" "}
          {selectedTotalAmount.toLocaleString("vi-VN")} VNĐ
        </p>
        <Button onClick={handleCheckout} className="bg-red-500 hover:bg-red-500 w-full md:w-auto">Thanh toán</Button>
      </div>
    </div>
  );
}

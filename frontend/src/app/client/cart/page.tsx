// app/client/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Thêm useRouter để điều hướng
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Thêm router để điều hướng

  const cartId = localStorage.getItem("cartId");
  const user = localStorage.getItem("fullName"); // Kiểm tra xem người dùng đã đăng nhập chưa

  // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
  useEffect(() => {
    if (!cartId || !user) {
      router.push("/auth/login");
      return;
    }

    fetchCartItems();
  }, [cartId, user, router]);

  // Lấy danh sách sản phẩm trong giỏ hàng
  const fetchCartItems = async () => {
    try {
      const items = await getCartItems(cartId!);
      setCartItems(items);
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

  // Thêm sản phẩm vào giỏ hàng (ví dụ)
  const handleAddToCart = async () => {
    try {
      const cartData = {
        productId: "product-1", // Thay bằng productId thực tế
        colorId: "color-1", // Thay bằng colorId thực tế
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

  // Cập nhật số lượng sản phẩm
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

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      await removeFromCart(cartId!, cartItemId);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartItemId)
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

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Giỏ hàng của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          {cartItems.length === 0 ? (
            <p className="text-center">Giỏ hàng của bạn đang trống.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Đơn giá</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Thành tiền</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <img
                            src={
                              item.product.productFiles[0]?.file.url ||
                              "/placeholder.png"
                            }
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <span>{item.product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.color.name}</TableCell>
                      <TableCell>
                        {item.product.price.toLocaleString("vi-VN")} VNĐ
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-20"
                          min={1}
                        />
                      </TableCell>
                      <TableCell>
                        {(item.product.price * item.quantity).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VNĐ
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    Tổng tiền: {totalAmount.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <Button
                  onClick={() => alert("Chức năng thanh toán chưa triển khai")}
                >
                  Thanh toán
                </Button>
              </div>
            </>
          )}
          <Button onClick={handleAddToCart} className="mt-4">
            Thêm sản phẩm (Ví dụ)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

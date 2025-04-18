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
import { Checkbox } from "@/components/ui/checkbox"; // Thêm Checkbox từ shadcn/ui
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Lưu trữ ID của các sản phẩm được chọn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const cartId = localStorage.getItem("cartId");
  const user = localStorage.getItem("fullName");

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
      setSelectedItems((prevSelected) =>
        prevSelected.filter((id) => id !== cartItemId)
      ); // Xóa sản phẩm khỏi danh sách được chọn
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

  // Xử lý chọn/bỏ chọn sản phẩm
  const handleSelectItem = (cartItemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, cartItemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== cartItemId));
    }
  };

  // Xử lý chọn/bỏ chọn tất cả sản phẩm
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Tính tổng tiền của các sản phẩm được chọn
  const selectedTotalAmount = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Chuyển hướng đến trang thanh toán
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán", {
        duration: 2000,
      });
      return;
    }

    // Lưu danh sách sản phẩm được chọn và cartId vào localStorage
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    localStorage.setItem("cartIdForCheckout", cartId!);

    // Chuyển hướng đến trang thanh toán
    router.push("/client/checkout");
  };

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

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
                    <TableHead>
                      <Checkbox
                        checked={selectedItems.length === cartItems.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
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
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(item.id, checked as boolean)
                          }
                        />
                      </TableCell>
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
                    Tổng tiền (đã chọn):{" "}
                    {selectedTotalAmount.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <Button onClick={handleCheckout}>Thanh toán</Button>
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCartItems } from "@/api/cart/cartApi";
import { CartItem } from "@/lib/types";
import { createOrder } from "@/api/orderApi";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Online">("COD");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const cartId = localStorage.getItem("cartIdForCheckout");
  const selectedItemsFromStorage = localStorage.getItem("selectedCartItems");
  const user = localStorage.getItem("fullName");

  useEffect(() => {
    if (!cartId || !user || !selectedItemsFromStorage) {
      router.push("/client/cart");
      return;
    }

    const parsedSelectedItems = JSON.parse(
      selectedItemsFromStorage
    ) as string[];
    setSelectedItems(parsedSelectedItems);

    const fetchCartItems = async () => {
      try {
        const items = await getCartItems(cartId);
        setCartItems(
          items.filter((item) => parsedSelectedItems.includes(item.id))
        );
      } catch (error: any) {
        setError(error.message || "Không thể lấy thông tin giỏ hàng");
        toast.error("Lỗi", {
          description: error.message || "Không thể lấy thông tin giỏ hàng",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [cartId, user, selectedItemsFromStorage, router]);

  // Tính tổng tiền (dùng discountedPrice)
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.discountedPrice * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error("Vui lòng nhập địa chỉ giao hàng", { duration: 2000 });
      return;
    }

    try {
      const orderData = {
        address,
        paymentMethod,
        note: note || undefined,
        cartId: cartId!,
        phoneNumber: phoneNumber || undefined,
        cartItemIds: selectedItems,
      };

      const newOrder = await createOrder(orderData);
      toast.success("Đặt hàng thành công", {
        description: `Mã đơn hàng: ${newOrder.id}`,
        duration: 3000,
      });

      localStorage.removeItem("selectedCartItems");
      localStorage.removeItem("cartIdForCheckout");

      router.push("/client/orders");
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.response?.data?.message || "Không thể tạo đơn hàng",
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

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin giao hàng */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Thông tin giao hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Địa chỉ giao hàng</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Nhập số điện thoại (không bắt buộc)"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                  <Select
                    onValueChange={(value) =>
                      setPaymentMethod(value as "COD" | "Online")
                    }
                    defaultValue="COD"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phương thức thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">
                        Thanh toán khi nhận hàng (COD)
                      </SelectItem>
                      <SelectItem value="Online">
                        Thanh toán trực tuyến
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú nếu có"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin đơn hàng */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
              {cartItems.length === 0 ? (
                <p>Không có sản phẩm nào để thanh toán.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={
                              item.product.productFiles[0]?.file.url ||
                              "/placeholder.png"
                            }
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">
                              Màu: {item.color.name}
                            </p>
                            <p className="text-sm">Số lượng: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {/* Hiển thị giá đã giảm (discountedPrice) thay vì giá gốc (price) */}
                          <p className="font-medium">
                            {(
                              item.product.discountedPrice * item.quantity
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </p>
                          {/* Hiển thị giá gốc nếu có giảm giá */}
                          {item.product.discountedPrice <
                            item.product.price && (
                            <p className="text-sm text-gray-500 line-through">
                              {(
                                item.product.price * item.quantity
                              ).toLocaleString("vi-VN")}{" "}
                              VNĐ
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <p className="text-lg font-semibold">
                      Tổng tiền: {totalAmount.toLocaleString("vi-VN")} VNĐ
                    </p>
                    <Button onClick={handlePlaceOrder} className="mt-4 w-full">
                      Đặt hàng
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

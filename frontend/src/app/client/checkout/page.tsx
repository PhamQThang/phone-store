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
  const [fullName, setFullName] = useState("");
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

  // Lấy thông tin từ localStorage khi component mount
  useEffect(() => {
    if (!cartId || !user || !selectedItemsFromStorage) {
      router.push("/client/cart");
      return;
    }

    // Điền sẵn thông tin từ localStorage
    const storedFullName = localStorage.getItem("fullName") || "";
    const storedAddress = localStorage.getItem("address") || "";
    const storedPhoneNumber = localStorage.getItem("phoneNumber") || "";

    setFullName(storedFullName);
    setAddress(storedAddress);
    setPhoneNumber(storedPhoneNumber);

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
    (sum, item) => sum + (item.product.discountedPrice ?? 0) * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!fullName) {
      toast.error("Vui lòng nhập họ và tên", { duration: 2000 });
      return;
    }
    if (!address) {
      toast.error("Vui lòng nhập địa chỉ giao hàng", { duration: 2000 });
      return;
    }

    // Thêm confirm trước khi đặt hàng
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn ${
        paymentMethod === "Online" ? "thanh toán" : "đặt hàng"
      } với tổng số tiền ${totalAmount.toLocaleString("vi-VN")} VNĐ?`
    );
    if (!isConfirmed) return;

    try {
      const orderData = {
        fullName,
        address,
        paymentMethod,
        note: note || undefined,
        cartId: cartId!,
        phoneNumber: phoneNumber || undefined,
        cartItemIds: selectedItems,
      };

      const { order, paymentUrl } = await createOrder(orderData);

      if (paymentMethod === "Online" && paymentUrl) {
        // Chuyển hướng đến trang thanh toán VNPay
        window.location.href = paymentUrl;
      } else {
        toast.success("Đặt hàng thành công", {
          description: `Mã đơn hàng: ${order.id}`,
          duration: 3000,
        });

        localStorage.removeItem("selectedCartItems");
        localStorage.removeItem("cartIdForCheckout");

        router.push("/client/orders");
      }
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.response?.data?.message || "Không thể tạo đơn hàng",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg flex items-center">
          <svg
            className="animate-spin h-6 w-6 mr-2 text-red-500"
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
          Đang tải...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-red-600 text-lg bg-white p-6 rounded-lg shadow-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-lg border border-gray-100 rounded-xl bg-white">
        <CardHeader className=" text-black rounded-t-xl">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            Thanh toán đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thông tin giao hàng */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Thông tin giao hàng
              </h2>
              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="mt-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-red-300"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-gray-700"
                  >
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng"
                    className="mt-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-red-300"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="phoneNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Số điện thoại
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Nhập số điện thoại (không bắt buộc)"
                    className="mt-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-red-300"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="paymentMethod"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phương thức thanh toán
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setPaymentMethod(value as "COD" | "Online")
                    }
                    defaultValue="COD"
                  >
                    <SelectTrigger className="mt-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200">
                      <SelectValue placeholder="Chọn phương thức thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">
                        Thanh toán khi nhận hàng (COD)
                      </SelectItem>
                      <SelectItem value="Online">
                        Thanh toán trực tuyến (VNPay)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="note"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ghi chú (không bắt buộc)
                  </Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú nếu có"
                    className="mt-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-red-300"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Thông tin đơn hàng
              </h2>
              {cartItems.length === 0 ? (
                <p className="text-gray-600">
                  Không có sản phẩm nào để thanh toán.
                </p>
              ) : (
                <>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center border-b pb-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={
                              item.product.productFiles[0]?.file.url ||
                              "/placeholder.png"
                            }
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Màu: {item.color.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            {(
                              (item.product.discountedPrice ?? 0) *
                              item.quantity
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </p>
                          {(item.product.discountedPrice ?? 0) <
                            item.product.price && (
                            <p className="text-sm text-gray-400 line-through">
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
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-gray-800">
                      Tổng tiền:{" "}
                      <span className="text-red-600">
                        {totalAmount.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </p>
                    <Button
                      onClick={handlePlaceOrder}
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                    >
                      {paymentMethod === "Online"
                        ? "Thanh toán ngay"
                        : "Đặt hàng"}
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

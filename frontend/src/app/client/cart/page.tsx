"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import {
  getCartItems,
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
      setCartItems(response);
    } catch (error: any) {
      setError(error.message || "Không thể lấy giỏ hàng");
      toast.error("Lỗi", {
        description: error.message || "Không thể lấy giỏ hàng",
      });
    } finally {
      setLoading(false);
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
      toast.success("Cập nhật số lượng thành công");
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể cập nhật số lượng",
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
      toast.success("Xóa sản phẩm thành công");
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể xóa sản phẩm",
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

  const selectedTotalAmount = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce(
      (sum, item) => sum + (item.product.discountedPrice ?? 0) * item.quantity,
      0
    );

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    // Kiểm tra số lượng tồn kho dựa trên productIdentities
    const outOfStockItems = cartItems
      .filter((item) => selectedItems.includes(item.id))
      .filter((item) => {
        const availableStock = item.product.productIdentities?.filter(
          (pi) => pi.colorId === item.color.id && !pi.isSold
        ).length; // Đếm số lượng chưa bán
        return availableStock === undefined || item.quantity > availableStock;
      });

    if (outOfStockItems.length > 0) {
      const outOfStockNames = outOfStockItems
        .map((item) => item.product.name)
        .join(", ");
      toast.error(
        `Số lượng không đủ cho các sản phẩm: ${outOfStockNames}. Vui lòng kiểm tra lại!`
      );
      return;
    }

    // Nếu tồn kho đủ, tiếp tục quy trình thanh toán
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    localStorage.setItem("cartIdForCheckout", cartId!);
    router.push("/client/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
        <p className="mt-2 text-gray-600">
          {cartItems.length} sản phẩm trong giỏ hàng
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <Card className="rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <Checkbox
                  checked={
                    selectedItems.length === cartItems.length &&
                    cartItems.length > 0
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked as boolean)
                  }
                  className="h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Chọn tất cả
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Giỏ hàng trống
                  </h3>
                  <p className="mt-1 text-gray-500 mb-6">
                    Bạn chưa có sản phẩm nào trong giỏ hàng.
                  </p>
                  <Button
                    onClick={() => router.push("/client/products")}
                    className="bg-red-500 hover:bg-red-600 px-6 py-3"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => {
                    const hasDiscount =
                      (item.product.discountedPrice ?? 0) < item.product.price;
                    const discountPercentage = hasDiscount
                      ? Math.round(
                          (1 -
                            (item.product.discountedPrice ?? 0) /
                              item.product.price) *
                            100
                        )
                      : 0;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(item.id, checked as boolean)
                            }
                            className="h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                          />
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-md overflow-hidden border">
                            <img
                              src={
                                item.product.productFiles?.length > 0
                                  ? item.product.productFiles[0].file.url
                                  : "/placeholder.png"
                              }
                              alt={item.product.name}
                              className="w-full h-full object-contain p-2"
                            />
                            {hasDiscount && (
                              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                                -{discountPercentage}%
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-gray-500">{item.color.name}</p>
                          <div className="mt-2 flex items-center flex-wrap gap-2">
                            <span className="text-lg font-bold text-red-500">
                              {(
                                item.product.discountedPrice ?? 0
                              ).toLocaleString("vi-VN")}
                              ₫
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-gray-500 line-through">
                                {item.product.price.toLocaleString("vi-VN")}₫
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              className="h-8 w-8 p-0"
                              disabled={item.quantity <= 1}
                            >
                              -
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
                              className="w-16 text-center"
                              min={1}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {cartItems.length > 0 && (
          <div className="lg:w-1/3">
            <Card className="rounded-lg shadow-sm sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Tóm tắt đơn hàng
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">
                      {selectedTotalAmount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Tổng cộng</span>
                      <span className="text-lg font-bold text-red-500">
                        {selectedTotalAmount.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="mt-6 w-full bg-red-500 hover:bg-red-600 py-3 text-lg"
                >
                  Thanh toán ({selectedItems.length})
                </Button>
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Miễn phí vận chuyển cho đơn hàng từ 5 triệu
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

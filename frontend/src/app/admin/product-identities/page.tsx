"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getProductIdentities } from "@/api/admin/productIdentitiesApi";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductIdentitiesPage() {
  const router = useRouter();
  const [productIdentities, setProductIdentities] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    soldProducts: 0,
    unsoldProducts: 0,
  });
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [soldFilter, setSoldFilter] = useState<string | undefined>(undefined); // Bộ lọc trạng thái bán

  // Hàm định dạng ngày
  const formatDate = (date: string | null) => {
    if (!date) return "Chưa cập nhật";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Kiểm tra auth và lấy dữ liệu khi component mount
  useEffect(() => {
    const authData = getAuthData();
    if (!authData || !["Admin", "Employee"].includes(authData.role || "")) {
      clearAuthData();
      router.push("/auth/login");
    } else {
      setRole(authData.role);
      let isMounted = true;

      startTransition(async () => {
        try {
          const response = await getProductIdentities(); // Fetch all data
          if (isMounted) {
            setProductIdentities(response.data || []);
            setSummary(
              response.summary || {
                totalProducts: 0,
                soldProducts: 0,
                unsoldProducts: 0,
              }
            );
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách product identity:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [router]);

  // Lọc dữ liệu trên frontend
  const filteredProductIdentities = productIdentities.filter((pi) => {
    if (soldFilter === undefined) return true; // Show all if no filter
    return pi.isSold === (soldFilter === "true");
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thống kê số lượng sản phẩm</h1>
        <Select
          value={soldFilter ?? "all"}
          onValueChange={(value) =>
            setSoldFilter(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đã bán</SelectItem>
            <SelectItem value="false">Chưa bán</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6 bg-gray-100 py-4 rounded-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-2 bg-white rounded shadow">
            <p className="text-sm text-gray-600">Tổng sản phẩm</p>
            <p className="text-xl font-bold">{summary.totalProducts}</p>
          </div>
          <div className="p-2 bg-white rounded shadow">
            <p className="text-sm text-gray-600">Sản phẩm đã bán</p>
            <p className="text-xl font-bold">{summary.soldProducts}</p>
          </div>
          <div className="p-2 bg-white rounded shadow">
            <p className="text-sm text-gray-600">Sản phẩm chưa bán</p>
            <p className="text-xl font-bold">{summary.unsoldProducts}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead>Mẫu</TableHead>
              <TableHead>Màu sắc</TableHead>
              <TableHead>Trạng thái bán</TableHead>
              <TableHead>Giá nhập</TableHead>
              <TableHead>Ngày bắt đầu BH</TableHead>
              <TableHead>Ngày kết thúc BH</TableHead>
              <TableHead>Đơn hàng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProductIdentities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredProductIdentities.map((pi, index) => (
                  <TableRow key={pi.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{pi.imei}</TableCell>
                    <TableCell>{pi.productName}</TableCell>
                    <TableCell>{pi.brand}</TableCell>
                    <TableCell>{pi.model}</TableCell>
                    <TableCell>{pi.colorName}</TableCell>
                    <TableCell>{pi.isSold ? "Đã bán" : "Chưa bán"}</TableCell>
                    <TableCell>{formatCurrency(pi.importPrice)}</TableCell>
                    <TableCell>{formatDate(pi.warrantyStartDate)}</TableCell>
                    <TableCell>{formatDate(pi.warrantyEndDate)}</TableCell>
                    <TableCell>{pi.orderId ?? "Chưa có"}</TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

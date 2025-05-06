"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  getOrderStats,
  getStoreSummaryStats,
  OrderStatsResponse,
} from "@/api/admin/statisticsApi";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  // Hàm tính ngày cách đây 1 tuần
  const getOneWeekAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  };

  // State để lưu trữ dữ liệu tổng quan
  const [storeSummary, setStoreSummary] = useState({
    totalProducts: 0,
    totalProductsSold: 0,
    totalPurchaseAmount: 0,
    totalSellingPrice: 0,
    totalProfit: 0,
    totalOrders: 0,
  });

  // State cho dữ liệu biểu đồ
  const [dailyStats, setDailyStats] = useState<OrderStatsResponse[]>([]);

  // Mặc định: 1 tuần trước đến hiện tại
  const [startDate, setStartDate] = useState<string>(getOneWeekAgoDate());
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // State để theo dõi trạng thái tải dữ liệu
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Kiểm tra ngày hợp lệ
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
          setError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
          setDailyStats([]);
          return;
        }

        // Lấy thống kê tổng quan
        const summaryResponse = await getStoreSummaryStats();
        console.log("summaryResponse", summaryResponse);

        setStoreSummary(summaryResponse);

        // Lấy thống kê theo khoảng thời gian đã chọn
        const orderStatsResponse = await getOrderStats(startDate, endDate);
        console.log("orderStatsResponse", orderStatsResponse);

        setDailyStats(orderStatsResponse || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi khi lấy dữ liệu thống kê");
        setDailyStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  // Dữ liệu cho biểu đồ tài chính
  const financialChartData = {
    labels: dailyStats.map((stat) => stat.date),
    datasets: [
      {
        label: "Tiền nhập hàng",
        data: dailyStats.map((stat) => stat.totalPurchaseAmount || 0),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
      {
        label: "Tiền bán hàng",
        data: dailyStats.map((stat) => stat.totalSellingPrice || 0),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
      {
        label: "Lợi nhuận",
        data: dailyStats.map((stat) => stat.totalProfit || 0),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

  // Dữ liệu cho biểu đồ đơn hàng
  const orderChartData = {
    labels: dailyStats.map((stat) => stat.date),
    datasets: [
      {
        label: "Tổng đơn hàng",
        data: dailyStats.map((stat) => stat.totalOrders || 0),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
      {
        label: "Đơn đã giao",
        data: dailyStats.map((stat) => stat.totalDelivered || 0),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
      {
        label: "Đơn đang xử lý",
        data: dailyStats.map((stat) => stat.totalProcessing || 0),
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
      {
        label: "Đơn đã hủy",
        data: dailyStats.map((stat) => stat.totalCancelled || 0),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
      {
        label: "Sản phẩm đã bán",
        data: dailyStats.map((stat) => stat.totalProductsSold || 0),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

  // Options chung cho cả 2 biểu đồ
  const commonChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      title: {
        display: true,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (
              ["Tiền nhập hàng", "Tiền bán hàng", "Lợi nhuận"].includes(
                context.dataset.label
              )
            ) {
              label += formatCurrency(context.raw);
            } else {
              label += context.raw;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            if (typeof value === "number" && value >= 1000) {
              return value.toLocaleString();
            }
            return value;
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Options riêng cho biểu đồ tài chính
  const financialChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: `Thống kê tài chính từ ${new Date(startDate).toLocaleDateString(
          "vi-VN"
        )} đến ${new Date(endDate).toLocaleDateString("vi-VN")}`,
      },
    },
    scales: {
      ...commonChartOptions.scales,
      y: {
        ...commonChartOptions.scales.y,
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  // Options riêng cho biểu đồ đơn hàng
  const orderChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: `Thống kê đơn hàng từ ${new Date(startDate).toLocaleDateString(
          "vi-VN"
        )} đến ${new Date(endDate).toLocaleDateString("vi-VN")}`,
      },
    },
  };

  // Hàm xử lý thay đổi khoảng thời gian
  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{storeSummary.totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(storeSummary.totalSellingPrice)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lợi nhuận</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(storeSummary.totalProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc khoảng thời gian */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Bộ lọc khoảng thời gian</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Từ ngày:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                max={endDate}
                className="rounded-md border-gray-300 py-1 pl-2 pr-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Đến ngày:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                min={startDate}
                max={new Date().toISOString().split("T")[0]}
                className="rounded-md border-gray-300 py-1 pl-2 pr-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Biểu đồ tài chính */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thống kê tài chính</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={financialChartData} options={financialChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Biểu đồ đơn hàng */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thống kê đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={orderChartData} options={orderChartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

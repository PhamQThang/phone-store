"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  getInventoryStats,
  getRevenueStats,
  getMonthlyRevenueStats,
  getUserStats,
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
  // State để lưu trữ dữ liệu từ API
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([
    "revenue",
    "profit",
  ]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);

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

  // Hàm lấy danh sách các năm có dữ liệu
  const fetchAvailableYears = async () => {
    try {
      // Giả sử bạn có API endpoint để lấy các năm có dữ liệu
      // Nếu không, có thể tạo mảng năm từ năm hiện tại trở về trước 5 năm
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
      setAvailableYears(years);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách năm:", err);
      // Fallback: tạo mảng năm mặc định nếu API fail
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear, currentYear - 1, currentYear - 2]);
    }
  };

  // Gọi API để lấy dữ liệu khi component mount hoặc năm thay đổi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy thống kê tồn kho (không phụ thuộc vào năm)
        const inventoryResponse = await getInventoryStats();
        const inventoryData = inventoryResponse;
        const total = inventoryData.reduce(
          (sum: number, stat: any) => sum + stat.stockQuantity,
          0
        );
        setTotalProducts(total);

        // Lấy thống kê doanh thu tổng (không phụ thuộc vào năm)
        const revenueResponse = await getRevenueStats();
        const revenueData = revenueResponse;
        setTotalRevenue(revenueData.summary.totalRevenue);

        // Lấy thống kê người dùng (không phụ thuộc vào năm)
        const userResponse = await getUserStats();
        const userData = userResponse;
        setTotalUsers(userData.totalUsers);

        // Lấy thống kê doanh thu theo tháng (theo năm được chọn)
        const monthlyResponse = await getMonthlyRevenueStats(selectedYear);
        const monthlyData = monthlyResponse;
        setMonthlyStats(monthlyData);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi khi lấy dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchAvailableYears();
  }, [selectedYear]);

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: monthlyStats.map((stat) => `Tháng ${stat.month}`),
    datasets: [
      {
        label: "Doanh thu",
        data: monthlyStats.map((stat) => stat.revenue || 0),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        borderWidth: 2,
        hidden: !selectedDatasets.includes("revenue"),
      },
      {
        label: "Giá nhập",
        data: monthlyStats.map((stat) => stat.importPrice || 0),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
        borderWidth: 2,
        hidden: !selectedDatasets.includes("importPrice"),
      },
      {
        label: "Giá bán",
        data: monthlyStats.map((stat) => stat.sellingPrice || 0),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
        borderWidth: 2,
        hidden: !selectedDatasets.includes("sellingPrice"),
      },
      {
        label: "Lợi nhuận",
        data: monthlyStats.map((stat) => stat.profit || 0),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        tension: 0.1,
        borderWidth: 2,
        hidden: !selectedDatasets.includes("profit"),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        onClick: (e: any, legendItem: any, legend: any) => {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          const meta = ci.getDatasetMeta(index);

          // Toggle visibility
          meta.hidden = !meta.hidden;

          // Cập nhật state selectedDatasets
          const datasetLabel = ci.data.datasets[index].label.toLowerCase();
          if (meta.hidden) {
            setSelectedDatasets((prev) =>
              prev.filter((item) => item !== datasetLabel)
            );
          } else {
            setSelectedDatasets((prev) => [...prev, datasetLabel]);
          }

          ci.update();
        },
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Thống kê theo tháng năm ${selectedYear}`,
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
            label += formatCurrency(context.raw);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value),
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

  // Hàm xử lý thay đổi năm
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
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
            <CardTitle className="text-sm font-medium">
              Tổng sản phẩm tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Biểu đồ thống kê</CardTitle>
          <div className="flex items-center gap-2">
            <label
              htmlFor="year-select"
              className="text-sm font-medium text-gray-700"
            >
              Năm:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Checkbox để chọn dataset hiển thị */}
          <div className="flex flex-wrap gap-4 mt-4">
            {chartData.datasets.map((dataset) => (
              <div key={dataset.label} className="flex items-center">
                <input
                  type="checkbox"
                  id={`toggle-${dataset.label}`}
                  checked={selectedDatasets.includes(
                    dataset.label.toLowerCase()
                  )}
                  onChange={() => {
                    const datasetLabel = dataset.label.toLowerCase();
                    setSelectedDatasets((prev) =>
                      prev.includes(datasetLabel)
                        ? prev.filter((item) => item !== datasetLabel)
                        : [...prev, datasetLabel]
                    );
                  }}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`toggle-${dataset.label}`}
                  className="text-sm font-medium text-gray-700"
                  style={{ color: dataset.borderColor }}
                >
                  {dataset.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

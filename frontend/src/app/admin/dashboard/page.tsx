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
  DailyStat,
  getOrderStats,
  getStoreSummaryStats,
  DailyProfitStatsResponse,
  getDailyProfitStats,
} from "@/api/admin/statisticsApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
    };

    const startFormatted = formatDate(start);
    const endFormatted = formatDate(end);

    console.log("Ngày hiện tại:", endFormatted);

    return {
      start: startFormatted,
      end: endFormatted,
    };
  };

  const [storeSummary, setStoreSummary] = useState({
    totalCustomers: 0,
    totalProductsSold: 0,
    totalPurchaseAmount: 0,
    totalSellingPrice: 0,
    totalReturnAmount: 0,
    totalProfit: 0,
    totalOrders: 0,
  });

  const { start, end } = getDefaultDateRange();
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [startDate, setStartDate] = useState<string>(start);
  const [endDate, setEndDate] = useState<string>(end);

  const [dailyProfitStats, setDailyProfitStats] =
    useState<DailyProfitStatsResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProfit, setLoadingProfit] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorProfit, setErrorProfit] = useState<string | null>(null);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
        setDailyStats([]);
        return;
      }

      const summaryResponse = await getStoreSummaryStats();
      setStoreSummary(summaryResponse);

      const orderStatsResponse = await getOrderStats(startDate, endDate);
      setDailyStats(orderStatsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi lấy dữ liệu thống kê");
      setDailyStats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyProfitStats = async () => {
    try {
      setLoadingProfit(true);
      setErrorProfit(null);

      const date = new Date(selectedDate);
      if (isNaN(date.getTime())) {
        throw new Error("Ngày không hợp lệ. Vui lòng chọn lại.");
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        toast.error("Lỗi lọc dữ liệu", {
          description: "Ngày chọn không được lớn hơn ngày hiện tại.",
          duration: 3000,
        });
        return;
      }

      const profitStatsResponse = await getDailyProfitStats(selectedDate);
      setDailyProfitStats(profitStatsResponse);
    } catch (err: any) {
      setErrorProfit(
        err.response?.data?.message ||
          err.message ||
          "Lỗi khi lấy dữ liệu thống kê lợi nhuận"
      );
      setDailyProfitStats(null);
    } finally {
      setLoadingProfit(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") setStartDate(value);
    else setEndDate(value);
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast.error("Lỗi lọc dữ liệu", {
        description: "Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.",
        duration: 3000,
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Lỗi lọc dữ liệu", {
        description: "Ngày không hợp lệ. Vui lòng chọn lại.",
        duration: 3000,
      });
      return;
    }

    if (start > end) {
      toast.error("Lỗi lọc dữ liệu", {
        description: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.",
        duration: 3000,
      });
      return;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (end > today) {
      toast.error("Lỗi lọc dữ liệu", {
        description: "Ngày kết thúc không được lớn hơn ngày hiện tại.",
        duration: 3000,
      });
      return;
    }

    fetchData();
  };

  const handleProfitDateChange = (value: string) => {
    setSelectedDate(value);
  };

  const handleFetchProfitStats = () => {
    if (!selectedDate) {
      toast.error("Lỗi lọc dữ liệu", {
        description: "Vui lòng chọn ngày để thống kê.",
        duration: 3000,
      });
      return;
    }
    fetchDailyProfitStats();
  };

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
      {
        label: "Tiền hoàn trả",
        data: dailyStats.map((stat) => stat.totalReturnAmount || 0),
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

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
      {
        label: "Phiếu đổi trả",
        data: dailyStats.map((stat) => stat.totalReturnTickets || 0),
        borderColor: "rgba(201, 203, 207, 1)",
        backgroundColor: "rgba(201, 203, 207, 0.2)",
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

  const commonChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, pointStyle: "circle", padding: 20 },
      },
      title: { display: true, font: { size: 16 } },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (
              [
                "Tiền nhập hàng",
                "Tiền bán hàng",
                "Lợi nhuận",
                "Tiền hoàn trả",
              ].includes(context.dataset.label)
            ) {
              return label + formatCurrency(context.raw);
            }
            return label + context.raw;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) =>
            typeof value === "number" && value >= 1000
              ? value.toLocaleString()
              : value,
        },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
      },
      x: { grid: { display: false } },
    },
    maintainAspectRatio: false,
  };

  const financialChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: `Thống kê tài chính từ ${new Date(startDate).toLocaleDateString(
          "vi-VN",
          { timeZone: "Asia/Ho_Chi_Minh" }
        )} đến ${new Date(endDate).toLocaleDateString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        })}`,
      },
    },
    scales: {
      ...commonChartOptions.scales,
      y: {
        ...commonChartOptions.scales.y,
        ticks: { callback: (value: any) => formatCurrency(value) },
      },
    },
  };

  const orderChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: `Thống kê đơn hàng từ ${new Date(startDate).toLocaleDateString(
          "vi-VN",
          { timeZone: "Asia/Ho_Chi_Minh" }
        )} đến ${new Date(endDate).toLocaleDateString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        })}`,
      },
    },
  };

  if (loading)
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
            <CardTitle className="text-sm font-medium">Tiền hoàn trả</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(storeSummary.totalReturnAmount)}
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tiền nhập hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(storeSummary.totalPurchaseAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc khoảng thời gian */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Bộ lọc khoảng thời gian</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
                className="rounded-md border-gray-300 py-1 pl-2 pr-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <Button
              onClick={handleFilter}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              Lọc
            </Button>
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

      {/* Biểu đồ đơn hàng và phiếu đổi trả */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thống kê đơn hàng & Phiếu đổi trả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={orderChartData} options={orderChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Thống kê lợi nhuận ngày từ /statistics/profit-daily */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Thống kê lợi nhuận ngày</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Chọn ngày:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleProfitDateChange(e.target.value)}
                className="rounded-md border-gray-300 py-1 pl-2 pr-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <Button
              onClick={handleFetchProfitStats}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loadingProfit}
            >
              Thống kê
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingProfit && (
            <div className="text-center py-4">Đang tải dữ liệu thống kê...</div>
          )}
          {errorProfit && (
            <div className="text-center py-4 text-red-500">{errorProfit}</div>
          )}
          {dailyProfitStats && (
            <>
              {/* Tổng quan lợi nhuận ngày */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng tiền nhập hàng
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      dailyProfitStats.data.summary.totalPurchaseAmount
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng tiền bán hàng
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      dailyProfitStats.data.summary.totalSellingPrice
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Lợi nhuận</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(dailyProfitStats.data.summary.totalProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Doanh thu (trước hoàn trả)
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(dailyProfitStats.data.summary.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng tiền hoàn trả
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      dailyProfitStats.data.summary.totalReturnAmount
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Doanh thu thực tế
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(dailyProfitStats.data.summary.netRevenue)}
                  </p>
                </div>
              </div>

              {/* Danh sách chi tiết đơn hàng */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Chi tiết đơn hàng đã bán</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyProfitStats.data.details.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã đơn hàng</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>IMEI</TableHead>
                          <TableHead>Giá nhập</TableHead>
                          <TableHead>Giá bán</TableHead>
                          <TableHead>Lợi nhuận</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyProfitStats.data.details.map((detail) => (
                          <TableRow key={`${detail.orderId}-${detail.imei}`}>
                            <TableCell>{detail.orderId}</TableCell>
                            <TableCell>{detail.productName}</TableCell>
                            <TableCell>{detail.imei}</TableCell>
                            <TableCell>
                              {formatCurrency(detail.importPrice)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(detail.sellingPrice)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(detail.profit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-500">
                      Không có đơn hàng nào trong ngày này.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Danh sách phiếu đổi trả */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Danh sách phiếu đổi trả</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyProfitStats.data.returnTickets.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã phiếu</TableHead>
                          <TableHead>IMEI</TableHead>
                          <TableHead>Giá gốc</TableHead>
                          <TableHead>Giá giảm</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ngày bắt đầu</TableHead>
                          <TableHead>Ngày kết thúc</TableHead>
                          <TableHead>Ghi chú</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyProfitStats.data.returnTickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell>{ticket.id}</TableCell>
                            <TableCell>{ticket.imei}</TableCell>
                            <TableCell>
                              {ticket.originalPrice
                                ? formatCurrency(ticket.originalPrice)
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {ticket.discountedPrice
                                ? formatCurrency(ticket.discountedPrice)
                                : "N/A"}
                            </TableCell>
                            <TableCell>{ticket.status}</TableCell>
                            <TableCell>
                              {formatDateTime(ticket.startDate)}
                            </TableCell>
                            <TableCell>
                              {formatDateTime(ticket.endDate)}
                            </TableCell>
                            <TableCell>
                              {ticket.note || "Không có ghi chú"}
                            </TableCell>
                            <TableCell>
                              {formatDateTime(ticket.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-500">
                      Không có phiếu đổi trả nào trong ngày này.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

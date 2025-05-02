import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReturnTicket } from "@/lib/types";

interface ReturnTicketDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnTicket: ReturnTicket | null;
}

export function ReturnTicketDetail({
  open,
  onOpenChange,
  returnTicket,
}: ReturnTicketDetailProps) {
  if (!returnTicket) return null;

  const translateReturnTicketStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Requested: "Đã yêu cầu",
      Processing: "Đang xử lý",
      Processed: "Đã xử lý",
      Returned: "Đã trả hàng",
      Canceled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu đổi trả</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong className="text-gray-800">Mã phiếu:</strong>{" "}
            {returnTicket.id.substring(0, 8)}...
          </div>
          <div>
            <strong className="text-gray-800">Sản phẩm:</strong>{" "}
            {returnTicket.productIdentity.product.name}
          </div>
          <div>
            <strong className="text-gray-800">IMEI:</strong>{" "}
            {returnTicket.productIdentity.imei || "Không có"}
          </div>
          <div>
            <strong className="text-gray-800">Màu sắc:</strong>{" "}
            {returnTicket.productIdentity.color?.name || "Không có"}
          </div>
          {returnTicket.productIdentity.product.imageUrl && (
            <div>
              <strong className="text-gray-800">Hình ảnh:</strong>
              <img
                src={returnTicket.productIdentity.product.imageUrl}
                alt={returnTicket.productIdentity.product.name}
                className="w-32 h-32 object-cover mt-2 rounded-md"
              />
            </div>
          )}
          <div>
            <strong className="text-gray-800">Người dùng:</strong>{" "}
            {returnTicket.user.fullName}
          </div>
          <div>
            <strong className="text-gray-800">Thời gian đổi trả:</strong>{" "}
            {new Date(returnTicket.startDate).toLocaleDateString("vi-VN")} -{" "}
            {new Date(returnTicket.endDate).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="text-gray-800">Trạng thái:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                returnTicket.status === "Requested"
                  ? "bg-yellow-100 text-yellow-800"
                  : returnTicket.status === "Processing"
                  ? "bg-blue-100 text-blue-800"
                  : returnTicket.status === "Processed"
                  ? "bg-purple-100 text-purple-800"
                  : returnTicket.status === "Returned"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {translateReturnTicketStatus(returnTicket.status)}
            </span>
          </div>
          <div>
            <strong className="text-gray-800">Ghi chú:</strong>{" "}
            {returnTicket.note || "Không có"}
          </div>
          {returnTicket.productReturn && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Thông tin yêu cầu đổi trả liên quan
              </h3>
              <div className="space-y-2 mt-2">
                <div>
                  <strong className="text-gray-800">Mã yêu cầu:</strong>{" "}
                  {returnTicket.productReturn.id.substring(0, 8)}...
                </div>
                <div>
                  <strong className="text-gray-800">Lý do:</strong>{" "}
                  {returnTicket.productReturn.reason}
                </div>
                <div>
                  <strong className="text-gray-800">Ngày yêu cầu:</strong>{" "}
                  {new Date(
                    returnTicket.productReturn.returnDate
                  ).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          )}
          <div>
            <strong className="text-gray-800">Ngày tạo:</strong>{" "}
            {new Date(returnTicket.createdAt).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="text-gray-800">Ngày cập nhật:</strong>{" "}
            {new Date(returnTicket.updatedAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

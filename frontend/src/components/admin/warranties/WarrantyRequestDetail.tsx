import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WarrantyRequest } from "@/lib/types";

interface WarrantyRequestDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warrantyRequest: WarrantyRequest | null;
}

export function WarrantyRequestDetail({
  open,
  onOpenChange,
  warrantyRequest,
}: WarrantyRequestDetailProps) {
  if (!warrantyRequest) return null;

  const translateWarrantyRequestStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Đang chờ",
      Approved: "Đã duyệt",
      Rejected: "Bị từ chối",
      Completed: "Hoàn tất",
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu bảo hành</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong className="text-gray-800">Mã yêu cầu:</strong>{" "}
            {warrantyRequest.id.substring(0, 8)}...
          </div>
          <div>
            <strong className="text-gray-800">Sản phẩm:</strong>{" "}
            {warrantyRequest.productIdentity.product.name}
          </div>
          <div>
            <strong className="text-gray-800">IMEI:</strong>{" "}
            {warrantyRequest.productIdentity.imei || "Không có"}
          </div>
          <div>
            <strong className="text-gray-800">Màu sắc:</strong>{" "}
            {warrantyRequest.productIdentity.color?.name || "Không có"}
          </div>
          <div>
            <strong className="text-gray-800">Số lần bảo hành:</strong>{" "}
            {warrantyRequest.productIdentity.warrantyCount || 0}
          </div>
          <div>
            <strong className="text-gray-800">Thời gian bảo hành:</strong>{" "}
            {warrantyRequest.productIdentity.warrantyStartDate &&
            warrantyRequest.productIdentity.warrantyEndDate
              ? `${new Date(
                  warrantyRequest.productIdentity.warrantyStartDate
                ).toLocaleDateString("vi-VN")} - ${new Date(
                  warrantyRequest.productIdentity.warrantyEndDate
                ).toLocaleDateString("vi-VN")}`
              : "Không có"}
          </div>
          <div>
            <strong className="text-gray-800">Người yêu cầu:</strong>{" "}
            {warrantyRequest.user.fullName}
          </div>
          <div>
            <strong className="text-gray-800">Lý do:</strong>{" "}
            {warrantyRequest.reason}
          </div>
          <div>
            <strong className="text-gray-800">Họ tên:</strong>{" "}
            {warrantyRequest.fullName}
          </div>
          <div>
            <strong className="text-gray-800">Số điện thoại:</strong>{" "}
            {warrantyRequest.phoneNumber}
          </div>
          <div>
            <strong className="text-gray-800">Địa chỉ:</strong>{" "}
            {warrantyRequest.address}
          </div>
          <div>
            <strong className="text-gray-800">Trạng thái:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                warrantyRequest.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : warrantyRequest.status === "Approved"
                  ? "bg-blue-100 text-blue-800"
                  : warrantyRequest.status === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {translateWarrantyRequestStatus(warrantyRequest.status)}
            </span>
          </div>
          <div>
            <strong className="text-gray-800">Ngày yêu cầu:</strong>{" "}
            {new Date(warrantyRequest.requestDate).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="text-gray-800">Ngày tạo:</strong>{" "}
            {new Date(warrantyRequest.createdAt).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="text-gray-800">Ngày cập nhật:</strong>{" "}
            {new Date(warrantyRequest.updatedAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

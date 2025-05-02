import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Warranty } from "@/lib/types";

interface WarrantyDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warranty: Warranty | null;
}

export function WarrantyDetail({
  open,
  onOpenChange,
  warranty,
}: WarrantyDetailProps) {
  if (!warranty) return null;

  const translateWarrantyStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Requested: "Đã yêu cầu",
      Processing: "Đang xử lý",
      Repairing: "Đang sửa chữa",
      Repaired: "Đã sửa xong",
      Returned: "Đã trả máy",
      Canceled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu bảo hành</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong className="text-gray-800">Mã phiếu:</strong>{" "}
            {warranty.id.substring(0, 8)}...
          </div>
          <div>
            <strong className="text-gray-800">Sản phẩm:</strong>{" "}
            {warranty.productIdentity.product.name}
          </div>
          <div>
            <strong className="text-gray-800">IMEI:</strong>{" "}
            {warranty.productIdentity.imei || "Không có"}
          </div>
          <div>
            <strong className="text-gray-800">Màu sắc:</strong>{" "}
            {warranty.productIdentity.color?.name || "Không có"}
          </div>
          {warranty.productIdentity.product.imageUrl && (
            <div>
              <strong className="text-gray-800">Hình ảnh:</strong>
              <img
                src={warranty.productIdentity.product.imageUrl}
                alt={warranty.productIdentity.product.name}
                className="w-32 h-32 object-cover mt-2 rounded-md"
              />
            </div>
          )}
          <div>
            <strong className="text-gray-800">Số lần bảo hành:</strong>{" "}
            {warranty.productIdentity.warrantyCount || 0}
          </div>
          <div>
            <strong className="text-gray-800">Thời gian bảo hành:</strong>{" "}
            {warranty.productIdentity.warrantyStartDate &&
            warranty.productIdentity.warrantyEndDate
              ? `${new Date(
                  warranty.productIdentity.warrantyStartDate
                ).toLocaleDateString("vi-VN")} - ${new Date(
                  warranty.productIdentity.warrantyEndDate
                ).toLocaleDateString("vi-VN")}`
              : "Không có"}
          </div>
          <div>
            <strong className="text-gray-800">Người dùng:</strong>{" "}
            {warranty.user.fullName}
          </div>
          <div>
            <strong className="text-gray-800">Thời gian bảo hành:</strong>{" "}
            {new Date(warranty.startDate).toLocaleDateString("vi-VN")} -{" "}
            {new Date(warranty.endDate).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="text-gray-800">Trạng thái:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                warranty.status === "Requested"
                  ? "bg-yellow-100 text-yellow-800"
                  : warranty.status === "Processing"
                  ? "bg-blue-100 text-blue-800"
                  : warranty.status === "Repairing"
                  ? "bg-purple-100 text-purple-800"
                  : warranty.status === "Repaired"
                  ? "bg-orange-100 text-orange-800"
                  : warranty.status === "Returned"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {translateWarrantyStatus(warranty.status)}
            </span>
          </div>
          <div>
            <strong className="text-gray-800">Ghi chú:</strong>{" "}
            {warranty.note || "Không có"}
          </div>
          {warranty.warrantyRequest && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Thông tin yêu cầu bảo hành liên quan
              </h3>
              <div className="space-y-2 mt-2">
                <div>
                  <strong className="text-gray-800">Mã yêu cầu:</strong>{" "}
                  {warranty.warrantyRequest.id.substring(0, 8)}...
                </div>
                <div>
                  <strong className="text-gray-800">Lý do:</strong>{" "}
                  {warranty.warrantyRequest.reason}
                </div>
                <div>
                  <strong className="text-gray-800">Ngày yêu cầu:</strong>{" "}
                  {new Date(
                    warranty.warrantyRequest.requestDate
                  ).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          )}
          <div>
            <strong className="text-gray-800">Ngày tạo:</strong>{" "}
            {new Date(warranty.createdAt).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="text-gray-800">Ngày cập nhật:</strong>{" "}
            {new Date(warranty.updatedAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết yêu cầu bảo hành
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>ID:</strong> {warrantyRequest.id}
          </div>
          <div>
            <strong>Sản phẩm:</strong>{" "}
            {warrantyRequest.productIdentity.product.name}
          </div>
          <div>
            <strong>Màu sắc:</strong>{" "}
            {warrantyRequest.productIdentity.color?.name || "Không có"}
          </div>
          <div>
            <strong>IMEI:</strong> {warrantyRequest.productIdentity.imei}
          </div>
          <div>
            <strong>Số lần bảo hành:</strong>{" "}
            {warrantyRequest.productIdentity.warrantyCount || 0}
          </div>
          <div>
            <strong>Trạng thái bán:</strong>{" "}
            {warrantyRequest.productIdentity.isSold ? "Đã bán" : "Chưa bán"}
          </div>
          <div>
            <strong>Thời hạn bảo hành:</strong>{" "}
            {warrantyRequest.productIdentity.warrantyStartDate &&
            warrantyRequest.productIdentity.warrantyEndDate
              ? `${new Date(
                  warrantyRequest.productIdentity.warrantyStartDate
                ).toLocaleDateString()} - ${new Date(
                  warrantyRequest.productIdentity.warrantyEndDate
                ).toLocaleDateString()}`
              : "Không có"}
          </div>
          <div>
            <strong>Người yêu cầu:</strong> {warrantyRequest.user.fullName}
          </div>
          <div>
            <strong>Lý do:</strong> {warrantyRequest.reason}
          </div>
          <div>
            <strong>Họ tên:</strong> {warrantyRequest.fullName}
          </div>
          <div>
            <strong>Số điện thoại:</strong> {warrantyRequest.phoneNumber}
          </div>
          <div>
            <strong>Email:</strong> {warrantyRequest.email}
          </div>
          <div>
            <strong>Trạng thái:</strong> {warrantyRequest.status}
          </div>
          <div>
            <strong>Ngày yêu cầu:</strong>{" "}
            {new Date(warrantyRequest.requestDate).toLocaleString()}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(warrantyRequest.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong>{" "}
            {new Date(warrantyRequest.updatedAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết phiếu bảo hành
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>ID:</strong> {warranty.id}
          </div>
          <div>
            <strong>Sản phẩm:</strong> {warranty.productIdentity.product.name}
          </div>
          <div>
            <strong>Màu sắc:</strong> {warranty.productIdentity.color.name}
          </div>
          {warranty.productIdentity.product.imageUrl && (
            <div>
              <strong>Hình ảnh:</strong>
              <img
                src={warranty.productIdentity.product.imageUrl}
                alt={warranty.productIdentity.product.name}
                className="w-32 h-32 object-cover mt-2"
              />
            </div>
          )}
          <div>
            <strong>IMEI:</strong> {warranty.productIdentity.imei}
          </div>
          <div>
            <strong>Số lần bảo hành:</strong>{" "}
            {warranty.productIdentity.warrantyCount || 0}
          </div>
          <div>
            <strong>Trạng thái bán:</strong>{" "}
            {warranty.productIdentity.isSold ? "Đã bán" : "Chưa bán"}
          </div>
          <div>
            <strong>Thời hạn bảo hành:</strong>{" "}
            {warranty.productIdentity.warrantyStartDate &&
            warranty.productIdentity.warrantyEndDate
              ? `${new Date(
                  warranty.productIdentity.warrantyStartDate
                ).toLocaleDateString()} - ${new Date(
                  warranty.productIdentity.warrantyEndDate
                ).toLocaleDateString()}`
              : "Không có"}
          </div>
          <div>
            <strong>Người dùng:</strong> {warranty.user.fullName}
          </div>
          <div>
            <strong>Trạng thái:</strong> {warranty.status}
          </div>
          <div>
            <strong>Ngày bắt đầu:</strong>{" "}
            {new Date(warranty.startDate).toLocaleString()}
          </div>
          <div>
            <strong>Ngày kết thúc:</strong>{" "}
            {new Date(warranty.endDate).toLocaleString()}
          </div>
          {warranty.note && (
            <div>
              <strong>Ghi chú:</strong> {warranty.note}
            </div>
          )}
          {warranty.warrantyRequest && (
            <div>
              <strong>Yêu cầu bảo hành:</strong> {warranty.warrantyRequest.id}
            </div>
          )}
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(warranty.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong>{" "}
            {new Date(warranty.updatedAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

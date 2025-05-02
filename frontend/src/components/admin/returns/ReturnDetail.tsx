import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductReturn } from "@/lib/types";

interface ReturnDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnDetail: ProductReturn | null;
}

export function ReturnDetail({
  open,
  onOpenChange,
  returnDetail,
}: ReturnDetailProps) {
  if (!returnDetail) return null;

  const translateReturnStatus = (status: string) => {
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
          <DialogTitle>Chi tiết yêu cầu đổi trả</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong className="text-gray-800">Mã yêu cầu:</strong>{" "}
            {returnDetail.id.substring(0, 8)}...
          </div>
          <div>
            <strong className="text-gray-800">Sản phẩm:</strong>{" "}
            {returnDetail.productIdentity.product.name}
          </div>
          <div>
            <strong className="text-gray-800">IMEI:</strong>{" "}
            {returnDetail.productIdentityId || "Không có"}
          </div>
          <div>
            <strong className="text-gray-800">Màu sắc:</strong>{" "}
            {returnDetail.productIdentity.color?.name || "Không có"}
          </div>
          {returnDetail.productIdentity.product.imageUrl && (
            <div>
              <strong className="text-gray-800">Hình ảnh:</strong>
              <img
                src={returnDetail.productIdentity.product.imageUrl}
                alt={returnDetail.productIdentity.product.name}
                className="w-32 h-32 object-cover mt-2 rounded-md"
              />
            </div>
          )}
          <div>
            <strong className="text-gray-800">Người yêu cầu:</strong>{" "}
            {returnDetail.user.fullName}
          </div>
          <div>
            <strong className="text-gray-800">Lý do:</strong>{" "}
            {returnDetail.reason}
          </div>
          <div>
            <strong className="text-gray-800">Trạng thái:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                returnDetail.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : returnDetail.status === "Approved"
                  ? "bg-blue-100 text-blue-800"
                  : returnDetail.status === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {translateReturnStatus(returnDetail.status)}
            </span>
          </div>
          <div>
            <strong className="text-gray-800">Ngày yêu cầu:</strong>{" "}
            {new Date(returnDetail.returnDate).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="text-gray-800">Ngày tạo:</strong>{" "}
            {new Date(returnDetail.createdAt).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="text-gray-800">Ngày cập nhật:</strong>{" "}
            {new Date(returnDetail.updatedAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

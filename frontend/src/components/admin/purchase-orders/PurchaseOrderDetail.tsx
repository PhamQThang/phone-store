// frontend/components/admin/purchase-orders/PurchaseOrderDetail.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PurchaseOrder } from "@/api/admin/purchaseOrdersApi";

interface PurchaseOrderDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
}

export function PurchaseOrderDetail({
  open,
  onOpenChange,
  purchaseOrder,
}: PurchaseOrderDetailProps) {
  if (!purchaseOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết đơn nhập hàng #{purchaseOrder.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-medium">
              Thông tin chung
            </h3>
            <div className="text-xs sm:text-sm space-y-2 mt-2">
              <p>
                <strong>Nhà cung cấp:</strong>{" "}
                {purchaseOrder.supplier?.name ?? "Không xác định"}
              </p>
              <p>
                <strong>Ngày nhập:</strong>{" "}
                {new Date(purchaseOrder.importDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Tổng chi phí:</strong>{" "}
                {purchaseOrder.totalCost.toLocaleString()} VNĐ
              </p>
              <p>
                <strong>Trạng thái:</strong> {purchaseOrder.status}
              </p>
              <p>
                <strong>Người tạo:</strong>{" "}
                {purchaseOrder.createdBy
                  ? `${purchaseOrder.createdBy.firstName} ${purchaseOrder.createdBy.lastName}`
                  : "Không xác định"}
              </p>
              <p>
                <strong>Ghi chú:</strong>{" "}
                {purchaseOrder.note || "Không có ghi chú"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-medium">
              Chi tiết đơn nhập hàng
            </h3>
            <div className="mt-2">
              {purchaseOrder.purchaseOrderDetails.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500">
                  Không có chi tiết đơn nhập hàng.
                </p>
              ) : (
                <div className="space-y-2">
                  {purchaseOrder.purchaseOrderDetails.map((detail) => (
                    <div
                      key={detail.id}
                      className="border p-3 rounded-md text-xs sm:text-sm"
                    >
                      <p>
                        <strong>Sản phẩm:</strong>{" "}
                        {detail.product?.name ?? "Không xác định"} (
                        {detail.product?.model?.name ?? "Không xác định"} -{" "}
                        {detail.product?.model?.brand?.name ?? "Không xác định"}
                        )
                      </p>
                      <p>
                        <strong>Màu sắc:</strong>{" "}
                        {detail.color?.name ?? "Không xác định"}
                      </p>
                      <p>
                        <strong>IMEI:</strong> {detail.imei ?? "Không xác định"}
                      </p>
                      <p>
                        <strong>Giá nhập:</strong>{" "}
                        {detail.importPrice?.toLocaleString() ?? "0"} VNĐ
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        {detail.productIdentity
                          ? detail.productIdentity.isSold
                            ? "Đã bán"
                            : "Chưa bán"
                          : "Chưa xác định"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

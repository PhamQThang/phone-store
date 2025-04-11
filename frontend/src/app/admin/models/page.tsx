// app/admin/models/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Eye, Plus, Loader2 } from "lucide-react";
import {
  Model,
  getModels,
  createModel,
  updateModel,
  deleteModel,
  getModelById,
} from "@/api/admin/modelsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelForm } from "@/components/admin/models/ModelForm";
import { ModelDetail } from "@/components/admin/models/ModelDetail";
import { clearLocalStorage } from "@/lib/utils";

export default function ModelsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra phân quyền
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);

    if (!userRole || userRole !== "Admin") {
      toast.error("Không có quyền truy cập", {
        description: "Chỉ Admin mới được truy cập trang này.",
        duration: 2000,
      });
      clearLocalStorage();
      router.push("/auth/login");
    } else {
      fetchModels();
    }
  }, [router]);

  // Lấy danh sách model
  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await getModels();
      setModels(data);
    } catch (error: any) {
      toast.error("Lỗi khi lấy danh sách model", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Thêm model
  const handleAddModel = async (data: { name: string; brandId: string }) => {
    try {
      const newModel = await createModel(data);
      setModels([...models, newModel]);
      toast.success("Thêm model thành công");
    } catch (error: any) {
      toast.error("Thêm model thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Sửa model
  const handleEditModel = async (data: { name: string; brandId: string }) => {
    if (!selectedModel) return;
    try {
      const updatedModel = await updateModel(selectedModel.id, data);
      setModels(
        models.map((model) =>
          model.id === updatedModel.id ? updatedModel : model
        )
      );
      toast.success("Cập nhật model thành công");
    } catch (error: any) {
      toast.error("Cập nhật model thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Xóa model
  const handleDeleteModel = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa model này?")) {
      try {
        await deleteModel(id);
        setModels(models.filter((model) => model.id !== id));
        toast.success("Xóa model thành công");
      } catch (error: any) {
        toast.error("Xóa model thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    }
  };

  // Xem chi tiết model
  const handleViewDetail = async (id: string) => {
    try {
      const model = await getModelById(id);
      setSelectedModel(model);
      setIsDetailOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết model", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  if (!role) {
    return (
      <p className="text-center text-gray-500">
        Đang kiểm tra quyền truy cập...
      </p>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-0">
          Quản lý model
        </h2>
        {role === "Admin" && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : models.length === 0 ? (
        <p className="text-center text-gray-500">Không có model nào.</p>
      ) : (
        <>
          {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Tên model
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Slug</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Thương hiệu
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {model.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {model.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {model.slug}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {model.brand.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(model.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(model.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedModel(model);
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteModel(model.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Hiển thị dạng danh sách trên mobile */}
          <div className="block md:hidden space-y-4">
            {models.map((model) => (
              <Card key={model.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {model.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>ID:</strong> {model.id}
                  </p>
                  <p>
                    <strong>Slug:</strong> {model.slug}
                  </p>
                  <p>
                    <strong>Thương hiệu:</strong> {model.brand.name}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(model.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    {role === "Admin" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedModel(model);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteModel(model.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modal Thêm model */}
      {role === "Admin" && (
        <ModelForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddModel}
        />
      )}

      {/* Modal Sửa model */}
      {role === "Admin" && (
        <ModelForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditModel}
          initialData={selectedModel || undefined}
        />
      )}

      {/* Modal Xem chi tiết model */}
      <ModelDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        model={selectedModel}
      />
    </div>
  );
}

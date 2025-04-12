// components/admin/products/ProductForm.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getModels, Model } from "@/api/admin/modelsApi";
import { ProductFile } from "@/api/admin/productsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    price: number;
    storage: number;
    ram: number;
    screenSize: number;
    battery: number;
    chip: string;
    operatingSystem: string;
    modelId: string;
    files: FileList | null;
    filesToDelete?: string[];
  }) => Promise<void>;
  initialData?: Partial<{
    id: string;
    name: string;
    price: number;
    storage: number;
    ram: number;
    screenSize: number;
    battery: number;
    chip: string;
    operatingSystem: string;
    modelId: string;
    productFiles: ProductFile[];
  }>;
}

export function ProductForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [storage, setStorage] = useState("");
  const [ram, setRam] = useState("");
  const [screenSize, setScreenSize] = useState("");
  const [battery, setBattery] = useState("");
  const [chip, setChip] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");
  const [modelId, setModelId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentFiles, setCurrentFiles] = useState<ProductFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);

  // Cập nhật state khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPrice(initialData.price ? initialData.price.toString() : "");
      setStorage(initialData.storage ? initialData.storage.toString() : "");
      setRam(initialData.ram ? initialData.ram.toString() : "");
      setScreenSize(
        initialData.screenSize ? initialData.screenSize.toString() : ""
      );
      setBattery(initialData.battery ? initialData.battery.toString() : "");
      setChip(initialData.chip || "");
      setOperatingSystem(initialData.operatingSystem || "");
      setModelId(initialData.modelId || "");
      setCurrentFiles(initialData.productFiles || []);
      setFilesToDelete([]);
    } else {
      setName("");
      setPrice("");
      setStorage("");
      setRam("");
      setScreenSize("");
      setBattery("");
      setChip("");
      setOperatingSystem("");
      setModelId("");
      setFiles([]);
      setPreviews([]);
      setCurrentFiles([]);
      setFilesToDelete([]);
    }
  }, [initialData]);

  // Lấy danh sách model để hiển thị trong dropdown
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getModels();
        setModels(data);
      } catch (error: any) {
        toast.error("Lỗi khi lấy danh sách model", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    };
    fetchModels();
  }, []);

  // Xử lý khi người dùng chọn file mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  // Xử lý xóa file mới đã chọn
  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index);
      URL.revokeObjectURL(prevPreviews[index]);
      return newPreviews;
    });
  };

  // Xử lý xóa file hiện tại (chỉ cập nhật giao diện, chưa xóa thật)
  const handleRemoveCurrentFile = (fileId: string) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setCurrentFiles((prev) => prev.filter((file) => file.fileId !== fileId));
  };

  // Chuyển danh sách file thành FileList để gửi lên server
  const createFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  // Giải phóng các URL preview khi component unmount hoặc form đóng
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedPrice = parseFloat(price);
      const parsedStorage = parseInt(storage);
      const parsedRam = parseInt(ram);
      const parsedScreenSize = parseFloat(screenSize);
      const parsedBattery = parseInt(battery);

      const data: {
        name?: string;
        price?: number;
        storage?: number;
        ram?: number;
        screenSize?: number;
        battery?: number;
        chip?: string;
        operatingSystem?: string;
        modelId?: string;
        files: FileList | null;
        filesToDelete?: string[];
      } = {
        files: files.length > 0 ? createFileList(files) : null,
      };

      // Chỉ gửi các trường nếu giá trị thay đổi so với initialData
      if (initialData) {
        if (name && name !== initialData.name) {
          data.name = name;
        }
        if (!isNaN(parsedPrice) && parsedPrice !== initialData.price) {
          data.price = parsedPrice;
        }
        if (!isNaN(parsedStorage) && parsedStorage !== initialData.storage) {
          data.storage = parsedStorage;
        }
        if (!isNaN(parsedRam) && parsedRam !== initialData.ram) {
          data.ram = parsedRam;
        }
        if (
          !isNaN(parsedScreenSize) &&
          parsedScreenSize !== initialData.screenSize
        ) {
          data.screenSize = parsedScreenSize;
        }
        if (!isNaN(parsedBattery) && parsedBattery !== initialData.battery) {
          data.battery = parsedBattery;
        }
        if (chip && chip !== initialData.chip) {
          data.chip = chip;
        }
        if (
          operatingSystem &&
          operatingSystem !== initialData.operatingSystem
        ) {
          data.operatingSystem = operatingSystem;
        }
        if (modelId && modelId !== initialData.modelId) {
          data.modelId = modelId;
        }
        data.filesToDelete = filesToDelete;
      } else {
        // Trường hợp thêm mới, gửi tất cả các trường
        data.name = name;
        data.price = parsedPrice;
        data.storage = parsedStorage;
        data.ram = parsedRam;
        data.screenSize = parsedScreenSize;
        data.battery = parsedBattery;
        data.chip = chip;
        data.operatingSystem = operatingSystem;
        data.modelId = modelId;
      }

      // Kiểm tra nếu không có thay đổi và không có file mới
      if (
        initialData &&
        Object.keys(data).length === 2 &&
        data.files === null &&
        (!data.filesToDelete || data.filesToDelete.length === 0)
      ) {
        toast.info("Không có thay đổi để cập nhật");
        setLoading(false);
        return;
      }

      await onSubmit(data as any);
      onOpenChange(false);
      // Reset form sau khi submit thành công
      setName("");
      setPrice("");
      setStorage("");
      setRam("");
      setScreenSize("");
      setBattery("");
      setChip("");
      setOperatingSystem("");
      setModelId("");
      setFiles([]);
      setPreviews([]);
      setCurrentFiles([]);
      setFilesToDelete([]);
    } catch (error: any) {
      toast.error("Lỗi khi lưu sản phẩm", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên sản phẩm</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="price">Giá sản phẩm</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required={!initialData}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="storage">Dung lượng lưu trữ (GB)</Label>
            <Input
              id="storage"
              type="number"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              required={!initialData}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ram">Dung lượng RAM (GB)</Label>
            <Input
              id="ram"
              type="number"
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              required={!initialData}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="screenSize">Kích thước màn hình (inch)</Label>
            <Input
              id="screenSize"
              type="number"
              step="0.1"
              value={screenSize}
              onChange={(e) => setScreenSize(e.target.value)}
              required={!initialData}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="battery">Dung lượng pin (mAh)</Label>
            <Input
              id="battery"
              type="number"
              value={battery}
              onChange={(e) => setBattery(e.target.value)}
              required={!initialData}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="chip">Chip</Label>
            <Input
              id="chip"
              value={chip}
              onChange={(e) => setChip(e.target.value)}
              required={!initialData}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="operatingSystem">Hệ điều hành</Label>
            <Input
              id="operatingSystem"
              value={operatingSystem}
              onChange={(e) => setOperatingSystem(e.target.value)}
              required={!initialData}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="modelId">Model</Label>
            <Select value={modelId} onValueChange={setModelId} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} ({model.brand.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hiển thị danh sách ảnh hiện tại */}
          {currentFiles.length > 0 && (
            <div>
              <Label>Ảnh hiện tại</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {currentFiles.map((productFile) => (
                  <div key={productFile.fileId} className="relative">
                    <div className="relative w-full h-24">
                      <Image
                        src={productFile.file.url}
                        alt="Product image"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    {productFile.isMain && (
                      <p className="text-xs text-green-600 mt-1">Ảnh chính</p>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() =>
                        handleRemoveCurrentFile(productFile.fileId)
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input để chọn nhiều ảnh mới */}
          <div>
            <Label htmlFor="files">Ảnh sản phẩm</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1"
            />
          </div>

          {/* Hiển thị danh sách file mới đã chọn với preview */}
          {files.length > 0 && (
            <div>
              <Label>Ảnh mới đã chọn</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {files.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="relative w-full h-24">
                      <Image
                        src={previews[index]}
                        alt={file.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <p className="text-xs truncate mt-1">{file.name}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Thêm"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

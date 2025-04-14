// frontend/api/admin/slidesApi.ts
import { Slide } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface SlideResponse {
  message: string;
  data: Slide;
}

interface SlidesResponse {
  message: string;
  data: Slide[];
}

interface DeleteResponse {
  message: string;
}

// Lấy danh sách tất cả Slide
export const getSlides = async (): Promise<Slide[]> => {
  const response: SlidesResponse = await axiosInstance.get("/slides");
  return response.data;
};

// Lấy thông tin chi tiết một Slide theo ID
export const getSlideById = async (id: string): Promise<Slide> => {
  const response: SlideResponse = await axiosInstance.get(`/slides/${id}`);
  return response.data;
};

// Tạo một Slide mới
export const createSlide = async (data: FormData): Promise<Slide> => {
  const response: SlideResponse = await axiosInstance.post("/slides", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Cập nhật thông tin một Slide
export const updateSlide = async (
  id: string,
  data: FormData
): Promise<Slide> => {
  const response: SlideResponse = await axiosInstance.patch(
    `/slides/${id}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Xóa một Slide
export const deleteSlide = async (id: string): Promise<DeleteResponse> => {
  const response: DeleteResponse = await axiosInstance.delete(`/slides/${id}`);
  return response;
};

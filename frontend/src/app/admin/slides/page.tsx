import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Slide } from "@/lib/types";
import {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  getSlideById,
} from "@/api/admin/slidesApi";
import ClientSlides from "@/components/admin/slides/ClientSlides";

// Hàm lấy giá trị cookie
async function getCookieValue(key: string): Promise<string | null> {
  return cookies().get(key)?.value || null;
}

// Server-side function để lấy thông tin role và token
async function getAuthInfo() {
  const role = await getCookieValue("role");
  const token = await getCookieValue("accessToken");
  if (!token) {
    redirect("/auth/login");
  }
  if (!role || role !== "Admin") {
    const { clearCookies } = await import("@/lib/cookieUtils");
    await clearCookies();
    redirect("/auth/login");
  }
  return { role, token };
}

// Server-side function để lấy danh sách slides
async function fetchSlides(token: string): Promise<Slide[]> {
  try {
    return await getSlides(token);
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    console.error("Lỗi khi lấy danh sách slide:", error.message);
    return [];
  }
}

// Server Action để thêm slide
async function addSlideAction(formData: FormData) {
  "use server";
  const title = formData.get("title")?.toString();
  const link = formData.get("link")?.toString();
  const isActive = formData.get("isActive")?.toString() === "true";
  const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;
  const file = formData.get("file") as File;

  if (!file) {
    return { error: "File ảnh là bắt buộc khi tạo mới slide" };
  }

  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const newSlide = await createSlide(formData, token);
    revalidatePath("/admin/slides");
    return {
      success: true,
      message: "Thêm slide thành công",
      slide: newSlide,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Thêm slide thất bại",
    };
  }
}

// Server Action để sửa slide
async function editSlideAction(id: string, formData: FormData) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const updatedSlide = await updateSlide(id, formData, token);
    revalidatePath("/admin/slides");
    return {
      success: true,
      message: "Cập nhật slide thành công",
      slide: updatedSlide,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Cập nhật slide thất bại",
    };
  }
}

// Server Action để xóa slide
async function deleteSlideAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    await deleteSlide(id, token);
    revalidatePath("/admin/slides");
    return { success: true, message: "Xóa slide thành công" };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Xóa slide thất bại",
    };
  }
}

// Server Action để lấy chi tiết slide
async function getSlideDetailAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const slide = await getSlideById(id, token);
    return { success: true, slide };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return { error: error.message || "Lỗi khi lấy chi tiết slide" };
  }
}

export default async function SlidesPage() {
  // Lấy role và token trên server
  const { role, token } = await getAuthInfo();

  // Lấy dữ liệu slides trên server
  const slides = await fetchSlides(token);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientSlides
        slides={slides}
        role={role}
        token={token}
        addSlideAction={addSlideAction}
        editSlideAction={editSlideAction}
        deleteSlideAction={deleteSlideAction}
        getSlideDetailAction={getSlideDetailAction}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCookieValue } from "@/lib/cookieUtils";
import { Product, Model } from "@/lib/types";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "@/api/admin/productsApi";
import { getModels } from "@/api/admin/modelsApi";
import ClientModals from "@/components/admin/products/ClientModals";

// Server-side function để lấy thông tin role và token
async function getAuthInfo() {
  const role = await getCookieValue("role");
  const token = await getCookieValue("accessToken");
  if (!token) {
    // Nếu không có token, chuyển hướng đến trang đăng nhập
    redirect("/auth/login");
  }
  return { role, token };
}

// Server-side function để lấy danh sách sản phẩm
async function fetchProducts(token: string): Promise<Product[]> {
  try {
    return await getProducts(undefined, undefined, token);
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    console.error("Lỗi khi lấy danh sách sản phẩm:", error.message);
    return [];
  }
}

// Server-side function để lấy danh sách models
async function fetchModels(token: string): Promise<Model[]> {
  try {
    return await getModels(token);
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    console.error("Lỗi khi lấy danh sách model:", error.message);
    return [];
  }
}

// Server Action để thêm sản phẩm
async function addProductAction(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString();
  const price = parseFloat(formData.get("price")?.toString() || "0");
  const storage = parseInt(formData.get("storage")?.toString() || "0");
  const ram = parseInt(formData.get("ram")?.toString() || "0");
  const screenSize = parseFloat(formData.get("screenSize")?.toString() || "0");
  const battery = parseInt(formData.get("battery")?.toString() || "0");
  const chip = formData.get("chip")?.toString();
  const operatingSystem = formData.get("operatingSystem")?.toString();
  const modelId = formData.get("modelId")?.toString();
  const files = formData.getAll("files") as unknown as FileList;

  // Validation cơ bản
  if (!name || name.length < 2) {
    return { error: "Tên sản phẩm phải có ít nhất 2 ký tự" };
  }
  if (isNaN(price) || price <= 0) {
    return { error: "Giá sản phẩm phải là số dương" };
  }
  if (isNaN(storage) || storage <= 0) {
    return { error: "Dung lượng lưu trữ phải là số dương" };
  }
  if (isNaN(ram) || ram <= 0) {
    return { error: "Dung lượng RAM phải là số dương" };
  }
  if (isNaN(screenSize) || screenSize <= 0) {
    return { error: "Kích thước màn hình phải là số dương" };
  }
  if (isNaN(battery) || battery <= 0) {
    return { error: "Dung lượng pin phải là số dương" };
  }
  if (!chip || chip.length < 2) {
    return { error: "Tên chip phải có ít nhất 2 ký tự" };
  }
  if (!operatingSystem || operatingSystem.length < 2) {
    return { error: "Hệ điều hành phải có ít nhất 2 ký tự" };
  }
  if (!modelId) {
    return { error: "Vui lòng chọn model" };
  }

  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const newProduct = await createProduct(
      {
        name,
        price,
        storage,
        ram,
        screenSize,
        battery,
        chip,
        operatingSystem,
        modelId,
        files,
      },
      token
    );
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Thêm sản phẩm thành công",
      product: newProduct,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Thêm sản phẩm thất bại",
    };
  }
}

// Server Action để sửa sản phẩm
async function editProductAction(id: string, formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString();
  const price = parseFloat(formData.get("price")?.toString() || "0");
  const storage = parseInt(formData.get("storage")?.toString() || "0");
  const ram = parseInt(formData.get("ram")?.toString() || "0");
  const screenSize = parseFloat(formData.get("screenSize")?.toString() || "0");
  const battery = parseInt(formData.get("battery")?.toString() || "0");
  const chip = formData.get("chip")?.toString();
  const operatingSystem = formData.get("operatingSystem")?.toString();
  const modelId = formData.get("modelId")?.toString();
  const files = formData.getAll("files") as unknown as FileList;
  const filesToDelete = formData.getAll("filesToDelete[]") as string[];

  // Validation cơ bản cho các trường nếu có thay đổi
  if (name && name.length < 2) {
    return { error: "Tên sản phẩm phải có ít nhất 2 ký tự" };
  }
  if (price && (isNaN(price) || price <= 0)) {
    return { error: "Giá sản phẩm phải là số dương" };
  }
  if (storage && (isNaN(storage) || storage <= 0)) {
    return { error: "Dung lượng lưu trữ phải là số dương" };
  }
  if (ram && (isNaN(ram) || ram <= 0)) {
    return { error: "Dung lượng RAM phải là số dương" };
  }
  if (screenSize && (isNaN(screenSize) || screenSize <= 0)) {
    return { error: "Kích thước màn hình phải là số dương" };
  }
  if (battery && (isNaN(battery) || battery <= 0)) {
    return { error: "Dung lượng pin phải là số dương" };
  }
  if (chip && chip.length < 2) {
    return { error: "Tên chip phải có ít nhất 2 ký tự" };
  }
  if (operatingSystem && operatingSystem.length < 2) {
    return { error: "Hệ điều hành phải có ít nhất 2 ký tự" };
  }

  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const updatedProduct = await updateProduct(
      id,
      {
        ...(name && { name }),
        ...(price && !isNaN(price) && { price }),
        ...(storage && !isNaN(storage) && { storage }),
        ...(ram && !isNaN(ram) && { ram }),
        ...(screenSize && !isNaN(screenSize) && { screenSize }),
        ...(battery && !isNaN(battery) && { battery }),
        ...(chip && { chip }),
        ...(operatingSystem && { operatingSystem }),
        ...(modelId && { modelId }),
        files: files.length > 0 ? files : undefined,
        filesToDelete: filesToDelete.length > 0 ? filesToDelete : undefined,
      },
      token
    );
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Cập nhật sản phẩm thành công",
      product: updatedProduct,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Cập nhật sản phẩm thất bại",
    };
  }
}

// Server Action để xóa sản phẩm
async function deleteProductAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    await deleteProduct(id, token);
    revalidatePath("/admin/products");
    return { success: true, message: "Xóa sản phẩm thành công" };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Xóa sản phẩm thất bại",
    };
  }
}

// Server Action để lấy chi tiết sản phẩm
async function getProductDetailAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const product = await getProductById(id, token);
    return { success: true, product };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return { error: error.message || "Lỗi khi lấy chi tiết sản phẩm" };
  }
}

export default async function ProductsPage() {
  // Lấy role và token trên server
  const { role, token } = await getAuthInfo();

  // Lấy dữ liệu sản phẩm trên server
  const products = await fetchProducts(token);

  // Lấy danh sách models trên server
  const models = await fetchModels(token);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientModals
        products={products}
        models={models}
        role={role || ""}
        addProductAction={addProductAction}
        editProductAction={editProductAction}
        deleteProductAction={deleteProductAction}
        getProductDetailAction={getProductDetailAction}
      />
    </div>
  );
}

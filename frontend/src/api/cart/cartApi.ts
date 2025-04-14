// frontend/api/cart/cartApi.ts
import axiosInstance from "../axiosConfig";

interface File {
  id: string;
  url: string;
  public_id: string;
  file_type: string;
  size?: number;
  uploaded_at: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductFile {
  productId: string;
  fileId: string;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
  file: File;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  storage: number;
  ram: number;
  screenSize: number;
  battery: number;
  chip: string;
  operatingSystem: string;
  modelId: string;
  createdAt: string;
  updatedAt: string;
  productFiles: ProductFile[];
}

interface Color {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  colorId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
  color: Color;
}

interface CartResponse {
  message: string;
  data: CartItem[];
}

interface CartItemResponse {
  message: string;
  data: CartItem;
}

interface DeleteResponse {
  message: string;
}

interface CreateCartItemData {
  productId: string;
  colorId: string;
  quantity: number;
}

interface UpdateCartItemData {
  quantity?: number;
}

// Lấy danh sách sản phẩm trong giỏ hàng
export const getCartItems = async (cartId: string): Promise<CartItem[]> => {
  const response: CartResponse = await axiosInstance.get(
    `/cart?cartId=${cartId}`
  );
  return response.data;
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (
  cartId: string,
  data: CreateCartItemData
): Promise<CartItem> => {
  const response: CartItemResponse = await axiosInstance.post(
    `/cart?cartId=${cartId}`,
    data
  );
  return response.data;
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (
  cartId: string,
  cartItemId: string,
  data: UpdateCartItemData
): Promise<CartItem> => {
  const response: CartItemResponse = await axiosInstance.patch(
    `/cart/${cartItemId}?cartId=${cartId}`,
    data
  );
  return response.data;
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (
  cartId: string,
  cartItemId: string
): Promise<DeleteResponse> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/cart/${cartItemId}?cartId=${cartId}`
  );
  return response;
};

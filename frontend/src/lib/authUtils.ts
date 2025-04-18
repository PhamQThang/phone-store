export const setAuthData = (data: {
  accessToken: string;
  id: number;
  email: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  role: string;
  cartId?: string;
}) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("userId", data.id.toString());
    localStorage.setItem("userEmail", data.email);
    localStorage.setItem("fullName", data.fullName);
    localStorage.setItem("address", data.address);
    localStorage.setItem("phoneNumber", data.phoneNumber);
    localStorage.setItem("userRole", data.role);
    if (data.cartId) {
      localStorage.setItem("cartId", data.cartId);
    }
  }
};

export const getAuthData = () => {
  if (typeof window !== "undefined") {
    return {
      token: localStorage.getItem("accessToken"),
      id: localStorage.getItem("userId"),
      email: localStorage.getItem("userEmail"),
      fullName: localStorage.getItem("fullName"),
      address: localStorage.getItem("address"),
      phoneNumber: localStorage.getItem("phoneNumber"),
      role: localStorage.getItem("userRole"),
      cartId: localStorage.getItem("cartId"),
    };
  }
  return null;
};

export const clearAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("fullName");
    localStorage.removeItem("address");
    localStorage.removeItem("phoneNumber");
    localStorage.removeItem("userRole");
    localStorage.removeItem("cartId");
  }
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clearLocalStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("role");
  localStorage.removeItem("fullName");
  localStorage.removeItem("address");
  localStorage.removeItem("phoneNumber");
  localStorage.removeItem("cartId");
};

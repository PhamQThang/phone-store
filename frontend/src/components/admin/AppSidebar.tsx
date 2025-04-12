// components/ui/admin/AppSidebar.tsx
import { Ban, Package, Users, ShoppingCart } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Package,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý thương hiệu",
    url: "/admin/brands",
    icon: Ban,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý Model",
    url: "/admin/models",
    icon: Package,
    allowedRoles: ["Admin"],
  },
  {
    title: "Quản lý sản phẩm",
    url: "/admin/products",
    icon: Package,
    allowedRoles: ["Admin"],
  },
  {
    title: "Quản lý nhà cung cấp",
    url: "/admin/suppliers",
    icon: Users,
    allowedRoles: ["Admin"],
  },
  {
    title: "Quản lý đơn nhập hàng",
    url: "/admin/purchase-orders",
    icon: ShoppingCart,
    allowedRoles: ["Admin"],
  },
  {
    title: "Quản lý người dùng",
    url: "/admin/users",
    icon: Users,
    allowedRoles: ["Admin"],
  },
];

interface AppSidebarProps {
  role: string | null;
}

export function AppSidebar({ role }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản trị hệ thống</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.allowedRoles.includes(role || "") ? (
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild disabled>
                      <span className="text-gray-500 cursor-not-allowed">
                        <item.icon />
                        <span>{item.title} (Không có quyền)</span>
                      </span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

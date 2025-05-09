import {
  BarChart,
  Tag,
  Box,
  Palette,
  Truck,
  Smartphone,
  ShoppingBag,
  ShoppingCart,
  Shield,
  ArrowLeftRight,
  Percent,
  Image,
  Users,
} from "lucide-react";
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
    title: "Thống kê doanh thu",
    url: "/admin/dashboard",
    icon: BarChart,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Thống kê số lượng sản phẩm",
    url: "/admin/product-identities",
    icon: BarChart,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý thương hiệu",
    url: "/admin/brands",
    icon: Tag,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý Model",
    url: "/admin/models",
    icon: Box,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý màu",
    url: "/admin/colors",
    icon: Palette,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý nhà cung cấp",
    url: "/admin/suppliers",
    icon: Truck,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý thông tin sản phẩm",
    url: "/admin/products",
    icon: Smartphone,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý đơn nhập hàng",
    url: "/admin/purchase-orders",
    icon: ShoppingBag,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý đơn bán hàng",
    url: "/admin/orders",
    icon: ShoppingCart,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý bảo hành",
    url: "/admin/warranties",
    icon: Shield,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý đổi trả",
    url: "/admin/returns",
    icon: ArrowLeftRight,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý khuyến mãi",
    url: "/admin/promotions",
    icon: Percent,
    allowedRoles: ["Admin", "Employee"],
  },
  {
    title: "Quản lý slide",
    url: "/admin/slides",
    icon: Image,
    allowedRoles: ["Admin", "Employee"],
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

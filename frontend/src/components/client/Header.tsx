"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  ShoppingCart,
  User,
  ChevronDown,
  Search,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import Image from "next/image";
import { getCartItems } from "@/api/cart/cartApi";
import { getBrands } from "@/api/admin/brandsApi";

interface Category {
  name: string;
  href: string;
  products: { name: string; slug: string }[];
}

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsData = await getBrands();
        const dynamicCategories = brandsData
          .filter((brand) => brand.models.length > 0)
          .map((brand) => ({
            name: brand.name,
            href: `/client/products?brand=${brand.slug}`,
            products: brand.models.map((model) => ({
              name: model.name,
              slug: model.slug,
            })),
          }));
        setCategories(dynamicCategories);
      } catch (error: any) {
        toast.error("Lỗi", {
          description: error.message || "Lấy danh sách thương hiệu thất bại",
          duration: 2000,
        });
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fullName = localStorage.getItem("fullName");
    const token = localStorage.getItem("accessToken");
    if (fullName && token) {
      setIsLoggedIn(true);
      setFullName(fullName);
    } else {
      setIsLoggedIn(false);
      setFullName(null);
    }

    const fetchCartCount = async () => {
      const cartId = localStorage.getItem("cartId");
      if (!cartId) {
        setCartCount(0);
        return;
      }

      try {
        const cartItems = await getCartItems(cartId);
        const totalItems = cartItems.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );
        setCartCount(totalItems);
      } catch (error: any) {
        console.error("Không thể lấy giỏ hàng:", error);
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setFullName(null);
    setCartCount(0);
    toast.success("Đăng xuất thành công!");
    router.push("/client");
  };

  const handleCartClick = () => {
    router.push("/client/cart");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/client/search?q=${encodeURIComponent(searchTerm)}`);
    } else {
      toast.error("Vui lòng nhập từ khóa tìm kiếm!");
    }
  };

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsProductsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsProductsOpen(false);
    }, 200);
    setHoverTimeout(timeout);
  };

  const navItems = [
    { name: "Trang chủ", href: "/client" },
    { name: "Sản phẩm", href: "/client/products", hasDropdown: true },
    { name: "Tin tức", href: "/client/newsPage" },
    { name: "Đơn hàng", href: "/client/orders" },
    { name: "Giỏ hàng", href: "/client/cart" },
  ];

  return (
    <div className="flex flex-col sticky top-0 z-50 bg-white shadow-sm">
      <div className="container w-full mx-auto p-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/client">
            <Image
              src="/images/logo.png"
              alt="PhoneStore"
              width={60}
              height={60}
            />
          </Link>

          <div className="hidden md:flex relative w-full max-w-lg mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 text-sm rounded-full border-gray-200 focus:border-red-400 focus:ring-red-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Search className="h-6 w-6 text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="bg-white p-4">
                <VisuallyHidden>
                  <SheetTitle>Tìm kiếm sản phẩm</SheetTitle>
                </VisuallyHidden>
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <div className="relative w-full max-w-[280px] mx-auto">
                    <Input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="pl-10 pr-4 py-2 text-sm rounded-full border-gray-200 focus:border-red-400 focus:ring-red-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            <Popover open={isAccountOpen} onOpenChange={setIsAccountOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onMouseEnter={() => setIsAccountOpen(true)}
                >
                  <User className="h-6 w-6 text-gray-600" />
                  <span className="hidden md:inline text-gray-700 font-medium">
                    {isLoggedIn ? fullName : "Tài khoản"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isAccountOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-48 p-2 bg-white shadow-lg rounded-lg border border-gray-100"
                onMouseEnter={() => setIsAccountOpen(true)}
                onMouseLeave={() => setIsAccountOpen(false)}
              >
                {isLoggedIn ? (
                  <div className="flex flex-col gap-1">
                    <Link href="/client/profile">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-gray-700 hover:bg-red-50"
                      >
                        Thông tin cá nhân
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm text-gray-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-gray-700 hover:bg-red-50"
                      >
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-gray-700 hover:bg-red-50"
                      >
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCartClick}
              className="relative"
            >
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6 text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white p-5">
                <VisuallyHidden>
                  <SheetTitle>Menu điều hướng</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col gap-3 max-h-[calc(100vh-2rem)] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl text-gray-800">
                      Menu
                    </span>
                  </div>
                  {navItems.map((item) =>
                    item.hasDropdown ? (
                      <div key={item.name} className="relative">
                        <span className="block py-2 px-4 text-white font-bold text-lg">
                          {item.name}
                        </span>
                        {categories.map((category) => (
                          <div key={category.name} className="pl-2">
                            <div className="flex items-center justify-between">
                              <Link
                                href={category.href}
                                className="block py-2 px-4 text-white font-semibold text-base hover:bg-red-50 hover:text-red-600 rounded-lg flex-1 transition-colors duration-200"
                              >
                                {category.name}
                              </Link>
                              <Button
                                onClick={() => toggleCategory(category.name)}
                                className="p-2 bg-red-50 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              >
                                <ChevronRight
                                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                                    openCategory === category.name
                                      ? "rotate-90"
                                      : ""
                                  }`}
                                />
                              </Button>
                            </div>
                            {openCategory === category.name && (
                              <div className="pl-6 mt-1">
                                {category.products.map((product) => (
                                  <Link
                                    key={product.name}
                                    href={`${category.href}&model=${product.slug}`}
                                    className="block py-1.5 px-4 text-white text-sm hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
                                  >
                                    {product.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block py-2 px-4 text-gray-700 font-medium text-base hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="hidden md:flex bg-red-500 items-center justify-center text-base font-semibold relative gap-5">
        {navItems.map((item) =>
          item.hasDropdown ? (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="cursor-pointer text-xl font-bold text-white transition-colors duration-200 flex items-center px-3 py-1 hover:bg-red-400 rounded-lg">
                {item.name}
              </span>
              {isProductsOpen && (
                <div className="absolute left-1/2 transform -translate-x-[35%] mx-auto top-full mt-3 w-[700px] bg-white shadow-xl rounded-lg p-6 z-50 border border-gray-100">
                  <div className="grid sm:grid-cols-3 gap-6">
                    {categories.map((category) => (
                      <div key={category.name} className="flex flex-col gap-2">
                        <Link
                          href={category.href}
                          className="font-bold text-lg text-red-400 hover:text-red-600 border-b border-gray-200 pb-2 mb-2 transition-colors duration-200"
                        >
                          {category.name}
                        </Link>
                        {category.products.map((product) => (
                          <Link
                            key={product.name}
                            href={`${category.href}&model=${product.slug}`}
                            className="text-gray-600 text-sm hover:text-red-600 hover:bg-red-50 rounded-md px-2 py-1 transition-colors duration-200"
                          >
                            {product.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className="text-white font-bold text-xl transition-colors duration-200 px-3 py-1 my-2 hover:bg-red-400 rounded-lg active:rounded-lg"
            >
              {item.name}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
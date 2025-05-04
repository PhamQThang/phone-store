"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, User, ChevronDown, Search } from "lucide-react";
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
// import { getCartItems } from "@/api/cart/cartApi";
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
  // const [cartCount, setCartCount] = useState(0);
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

    // const fetchCartCount = async () => {
    //   const cartId = localStorage.getItem("cartId");
    //   if (!cartId) {
    //     setCartCount(0);
    //     return;
    //   }

    //   try {
    //     const cartItems = await getCartItems(cartId);
    //     const totalItems = cartItems.reduce(
    //       (sum: number, item: { quantity: number }) => sum + item.quantity,
    //       0
    //     );
    //     setCartCount(totalItems);
    //   } catch (error: any) {
    //     console.error("Không thể lấy giỏ hàng:", error);
    //     setCartCount(0);
    //   }
    // };

    // fetchCartCount();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setFullName(null);
    // setCartCount(0);
    toast.success("Đăng xuất thành công!");
    router.push("/client");
  };

  // const handleCartClick = () => {
  //   router.push("/client/cart");
  // };

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
    { name: "Giỏ hàng", href: "/client/cart" },
    { name: "Đơn hàng", href: "/client/orders" },
    { name: "Bảo hành", href: "/client/warranties" },
    { name: "Đổi trả", href: "/client/returns" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/client">
            <Image
              src="/images/logo.png"
              alt="PhoneStore"
              width={60}
              height={60}
              className="h-12 w-auto"
            />
          </Link>

          <div className="hidden md:flex w-full max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10 pr-4 py-2 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-gray-100 rounded-full"
                >
                  <Search className="h-5 w-5 text-gray-600" />
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
                  <div className="relative w-full max-w-md mx-auto">
                    <Input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="pl-10 pr-4 py-2 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            <Popover open={isAccountOpen} onOpenChange={setIsAccountOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-2 py-1"
                  onMouseEnter={() => setIsAccountOpen(true)}
                >
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="hidden lg:inline text-gray-700 font-medium text-sm">
                    {isLoggedIn ? fullName : "Tài khoản"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-600 transition-transform ${
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
                        className="w-full justify-start text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                      >
                        Thông tin cá nhân
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
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
                        className="w-full justify-start text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                      >
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                      >
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* <Button
              variant="ghost"
              size="icon"
              onClick={handleCartClick}
              className="relative hover:bg-gray-100 rounded-full"
            >
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button> */}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-gray-100 rounded-full"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
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
                        <button
                          onClick={() => toggleCategory("Sản phẩm")}
                          className="block py-2 px-4 text-gray-800 font-semibold text-base w-full text-left hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          {item.name}
                        </button>
                        {openCategory === "Sản phẩm" && (
                          <div className="pl-4 mt-1">
                            {categories.map((category) => (
                              <div key={category.name} className="mt-2">
                                <Link
                                  href={category.href}
                                  className="block py-2 px-4 text-gray-700 font-medium text-sm hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                >
                                  {category.name}
                                </Link>
                                <div className="pl-4 mt-1">
                                  {category.products.map((product) => (
                                    <Link
                                      key={product.name}
                                      href={`${category.href}&model=${product.slug}`}
                                      className="block py-1.5 px-4 text-gray-600 text-sm hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                    >
                                      {product.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block py-2 px-4 text-gray-700 font-medium text-base hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
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

      <nav className="hidden md:flex bg-red-600 py-1 px-4 justify-center">
        <div className="flex gap-8">
          {navItems.map((item) =>
            item.hasDropdown ? (
              <div
                key={item.name}
                className="relative top-2"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span className="cursor-pointer text-white font-semibold text-lg px-3 py-2 hover:bg-red-700 rounded-md transition-colors">
                  {item.name}
                </span>
                {isProductsOpen && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-[800px] bg-white shadow-xl rounded-lg p-6 border border-gray-100 z-50">
                    <div className="grid grid-cols-3 gap-6">
                      {categories.map((category) => (
                        <div
                          key={category.name}
                          className="flex flex-col gap-2"
                        >
                          <Link
                            href={category.href}
                            className="font-semibold text-base text-blue-600 hover:text-blue-700 border-b border-gray-200 pb-2 transition-colors"
                          >
                            {category.name}
                          </Link>
                          {category.products.map((product) => (
                            <Link
                              key={product.name}
                              href={`${category.href}&model=${product.slug}`}
                              className="text-gray-600 text-sm hover:text-blue-600 hover:bg-blue-50 rounded-md px-2 py-1 transition-colors"
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
                className="text-white font-semibold text-lg px-3 py-2 hover:bg-red-700 rounded-md transition-colors"
              >
                {item.name}
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
}

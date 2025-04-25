// components/client/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Facebook, Youtube, MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 py-12 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo và social media */}
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/images/logo.png"
                alt="FixiMobile"
                width={80}
                height={80}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <h3 className="text-lg font-bold mb-3 text-gray-900">
              Kết nối với chúng tôi
            </h3>
            <p className="text-sm mb-4">
              Cửa hàng điện thoại uy tín hàng đầu Việt Nam
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                aria-label="Youtube"
              >
                <Youtube className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  Giới thiệu về cửa hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  Tuyển dụng mới nhất
                </Link>
              </li>
              <li>
                <Link
                  href="tel:0826339922"
                  className="hover:text-red-500 transition-colors duration-200 flex items-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Tư vấn miễn phí:{" "}
                  <span className="font-medium ml-1">082 633 9922</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  Đánh giá chất lượng, khiếu nại
                </Link>
              </li>
            </ul>
          </div>

          {/* Chính sách */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Chính sách của chúng tôi
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/trade-in"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  Thu cũ - Đổi mới
                </Link>
              </li>
              <li>
                <Link
                  href="/installment"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  Chính sách trả góp
                </Link>
              </li>
              <li>
                <Link
                  href="/purchase-policy"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  Chính sách mua hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/warranty"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  Chính sách bảo hành
                </Link>
              </li>
            </ul>
          </div>

          {/* Địa chỉ */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Địa chỉ và liên hệ
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://maps.app.goo.gl/q8qProJ9c5d9EvJP9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    CS 1: 54 Ngõ 66B Triều Khúc, Tân Triều, Thanh Trì, Hà Nội
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="https://maps.app.goo.gl/SVJbJwvxGk16ZVqi7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-500 transition-colors duration-200 flex items-start"
                >
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>CS 2: 88 Tây Sơn, Đống Đa, Hà Nội</span>
                </Link>
              </li>
              <li>
                <Link
                  href="tel:0826339922"
                  className="hover:text-red-500 transition-colors duration-200 flex items-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Hotline:{" "}
                  <span className="font-medium ml-1">082 633 9922</span>
                </Link>
              </li>
              <li className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                <span>Thời gian hỗ trợ: 08:00 - 22:00</span>
              </li>
              <li>
                <Link
                  href="https://maps.app.goo.gl/dp4HcJx3CiGZVCQAA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200 flex items-center mt-2"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Tìm Store trên Google Maps
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} FixiMobile. All rights reserved.
          </p>
          <p className="mt-1">
            Giấy chứng nhận Đăng ký Kinh doanh số: 0108922906
          </p>
        </div>
      </div>
    </footer>
  );
}

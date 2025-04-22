// components/client/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Facebook, Youtube } from "lucide-react";


export default function Footer() {
  return (
    <footer className="bg-gray-100 text-black py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kết nối với chúng tôi */}
          <div className="flex flex-col items-left md:items-center">
            <Link href="#" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="FixiMobile"
                width={70}
                height={70}
                priority
              />

            </Link>
            <p className="font-bold mt-4">Kết nối với chúng tôi</p>
            <div className="flex space-x-4 mt-2">
                <Link href="#" className="text-gray-400 hover:text-red-500">
                  <Facebook className="text-2xl" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-red-500">
                  <Youtube className="text-2xl" />
                </Link>
                
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2">
              <li><Link href="#" >Giới thiệu về cửa hàng</Link></li>
              <li><Link href="#" >Tuyển dụng mới nhất</Link></li>
              <li><Link href="tel:0826339922" >Tư vấn miễn phí: 082 633 9922</Link></li>
              <li><Link href="#" >Đánh giá chất lượng, khiếu nại</Link></li>
            </ul>
          </div>

          {/* Chính sách của chúng tôi */}
          <div>
            <h3 className="text-lg font-bold mb-4">Chính sách của chúng tôi</h3>
            <ul className="space-y-2">
              <li><Link href="#">Thu cũ - Đổi mới</Link></li>
              <li><Link href="#">Chính sách trả góp</Link></li>
              <li><Link href="#">Chính sách mua hàng</Link></li>
              <li><Link href="#">Chính sách bảo hành</Link></li>
            </ul>
          </div>

          {/* Địa chỉ và liên hệ */}
          <div>
            <h3 className="text-lg font-bold mb-4">Địa chỉ và liên hệ</h3>
            <ul className="space-y-2">
                <li><Link href="https://maps.app.goo.gl/q8qProJ9c5d9EvJP9">CS 1: 54 Ngõ 66B Triều Khúc, Tân Triều, Thanh Trì, Hà Nội</Link></li>
                <li><Link href="https://maps.app.goo.gl/SVJbJwvxGk16ZVqi7">CS 2: 88 Tây Sơn, Đống Đa, Hà Nội</Link></li>
                <li><Link href="tel:0826339922">Hotline: 082 633 9922</Link></li>
                <li><Link href="#">Thời gian hỗ trợ: 08:00am - 22:00pm</Link></li>
                <li><Link href="https://maps.app.goo.gl/dp4HcJx3CiGZVCQAA">Tìm Store trên Google Maps</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400">
          &copy; 2025 FixiMoile. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

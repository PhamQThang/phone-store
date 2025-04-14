// components/client/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Thông tin cửa hàng */}
          <div>
            <h3 className="text-lg font-semibold mb-4">PhoneStore</h3>
            <p className="text-gray-400">
              Chuyên cung cấp các dòng điện thoại chính hãng, giá tốt nhất.
            </p>
            <p className="text-gray-400 mt-2">
              Địa chỉ: 123 Đường Điện Thoại, TP. Hồ Chí Minh
            </p>
            <p className="text-gray-400">Hotline: 0912 345 678</p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/client" className="text-gray-400 hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/client/products"
                  className="text-gray-400 hover:text-white"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/client/orders"
                  className="text-gray-400 hover:text-white"
                >
                  Đơn hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/client/contact"
                  className="text-gray-400 hover:text-white"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <p className="text-gray-400">Email: support@phonestore.com</p>
            <p className="text-gray-400">Thời gian làm việc: 8:00 - 22:00</p>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400">
          &copy; 2025 PhoneStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

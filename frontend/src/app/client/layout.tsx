// app/client/layout.tsx
import { ReactNode } from "react";
import Footer from "@/components/client/Footer";
import Header from "@/components/client/Header";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

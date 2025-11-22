import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import SupplementaryPanel from "@/components/SupplementaryPanel";

export const metadata: Metadata = {
  title: "ClinBox",
  description: "Email tool for clinical research teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-foreground">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <MainContent>{children}</MainContent>
          <SupplementaryPanel>
            <div className="flex items-center justify-center h-full">
              <p className="text-muted">Supp Info</p>
            </div>
          </SupplementaryPanel>
        </div>
      </body>
    </html>
  );
}

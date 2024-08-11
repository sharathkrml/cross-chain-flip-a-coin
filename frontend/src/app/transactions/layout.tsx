import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Suspense } from "react";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "thirdweb SDK +++++ Next starter",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense>
          <ThirdwebProvider>{children}</ThirdwebProvider>
        </Suspense>
      </body>
    </html>
  );
}

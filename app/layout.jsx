import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "PakCards - Pakistan's Gift Card Marketplace",
  description:
    "Buy and sell digital gift cards instantly. Gaming, shopping, entertainment and more. Fast, secure, trusted.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${outfit.className} antialiased`}
          suppressHydrationWarning
        >
          <StoreProvider>
            <Toaster />
            {children}
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

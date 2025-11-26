import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import "./globals.css";
import { Providers } from "./Providers";
import PageLoader from "@/components/common/PageLoader";
import localFont from "next/font/local";

export const metadata = {
  title: "Chenanda",
  description: "kodava okka",
  openGraph: {
    title: "Chenanda",
    description: "kodava okka",
    url: "https://chenanda.in/",
    images: [
      {
        url: "/website-thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "chenanda",
      },
    ],
    siteName: "chenanda",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const mundial = localFont({
  src: [
    { path: "../public/fonts/MundialRegular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/MundialBold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-mundial",
  display: "swap",
});

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en" className={`${mundial.variable}`}>
      <body className="font-mundial  transition-colors duration-500 ease-in-out">
        <SessionProvider session={session} refetchInterval={5 * 60}>
          <Providers>{children}</Providers>
          <PageLoader />
        </SessionProvider>
      </body>
    </html>
  );
}

import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CukiStory Tools",
  description: "Turn comic panels, subtitles, and VO into vertical MP4 videos.",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

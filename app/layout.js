import "./globals.css";

export const metadata = {
  title: "Bypass X Frame",
  description: "Proxy pages to remove iframe-blocking headers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

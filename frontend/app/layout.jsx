import "./globals.css";

export const metadata = {
  title: "Grow2Stellar",
  description: "Wallet-powered ambassador rewards on Stellar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

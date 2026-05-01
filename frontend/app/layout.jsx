import "./globals.css";

export const metadata = {
  title: {
    default: "Grow2Stellar — Web3 Ambassador Rewards on Stellar",
    template: "%s | Grow2Stellar",
  },
  description:
    "Grow2Stellar connects brands with ambassadors through Soroban smart contracts. Submit proof, get paid automatically in XLM and G2S tokens.",
  keywords: ["Stellar", "Soroban", "ambassador", "Web3", "XLM", "rewards", "growth"],
  openGraph: {
    title: "Grow2Stellar",
    description: "Web3-native ambassador rewards on Stellar.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f9f8f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import DarkModeBackground from "@/components/shared/DarkModeBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vault - Lost & Found | VIT Vellore",
  description:
    "VIT Vellore's student-built lost and found platform. Post, discover, and claim lost items on campus - securely and anonymously.",
  keywords: ["VIT", "Vellore", "lost and found", "campus", "students"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DarkModeBackground />
          <div className="app-content-layer">
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: "'DM Sans', sans-serif",
                },
              }}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

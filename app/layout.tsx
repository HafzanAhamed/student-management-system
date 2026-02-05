import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = DM_Serif_Display({ subsets: ["latin"], weight: ["400"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Student Management System",
  description: "StudentSphere helps you manage student records with ease."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <ToastProvider>
          <div className="relative isolate min-h-screen">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />
              <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-sky/20 blur-3xl" />
              <div className="absolute left-1/3 top-24 h-48 w-48 rounded-full bg-coral/15 blur-3xl" />
            </div>
            <header className="border-b border-border/70 bg-surface/70 backdrop-blur">
              <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
                <div className="flex items-center gap-6">
                  <Link href="/students" className="text-lg font-semibold tracking-tight text-ink">
                    <span className="font-display text-xl">StudentSphere</span>
                  </Link>
                  <Link
                    href="/students"
                    className="hidden text-sm font-medium text-muted hover:text-ink md:inline"
                  >
                    Students
                  </Link>
                </div>
                <Link
                  href="/students/new"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-strong"
                >
                  Add Student
                </Link>
              </nav>
            </header>
            <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

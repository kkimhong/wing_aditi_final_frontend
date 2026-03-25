import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Providers } from "./provider"
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        geistMono.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <Providers>{children}</Providers>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

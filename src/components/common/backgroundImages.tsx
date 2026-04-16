//#region Imports
import Image from "next/image"

import { cn } from "@/src/lib/utils/utils"

//#endregion

//#region Interfaces
interface BackgroundImagesProps {
  className?: string
}

/**
 * @component BackgroundImages
 * @description
 * A high-performance background wrapper that renders theme-aware decorative images.
 * * This component utilizes Next.js `next/image` for automatic optimization (WebP/AVIF conversion,
 * resizing) and applies a CSS mask to create a smooth fade-out effect at the bottom.
 * * **Key Features:**
 * - **Theme Switching:** Automatically toggles between light (`background.png`) and dark (`backgroundBlack.png`) modes using Tailwind's `dark:` variant.
 * - **Optimized LCP:** Uses the `priority` attribute to ensure backgrounds are loaded immediately as they are critical for the page's visual integrity.
 * - **Layering:** Uses `fixed` positioning and a negative z-index (`-z-10`) to remain static behind all page content without interfering with user interactions.
 * * @example
 * // Usage in a Layout or Page:
 * return (
 * <>
 * <BackgroundImages />
 * <main>{children}</main>
 * </>
 * )
 * * @returns {JSX.Element} A fixed container with theme-specific optimized images.
 */
const BackgroundImages = ({ className }: BackgroundImagesProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 pointer-events-none select-none w-full max-w-440 mx-auto",
        className
      )}
    >
      <div className="relative w-full h-full dark:hidden">
        <Image
          src="/images/background.png"
          alt="Background Light"
          fill
          priority
          quality={85}
          className="object-cover object-center"
        />
      </div>

      <div className="relative w-full h-full hidden dark:block">
        <Image
          src="/images/backgroundBlack.png"
          alt="Background Dark"
          fill
          priority
          quality={85}
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-transparent" />
    </div>
  )
}

export default BackgroundImages

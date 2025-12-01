"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ComponentProps, ReactNode } from "react"
import Aurora from "@/components/ui/Aurora"
import CurvedLoop from "@/components/ui/CurvedLoop";

export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="relative flex justify-center px-4 py-6  items-center text-primary-foreground">
      
      {/* Aurora background that extends down into the page */}
      <div className="absolute inset-x-0 top-0 h-[260px] -z-10 pointer-events-none">
        <Aurora
          colorStops={["#191970", "#4b0082", "#483d8b"]}
          blend={1.2}     // thicker band for smoother fade
          amplitude={0.5}
          speed={0.5}
        />
      </div>
      

      {/* Content on top (unchanged behavior) */}
      <div className="relative z-10 flex items-center">
        {children}
      </div>
      
    </nav>
  )
}

export function NavLink(
  props: Omit<ComponentProps<typeof Link>, "className">
) {
  const pathname = usePathname()

  return (
    <Link
      {...props}
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        "hover:bg-secondary/70 hover:text-secondary-foreground",
        "focus-visible:bg-secondary/70 focus-visible:text-secondary-foreground outline-none",
        pathname === props.href && "bg-background/80 text-foreground"
      )}
    />
  )
}

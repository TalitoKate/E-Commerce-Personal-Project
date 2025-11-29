import ClickSpark from "@/components/ui/ClickSpark"
import { Nav } from "@/components/Nav"
import PillNav from "@/components/ui/PillNav"

export const dynamic = "force-dynamic"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClickSpark
      sparkColor="#fff"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <Nav>
        <PillNav
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "My Orders", href: "/orders" },
          ]}

          baseColor="#ffffff"
          pillColor="#000000"
          hoveredPillTextColor="#000000"
          pillTextColor="#ffffff"
        />
      </Nav>

      <div className="container my-6">{children}</div>
    </ClickSpark>
  )
}

export const dynamic = "force-dynamic"

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import db from "@/db/db"
import { cache } from "@/lib/cache"
import { Suspense } from "react"
import GradientText from '@/components/ui/GradientText'

const getProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  })
}, ["/products", "getProducts"])

export default function ProductsPage() {
  return (
    <div>
    <GradientText 
      colors={["#000000", "#483d8b", "#4b0082", "#000000", "#000000"]}
      animationSpeed={8}
      showBorder={false}
      className="text-4xl md:text-6xl font-semibold mb-10"
    >
      Discover our products
    </GradientText>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-100">
      <Suspense
        fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }
      >
        <ProductsSuspense />
      </Suspense>
    </div>
    </div>
  )
}

async function ProductsSuspense() {
  const products = await getProducts()

  return products.map(product => <ProductCard key={product.id} {...product} />)
}

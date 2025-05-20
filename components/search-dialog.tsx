"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts } from "@/lib/products-client"
import type { Product } from "@/lib/types"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { DialogTitle } from "@/components/ui/dialog"

export default function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!open) return

    const loadProducts = async () => {
      setLoading(true)
      try {
        const { data: allProducts = [] } = await getProducts()
        setProducts(allProducts)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [open])

  const filteredProducts = (products || []).filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase()) ||
    product.region.toLowerCase().includes(search.toLowerCase()) ||
    product.varietal.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3"
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">{t.common.search}</span>
        <span className="hidden sm:inline-block text-xs font-mono bg-muted px-1.5 py-0.5 rounded border">
          ⌘K
        </span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">{t.common.search}</DialogTitle>
        <form
          onSubmit={e => {
            e.preventDefault(); // Prevenir submit por defecto
          }}
        >
          <CommandInput
            placeholder={t.common.search}
            value={search}
            onValueChange={setSearch}
          />
        </form>
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <div className="p-4 text-center text-sm">
                {t.common.loading}
              </div>
            ) : (
              <div className="p-4 text-center text-sm">
                {t.common.noResults}
              </div>
            )}
          </CommandEmpty>
          <CommandGroup heading={t.navigation.products}>
            {filteredProducts.map((product) => (
              <CommandItem
                key={product.id}
                onSelect={() => {
                  router.push(`/products/${product.slug}`)
                  setOpen(false)
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.region} • {product.varietal}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
} 
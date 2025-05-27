"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  year: string
  region: string
  varietal: string
}

interface PlanProduct {
  id: string
  quantity: number
  products: Product
}

interface ClubTabsProps {
  plan: any
  products: PlanProduct[]
  clubInfo: any
}

export default function ClubTabs({ plan, products, clubInfo }: ClubTabsProps) {
  const [activeTab, setActiveTab] = useState("description")

  const tabs = [
    { id: "description", label: "Descripción" },
    { id: "about", label: "Sobre el club" },
    { id: "wines", label: "Los vinos" }
  ]

  return (
    <div className="mt-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === "description" && (
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {plan.description}
            </p>
            {plan.tagline && (
              <p className="text-sm italic text-muted-foreground">
                {plan.tagline}
              </p>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Sobre este club</h4>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {clubInfo.longDescription}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Beneficios incluidos</h4>
              <ul className="space-y-2">
                {clubInfo.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Opciones de suscripción</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="text-center p-3 bg-background rounded border">
                  <div className="font-medium">Cada mes</div>
                  <div className="text-lg font-bold text-primary">{formatCurrency(plan.price_monthly)}</div>
                  <div className="text-xs text-muted-foreground">cada mes</div>
                </div>
                <div className="text-center p-3 bg-background rounded border">
                  <div className="font-medium">Cada dos meses</div>
                  <div className="text-lg font-bold text-primary">{formatCurrency(plan.price_bimonthly || 0)}</div>
                  <div className="text-xs text-muted-foreground">cada 2 meses</div>
                </div>
                <div className="text-center p-3 bg-background rounded border">
                  <div className="font-medium">Cada tres meses</div>
                  <div className="text-lg font-bold text-primary">{formatCurrency(plan.price_quarterly)}</div>
                  <div className="text-xs text-muted-foreground">cada 3 meses</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "wines" && (
          <div className="space-y-6">
            {products && products.length > 0 ? (
              <>
                <div>
                  <h4 className="font-semibold mb-3">Vinos incluidos en este plan</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estos son algunos de los vinos que podrías recibir en tu suscripción:
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {item.products.image && (
                          <div className="relative w-16 h-20 flex-shrink-0">
                            <Image
                              src={item.products.image}
                              alt={item.products.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm mb-1 truncate">
                            {item.products.name}
                          </h5>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>{item.products.year} • {item.products.region}</div>
                            <div>{item.products.varietal}</div>
                            <div className="font-medium">Cantidad: {item.quantity}</div>
                          </div>
                        </div>
                      </div>
                      {item.products.description && (
                        <p className="text-xs text-muted-foreground mt-2 overflow-hidden" style={{ 
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical' 
                        }}>
                          {item.products.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <span className="text-4xl">🍷</span>
                </div>
                <h4 className="font-semibold mb-2">Vinos sorpresa cada semana</h4>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Nuestros sommeliers seleccionan cuidadosamente diferentes vinos cada semana 
                  para que siempre tengas una nueva experiencia de cata.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
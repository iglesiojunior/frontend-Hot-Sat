"use client"

import { useState, useCallback } from "react"
import { ProductionAPI, type ProductAnalysis } from "../services/api"

export function useRealProductData() {
  const [productAnalyses, setProductAnalyses] = useState<Record<string, ProductAnalysis>>({})
  const [isLoading, setIsLoading] = useState(false)

  const fetchProductAnalysis = useCallback(
    async (productId: string) => {
      if (productAnalyses[productId]) return productAnalyses[productId]

      setIsLoading(true)
      try {
        const analysis = await ProductionAPI.getProductAnalysis(productId)
        if (analysis) {
          setProductAnalyses((prev) => ({
            ...prev,
            [productId]: analysis,
          }))
          return analysis
        }
      } catch (error) {
        console.error("Error fetching product analysis:", error)
      } finally {
        setIsLoading(false)
      }
      return null
    },
    [productAnalyses],
  )

  return {
    productAnalyses,
    fetchProductAnalysis,
    isLoading,
  }
}

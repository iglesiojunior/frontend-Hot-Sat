// hooks/use-production-data.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { ProductionAPI, ProductionLine, ProductionMetrics, FailureRecord } from "../services/api"

export function useProductionData() {
  const [lines, setLines] = useState<ProductionLine[]>([])
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null)
  const [failures, setFailures] = useState<FailureRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Faz todas as requisições em paralelo
      const [linesData, metricsData, failuresData] = await Promise.all([
        ProductionAPI.getProductionLines(),
        ProductionAPI.getProductionMetrics(),
        ProductionAPI.getFailureRecords(),
      ])
      
      setLines(linesData)
      setMetrics(metricsData)
      setFailures(failuresData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carrega os dados quando o hook é montado
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    lines,
    metrics,
    failures,
    isLoading,
    error,
    fetchData,
  }
}
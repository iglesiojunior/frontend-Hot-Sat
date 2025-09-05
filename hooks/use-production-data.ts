"use client"

import { useState, useCallback } from "react"
import { ProductionAPI } from "../services/api"

export interface ProductAnalysis {
  analisePorEtapa: Array<{
    etapaId: number
    nomeEtapa: string
    duracaoEtapa: number
    tempoDeOcio: any
  }>
  ocioTotalSegundos: number
}

export function useProductionData() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getProductAnalysis = useCallback(async (productId: string): Promise<ProductAnalysis | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const analysis = await ProductionAPI.getProductAnalysis(productId)
      return analysis
    } catch (err) {
      setError("Erro ao buscar análise do produto")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const processProductionEvent = useCallback(async (tipo: "start" | "stop", etapa: number, linhaId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await ProductionAPI.processEvent(tipo, etapa, linhaId)
      return result
    } catch (err) {
      setError("Erro ao processar evento de produção")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const associateSerialNumber = useCallback(async (numeroSerie: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await ProductionAPI.associateSerialNumber(numeroSerie)
      return result
    } catch (err) {
      setError("Erro ao associar número de série")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setDailyProductionGoal = useCallback(async (lineId: string, goal: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await ProductionAPI.setDailyProductionGoal(lineId, goal)
      return result
    } catch (err) {
      setError("Erro ao definir meta diária")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    getProductAnalysis,
    processProductionEvent,
    associateSerialNumber,
    setDailyProductionGoal,
  }
}

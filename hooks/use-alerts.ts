"use client"

import { useState, useCallback } from "react"
import { ProductionAPI } from "../services/api"

export function useAlerts() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAlert = useCallback(async (linhaId: number, etapaId?: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await ProductionAPI.createAlert(linhaId, etapaId)
      return result
    } catch (err) {
      setError("Erro ao criar alerta")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resolveAlert = useCallback(async (linhaId: number, etapaId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await ProductionAPI.resolveAlert(linhaId, etapaId)
      return result
    } catch (err) {
      setError("Erro ao resolver alerta")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    createAlert,
    resolveAlert,
  }
}

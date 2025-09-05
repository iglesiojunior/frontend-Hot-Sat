const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface ProductAnalysis {
  analisePorEtapa: Array<{
    etapaId: number
    nomeEtapa: string
    duracaoEtapa: number
    tempoDeOcio: any
  }>
  ocioTotalSegundos: number
}

export class ProductionAPI {
  // Análise de tempos de um produto específico
  static async getProductAnalysis(productId: string): Promise<ProductAnalysis | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/produtos/${productId}/analise-tempo`)
      if (!response.ok) {
        console.warn(`Product ${productId} not found in database, using mock data`)
        return null
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching product analysis:", error)
      return null
    }
  }

  // Definir meta diária de produção para uma linha
  static async setDailyProductionGoal(lineId: string, goal: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/linhas/${lineId}/meta-diaria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metaDiaria: goal,
          data: new Date().toISOString().split('T')[0] // Data atual no formato YYYY-MM-DD
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success || false
    } catch (error) {
      console.error("Error setting daily production goal:", error)
      return false
    }
  }
}



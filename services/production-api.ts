// Serviço de API para dados de produção
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Tipos de dados para produção
export interface ProductionLine {
  id: string
  name: string
  model: string
  currentProduction: number
  targetProduction: number
  status: "running" | "stopped" | "maintenance" | "completed"
  efficiency: number
  lastUpdate: Date
  issues: string[]
  products: Product[]
}

export interface Product {
  id: string
  serialNumber: string
  barcode?: string
  model: string
  currentStage: number
  totalStages: number
  stageTimes: number[]
  totalActiveTime: number
  idleTime: number
  status: "in_production" | "completed" | "paused"
}

export interface ProductionMetrics {
  totalProduced: number
  totalTarget: number
  overallEfficiency: number
  activeLines: number
  totalIssues: number
  averageCycleTime: number
}

export interface FailureRecord {
  id: string
  lineId: string
  stage: number
  startTime: Date
  endTime?: Date
  duration: number
  status: "open" | "resolved"
  description: string
  severity: "low" | "medium" | "high" | "critical"
}

// Classe principal da API
export class ProductionAPI {
  // Buscar todas as linhas de produção
  static async getProductionLines(): Promise<ProductionLine[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/production-lines`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar linhas de produção:", error)
      // Retornar dados mockados em caso de erro
      return this.getMockProductionLines()
    }
  }

  // Buscar métricas gerais de produção
  static async getProductionMetrics(): Promise<ProductionMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/production-metrics`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar métricas de produção:", error)
      return this.getMockProductionMetrics()
    }
  }

  // Buscar registros de falhas
  static async getFailureRecords(): Promise<FailureRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/failures`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar registros de falhas:", error)
      return this.getMockFailureRecords()
    }
  }

  // Atualizar status de uma linha
  static async updateLineStatus(lineId: string, status: ProductionLine["status"]): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/production-lines/${lineId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      return response.ok
    } catch (error) {
      console.error("Erro ao atualizar status da linha:", error)
      return false
    }
  }

  // Adicionar novo produto à linha
  static async addProductToLine(lineId: string, product: Omit<Product, "id">): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/production-lines/${lineId}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Erro ao adicionar produto à linha:", error)
      return null
    }
  }

  // Registrar nova falha
  static async reportFailure(failure: Omit<FailureRecord, "id">): Promise<FailureRecord | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/failures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(failure),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Erro ao registrar falha:", error)
      return null
    }
  }

  // Resolver falha
  static async resolveFailure(failureId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/failures/${failureId}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endTime: new Date() }),
      })
      return response.ok
    } catch (error) {
      console.error("Erro ao resolver falha:", error)
      return false
    }
  }

  // Dados mockados para desenvolvimento
  private static getMockProductionLines(): ProductionLine[] {
    return [
      {
        id: "line-1",
        name: "Linha 1",
        model: "20RT COMPACT BR",
        currentProduction: 127,
        targetProduction: 150,
        status: "running",
        efficiency: 84.7,
        lastUpdate: new Date(),
        issues: ["Temperatura elevada no estágio 3"],
        products: [
          {
            id: "prod-1",
            serialNumber: "1209F25A16806100",
            model: "MOD:20RT COMPACT BR",
            currentStage: 3,
            totalStages: 5,
            stageTimes: [1703145600000, 1703148300000, 1703150980000, 0, 0],
            totalActiveTime: 1703150980000 - 1703145600000,
            idleTime: 900000,
            status: "in_production",
          },
        ],
      },
      {
        id: "line-2",
        name: "Linha 2",
        model: "30RT STANDARD BR",
        currentProduction: 110,
        targetProduction: 140,
        status: "maintenance",
        efficiency: 78.6,
        lastUpdate: new Date(),
        issues: ["Manutenção preventiva programada"],
        products: [],
      },
      {
        id: "line-3",
        name: "Linha 3",
        model: "40RT PREMIUM BR",
        currentProduction: 95,
        targetProduction: 120,
        status: "running",
        efficiency: 79.2,
        lastUpdate: new Date(),
        issues: [],
        products: [],
      },
    ]
  }

  private static getMockProductionMetrics(): ProductionMetrics {
    return {
      totalProduced: 332,
      totalTarget: 410,
      overallEfficiency: 81.0,
      activeLines: 2,
      totalIssues: 2,
      averageCycleTime: 45.5,
    }
  }

  private static getMockFailureRecords(): FailureRecord[] {
    return [
      {
        id: "failure-1",
        lineId: "line-1",
        stage: 2,
        startTime: new Date(Date.now() - 1800000), // 30 min atrás
        endTime: new Date(),
        duration: 1800000,
        status: "resolved",
        description: "Falha no sistema de refrigeração",
        severity: "medium",
      },
      {
        id: "failure-2",
        lineId: "line-2",
        stage: 1,
        startTime: new Date(Date.now() - 3600000), // 1 hora atrás
        status: "open",
        duration: 3600000,
        description: "Manutenção preventiva em andamento",
        severity: "low",
      },
    ]
  }
}

// Hook personalizado para gerenciar dados de produção
export function useProductionData() {
  const [lines, setLines] = React.useState<ProductionLine[]>([])
  const [metrics, setMetrics] = React.useState<ProductionMetrics | null>(null)
  const [failures, setFailures] = React.useState<FailureRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
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

  const updateLineStatus = React.useCallback(async (lineId: string, status: ProductionLine["status"]) => {
    const success = await ProductionAPI.updateLineStatus(lineId, status)
    if (success) {
      setLines(prev => 
        prev.map(line => 
          line.id === lineId ? { ...line, status, lastUpdate: new Date() } : line
        )
      )
    }
    return success
  }, [])

  const addProduct = React.useCallback(async (lineId: string, product: Omit<Product, "id">) => {
    const newProduct = await ProductionAPI.addProductToLine(lineId, product)
    if (newProduct) {
      setLines(prev => 
        prev.map(line => 
          line.id === lineId 
            ? { ...line, products: [...line.products, newProduct] }
            : line
        )
      )
    }
    return newProduct
  }, [])

  const reportFailure = React.useCallback(async (failure: Omit<FailureRecord, "id">) => {
    const newFailure = await ProductionAPI.reportFailure(failure)
    if (newFailure) {
      setFailures(prev => [...prev, newFailure])
    }
    return newFailure
  }, [])

  const resolveFailure = React.useCallback(async (failureId: string) => {
    const success = await ProductionAPI.resolveFailure(failureId)
    if (success) {
      setFailures(prev => 
        prev.map(failure => 
          failure.id === failureId 
            ? { ...failure, status: "resolved", endTime: new Date() }
            : failure
        )
      )
    }
    return success
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    lines,
    metrics,
    failures,
    isLoading,
    error,
    fetchData,
    updateLineStatus,
    addProduct,
    reportFailure,
    resolveFailure,
  }
} 
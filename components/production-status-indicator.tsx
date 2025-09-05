"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"

// Tipos TypeScript para o componente
interface ProductionStatus {
  id: string
  name: string
  currentProduction: number
  targetProduction: number
  efficiency: number
  status: "running" | "stopped" | "maintenance" | "completed"
  lastUpdate: Date
  issues: string[]
}

interface ProductionStatusIndicatorProps {
  status: ProductionStatus
  className?: string
  showDetails?: boolean
  onStatusClick?: (status: ProductionStatus) => void
}

// Função utilitária para formatar porcentagem
const formatPercentage = (value: number) => `${Math.round(value)}%`

// Função para obter cor baseada no status
const getStatusColor = (status: ProductionStatus["status"]) => {
  switch (status) {
    case "running":
      return "text-green-600 bg-green-100 border-green-200"
    case "stopped":
      return "text-red-600 bg-red-100 border-red-200"
    case "maintenance":
      return "text-orange-600 bg-orange-100 border-orange-200"
    case "completed":
      return "text-blue-600 bg-blue-100 border-blue-200"
    default:
      return "text-gray-600 bg-gray-100 border-gray-200"
  }
}

// Função para obter ícone baseado no status
const getStatusIcon = (status: ProductionStatus["status"]) => {
  switch (status) {
    case "running":
      return <TrendingUp className="h-4 w-4" />
    case "stopped":
      return <AlertTriangle className="h-4 w-4" />
    case "maintenance":
      return <Clock className="h-4 w-4" />
    case "completed":
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

// Função para obter texto do status
const getStatusText = (status: ProductionStatus["status"]) => {
  switch (status) {
    case "running":
      return "Em Produção"
    case "stopped":
      return "Parado"
    case "maintenance":
      return "Manutenção"
    case "completed":
      return "Concluído"
    default:
      return "Desconhecido"
  }
}

export function ProductionStatusIndicator({
  status,
  className,
  showDetails = false,
  onStatusClick,
}: ProductionStatusIndicatorProps) {
  const efficiency = (status.currentProduction / status.targetProduction) * 100
  const isClickable = !!onStatusClick

  const handleClick = () => {
    if (onStatusClick) {
      onStatusClick(status)
    }
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        isClickable && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{status.name}</CardTitle>
          <Badge
            variant="outline"
            className={cn("border-2", getStatusColor(status.status))}
          >
            <div className="flex items-center gap-1">
              {getStatusIcon(status.status)}
              {getStatusText(status.status)}
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {status.currentProduction}
            </div>
            <div className="text-sm text-gray-600">Produzidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {status.targetProduction}
            </div>
            <div className="text-sm text-gray-600">Meta</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Eficiência</span>
            <span className="font-semibold">{formatPercentage(efficiency)}</span>
          </div>
          <Progress value={efficiency} className="h-2" />
        </div>

        {/* Detalhes expandidos */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t">
            <div className="text-sm text-gray-600">
              <strong>Última atualização:</strong>{" "}
              {status.lastUpdate.toLocaleString("pt-BR")}
            </div>

            {status.issues.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-red-600">
                  Problemas Identificados:
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {status.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente de lista para múltiplos status
interface ProductionStatusListProps {
  statuses: ProductionStatus[]
  className?: string
  onStatusClick?: (status: ProductionStatus) => void
}

export function ProductionStatusList({
  statuses,
  className,
  onStatusClick,
}: ProductionStatusListProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {statuses.map((status) => (
        <ProductionStatusIndicator
          key={status.id}
          status={status}
          showDetails={true}
          onStatusClick={onStatusClick}
        />
      ))}
    </div>
  )
}

// Hook personalizado para gerenciar dados de produção
export function useProductionStatus() {
  const [statuses, setStatuses] = React.useState<ProductionStatus[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const updateStatus = React.useCallback((id: string, updates: Partial<ProductionStatus>) => {
    setStatuses(prev => 
      prev.map(status => 
        status.id === id ? { ...status, ...updates } : status
      )
    )
  }, [])

  const addStatus = React.useCallback((newStatus: ProductionStatus) => {
    setStatuses(prev => [...prev, newStatus])
  }, [])

  const removeStatus = React.useCallback((id: string) => {
    setStatuses(prev => prev.filter(status => status.id !== id))
  }, [])

  return {
    statuses,
    isLoading,
    updateStatus,
    addStatus,
    removeStatus,
    setIsLoading,
  }
} 
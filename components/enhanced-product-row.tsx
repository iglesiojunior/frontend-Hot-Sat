"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealProductData } from "@/hooks/use-real-data"
import { Eye, Clock } from "lucide-react"

interface Product {
  barcode: string
  serialNumber: string
  model: string
  fabrication: string
  currentStage: number
  nextStage: number | null
  stageTimes: number[]
  totalActiveTime: number
  idleTime: number
}

interface EnhancedProductRowProps {
  product: Product
  getStageStatus: (currentStage: number, stage: number) => string
  getStageColor: (status: string) => string
  formatTimestamp: (timestamp: number) => string
}

export function EnhancedProductRow({
  product,
  getStageStatus,
  getStageColor,
  formatTimestamp,
}: EnhancedProductRowProps) {
  const [showRealData, setShowRealData] = useState(false)
  const [realData, setRealData] = useState(null)
  const { fetchProductAnalysis, isLoading } = useRealProductData()

  const handleShowRealData = async () => {
    if (!realData) {
      const analysis = await fetchProductAnalysis(product.serialNumber)
      setRealData(analysis)
    }
    setShowRealData(!showRealData)
  }

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000)
    const minutes = Math.floor((milliseconds % 3600000) / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${seconds}s`
  }

  const formatIdleTime = (tempoDeOcio: any) => {
    if (!tempoDeOcio) return "0s"

    let totalSeconds = 0
    totalSeconds += (tempoDeOcio.days || 0) * 86400
    totalSeconds += (tempoDeOcio.hours || 0) * 3600
    totalSeconds += (tempoDeOcio.minutes || 0) * 60
    totalSeconds += tempoDeOcio.seconds || 0

    return formatDuration(totalSeconds * 1000)
  }

  return (
    <>
      <TableRow>
        <TableCell>
          {product.currentStage === 5 ? (
            <div className="flex flex-col gap-1">
              <div className="font-mono text-sm font-bold">{product.serialNumber}</div>
              <div className="text-xs bg-black text-white px-2 py-1 rounded">
                {product.model} {product.fabrication}
              </div>
              {product.barcode && <div className="text-xs text-green-600 font-semibold">Código: {product.barcode}</div>}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowRealData}
                disabled={isLoading}
                className="mt-1 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                {showRealData ? "Ocultar" : "Ver"} Dados Reais
              </Button>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">-</div>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Etapa {product.currentStage}
              {product.nextStage && (
                <>
                  <span className="mx-1">→</span>
                  {product.nextStage}
                </>
              )}
            </Badge>
          </div>
        </TableCell>
        {product.stageTimes.map((timestamp, index) => (
          <TableCell key={index}>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getStageColor(getStageStatus(product.currentStage, index + 1))}`}
              />
              <span className="text-xs font-mono">{formatTimestamp(timestamp)}</span>
            </div>
          </TableCell>
        ))}
        <TableCell>
          <Badge variant={product.currentStage === 5 ? "default" : "secondary"}>
            {product.currentStage === 5 ? "Concluído" : "Em Produção"}
          </Badge>
        </TableCell>
      </TableRow>

      {/* Linha expandida com dados reais */}
      {showRealData && realData && (
        <TableRow className="bg-blue-50">
          <TableCell colSpan={8}>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-600">Dados Reais do Backend</span>
                <Badge variant="outline" className="text-xs">
                  Ócio Total: {formatDuration(realData.ocioTotalSegundos * 1000)}
                </Badge>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {realData.analisePorEtapa.map((etapa) => (
                  <div key={etapa.etapaId} className="bg-white p-3 rounded border">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Etapa {etapa.etapaId}</div>
                    <div className="text-xs text-gray-500 mb-2">{etapa.nomeEtapa}</div>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="text-green-600 font-mono">Duração: {formatDuration(etapa.duracaoEtapa)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-orange-600 font-mono">Ócio: {formatIdleTime(etapa.tempoDeOcio)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* Linha quando não há dados reais */}
      {showRealData && !realData && (
        <TableRow className="bg-gray-50">
          <TableCell colSpan={8}>
            <div className="p-4 text-center text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Dados reais não encontrados para este produto</p>
              <p className="text-xs text-gray-400">
                Produto pode não estar no banco de dados ou ainda não foi processado
              </p>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

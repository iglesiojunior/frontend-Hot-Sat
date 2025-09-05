"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useProductionData, type ProductAnalysis } from "@/hooks/use-production-data"
import { useToast } from "@/hooks/use-toast"
import { Search, Clock, TrendingUp } from "lucide-react"

export function ProductAnalysisPanel() {
  const [productId, setProductId] = useState("")
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)
  const { getProductAnalysis, isLoading } = useProductionData()
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!productId.trim()) {
      toast({
        title: "Erro",
        description: "Digite um ID de produto válido",
        variant: "destructive",
      })
      return
    }

    const result = await getProductAnalysis(productId)
    if (result) {
      setAnalysis(result)
      toast({
        title: "Análise Carregada",
        description: `Análise do produto ${productId} carregada com sucesso`,
      })
    } else {
      toast({
        title: "Produto não encontrado",
        description: "Não foi possível encontrar dados para este produto",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000)
    const minutes = Math.floor((milliseconds % 3600000) / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise Detalhada de Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Digite o ID do produto para análise"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <Button onClick={handleAnalyze} disabled={isLoading || !productId.trim()} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Analisar
          </Button>
        </div>

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold">Tempo Total de Ócio</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatDuration(analysis.ocioTotalSegundos * 1000)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">Etapas Analisadas</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{analysis.analisePorEtapa.length}</div>
                </CardContent>
              </Card>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Nome da Etapa</TableHead>
                  <TableHead>Duração da Etapa</TableHead>
                  <TableHead>Tempo de Ócio</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.analisePorEtapa.map((etapa) => (
                  <TableRow key={etapa.etapaId}>
                    <TableCell>
                      <Badge variant="outline">Etapa {etapa.etapaId}</Badge>
                    </TableCell>
                    <TableCell>{etapa.nomeEtapa}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{formatDuration(etapa.duracaoEtapa)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-orange-600">{formatIdleTime(etapa.tempoDeOcio)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Concluída</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

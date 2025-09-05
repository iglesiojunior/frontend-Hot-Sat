"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProductionData } from "@/hooks/use-production-data"
import { useAlerts } from "@/hooks/use-alerts"
import { useToast } from "@/hooks/use-toast"
import { Play, Square, AlertTriangle, CheckCircle, Scan } from "lucide-react"

interface ProductionControlsProps {
  currentLine: number
}

export function ProductionControls({ currentLine }: ProductionControlsProps) {
  const [selectedStage, setSelectedStage] = useState<number>(1)
  const [serialNumber, setSerialNumber] = useState("")
  const { processProductionEvent, associateSerialNumber, isLoading } = useProductionData()
  const { createAlert, resolveAlert, isLoading: alertLoading } = useAlerts()
  const { toast } = useToast()

  const handleStartEvent = async () => {
    const result = await processProductionEvent("start", selectedStage, currentLine)
    if (result) {
      toast({
        title: "Evento Processado",
        description: `Etapa ${selectedStage} iniciada na Linha ${currentLine}`,
      })
    }
  }

  const handleStopEvent = async () => {
    const result = await processProductionEvent("stop", selectedStage, currentLine)
    if (result) {
      toast({
        title: "Evento Processado",
        description: `Etapa ${selectedStage} finalizada na Linha ${currentLine}`,
      })
    }
  }

  const handleCreateAlert = async () => {
    const result = await createAlert(currentLine, selectedStage)
    if (result) {
      toast({
        title: "Alerta Criado",
        description: `Alerta criado para Linha ${currentLine}, Etapa ${selectedStage}`,
        variant: "destructive",
      })
    }
  }

  const handleResolveAlert = async () => {
    const result = await resolveAlert(currentLine, selectedStage)
    if (result) {
      toast({
        title: "Alerta Resolvido",
        description: `Alerta resolvido para Linha ${currentLine}, Etapa ${selectedStage}`,
      })
    }
  }

  const handleAssociateSerial = async () => {
    if (!serialNumber.trim()) {
      toast({
        title: "Erro",
        description: "Digite um número de série válido",
        variant: "destructive",
      })
      return
    }

    const result = await associateSerialNumber(serialNumber)
    if (result) {
      toast({
        title: "Número de Série Associado",
        description: `Número ${serialNumber} associado ao produto`,
      })
      setSerialNumber("")
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Controles de Produção - Linha {currentLine}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles de Etapa */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Etapa</label>
            <Select
              value={selectedStage.toString()}
              onValueChange={(value) => setSelectedStage(Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((stage) => (
                  <SelectItem key={stage} value={stage.toString()}>
                    Etapa {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleStartEvent} disabled={isLoading} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Iniciar
            </Button>
            <Button
              onClick={handleStopEvent}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Parar
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={handleCreateAlert}
              disabled={alertLoading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Criar Alerta
            </Button>
            <Button
              onClick={handleResolveAlert}
              disabled={alertLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Resolver
            </Button>
          </div>
        </div>

        {/* Scanner de Código de Barras */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium">Scanner de Código de Barras</label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              placeholder="Digite ou escaneie o número de série"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAssociateSerial()}
            />
            <Button
              onClick={handleAssociateSerial}
              disabled={isLoading || !serialNumber.trim()}
              className="flex items-center gap-2"
            >
              <Scan className="h-4 w-4" />
              Associar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

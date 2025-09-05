"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Target, TrendingUp, Factory, Monitor, AlertTriangle, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { EnhancedProductRow } from "@/components/enhanced-product-row"
import { useProductionData } from "@/hooks/use-production-data"
import { useToast } from "@/hooks/use-toast"

// Dados mockados para demonstração
const productionDataLinha1 = {
  dailyProduction: 127,
  dailyTarget: 150,
  products: [
    {
      barcode: "", // Vazio pois não está concluído
      serialNumber: "1209F25A16806100",
      model: "MOD:20RT COMPACT BR",
      fabrication: "FAB:05/2025",
      currentStage: 3,
      nextStage: 4,
      stageTimes: [1703145600000, 1703148300000, 1703150980000, 0, 0],
      totalActiveTime: 1703150980000 - 1703145600000,
      idleTime: 900000,
    },
    {
      barcode: "1209F25A16806101", // Mostrado pois está concluído
      serialNumber: "1209F25A16806101",
      model: "MOD:20RT COMPACT BR",
      fabrication: "FAB:05/2025",
      currentStage: 5,
      nextStage: null,
      stageTimes: [1703142000000, 1703144100000, 1703146200000, 1703147700000, 1703148780000],
      totalActiveTime: 1703148780000 - 1703142000000,
      idleTime: 1320000,
    },
    {
      barcode: "",
      serialNumber: "1209F25A16806102",
      model: "MOD:20RT COMPACT BR",
      fabrication: "FAB:05/2025",
      currentStage: 2,
      nextStage: 3,
      stageTimes: [1703149200000, 1703150940000, 0, 0, 0],
      totalActiveTime: 1703150940000 - 1703149200000,
      idleTime: 480000,
    },
    {
      barcode: "",
      serialNumber: "1209F25A16806103",
      model: "MOD:20RT COMPACT BR",
      fabrication: "FAB:05/2025",
      currentStage: 4,
      nextStage: 5,
      stageTimes: [1703143800000, 1703145660000, 1703147640000, 1703149260000, 0],
      totalActiveTime: 1703149260000 - 1703143800000,
      idleTime: 1080000,
    },
    {
      barcode: "",
      serialNumber: "1209F25A16806104",
      model: "MOD:20RT COMPACT BR",
      fabrication: "FAB:05/2025",
      currentStage: 1,
      nextStage: 2,
      stageTimes: [1703151200000, 0, 0, 0, 0],
      totalActiveTime: Date.now() - 1703151200000,
      idleTime: 180000,
    },
  ],
}

const productionDataLinha2 = {
  dailyProduction: 110,
  dailyTarget: 140,
  products: [
    {
      barcode: "",
      serialNumber: "1209F25A16806200",
      model: "MOD:30RT STANDARD BR",
      fabrication: "FAB:06/2025",
      currentStage: 2,
      nextStage: 3,
      stageTimes: [1703146000000, 1703149000000, 0, 0, 0],
      totalActiveTime: 1703149000000 - 1703146000000,
      idleTime: 600000,
    },
    {
      barcode: "1209F25A16806201",
      serialNumber: "1209F25A16806201",
      model: "MOD:30RT STANDARD BR",
      fabrication: "FAB:06/2025",
      currentStage: 5,
      nextStage: null,
      stageTimes: [1703142500000, 1703144500000, 1703146500000, 1703148000000, 1703149000000],
      totalActiveTime: 1703149000000 - 1703142500000,
      idleTime: 1400000,
    },
    {
      barcode: "",
      serialNumber: "1209F25A16806202",
      model: "MOD:30RT STANDARD BR",
      fabrication: "FAB:06/2025",
      currentStage: 1,
      nextStage: 2,
      stageTimes: [1703150000000, 0, 0, 0, 0],
      totalActiveTime: Date.now() - 1703150000000,
      idleTime: 300000,
    },
  ],
}

const productionDataLinha3 = {
  dailyProduction: 95,
  dailyTarget: 120,
  products: [
    {
      barcode: "",
      serialNumber: "1209F25A16806300",
      model: "MOD:40RT PREMIUM BR",
      fabrication: "FAB:07/2025",
      currentStage: 4,
      nextStage: 5,
      stageTimes: [1703144000000, 1703146000000, 1703148000000, 1703150000000, 0],
      totalActiveTime: 1703150000000 - 1703144000000,
      idleTime: 1100000,
    },
    {
      barcode: "1209F25A16806301",
      serialNumber: "1209F25A16806301",
      model: "MOD:40RT PREMIUM BR",
      fabrication: "FAB:07/2025",
      currentStage: 5,
      nextStage: null,
      stageTimes: [1703143000000, 1703145000000, 1703147000000, 1703149000000, 1703151000000],
      totalActiveTime: 1703151000000 - 1703143000000,
      idleTime: 1500000,
    },
  ],
}

const productionDataLinha4 = {
  dailyProduction: 135,
  dailyTarget: 160,
  products: [
    {
      barcode: "",
      serialNumber: "1209F25A16806400",
      model: "MOD:25RT ECO BR",
      fabrication: "FAB:08/2025",
      currentStage: 3,
      nextStage: 4,
      stageTimes: [1703147000000, 1703150000000, 1703152000000, 0, 0],
      totalActiveTime: 1703152000000 - 1703147000000,
      idleTime: 800000,
    },
    {
      barcode: "",
      serialNumber: "1209F25A16806401",
      model: "MOD:25RT ECO BR",
      fabrication: "FAB:08/2025",
      currentStage: 1,
      nextStage: 2,
      stageTimes: [1703151000000, 0, 0, 0, 0],
      totalActiveTime: Date.now() - 1703151000000,
      idleTime: 200000,
    },
  ],
}

const productionDataLinha5 = {
  dailyProduction: 118,
  dailyTarget: 155,
  products: [
    {
      barcode: "1209F25A16806500",
      serialNumber: "1209F25A16806500",
      model: "MOD:35RT INDUSTRIAL BR",
      fabrication: "FAB:09/2025",
      currentStage: 5,
      nextStage: null,
      stageTimes: [1703145000000, 1703147000000, 1703149000000, 1703151000000, 1703153000000],
      totalActiveTime: 1703153000000 - 1703145000000,
      idleTime: 1200000,
    },
    {
      barcode: "",
      serialNumber: "1209F25A16806501",
      model: "MOD:35RT INDUSTRIAL BR",
      fabrication: "FAB:09/2025",
      currentStage: 2,
      nextStage: 3,
      stageTimes: [1703148000000, 1703150000000, 0, 0, 0],
      totalActiveTime: 1703150000000 - 1703148000000,
      idleTime: 700000,
    },
  ],
}

// Dados de falhas/paralizações mockados
const failureData = [
  {
    id: 1,
    line: "Linha 1",
    stage: 2,
    startTime: 1703145000000,
    endTime: 1703146800000, // 30 min depois
    duration: 1800000, // 30 minutos
    status: "Concluído",
  },
  {
    id: 2,
    line: "Linha 3",
    stage: 4,
    startTime: 1703147200000,
    endTime: 1703148400000, // 20 min depois
    duration: 1200000, // 20 minutos
    status: "Concluído",
  },
  {
    id: 3,
    line: "Linha 2",
    stage: 1,
    startTime: 1703149000000,
    endTime: null, // Ainda em aberto
    duration: Date.now() - 1703149000000,
    status: "Aberto",
  },
  {
    id: 4,
    line: "Linha 5",
    stage: 3,
    startTime: 1703150000000,
    endTime: 1703151500000, // 25 min depois
    duration: 1500000, // 25 minutos
    status: "Concluído",
  },
  {
    id: 5,
    line: "Linha 4",
    stage: 2,
    startTime: 1703151800000,
    endTime: 1703152600000, // 13 min depois
    duration: 800000, // 13 minutos
    status: "Concluído",
  },
  {
    id: 6,
    line: "Linha 1",
    stage: 5,
    startTime: 1703152000000,
    endTime: null, // Ainda em aberto
    duration: Date.now() - 1703152000000,
    status: "Aberto",
  },
]

const lineModels = {
  linha1: { model: "20RT COMPACT BR", description: "Climatizador Compacto 20.000 BTU/h" },
  linha2: { model: "30RT STANDARD BR", description: "Climatizador Standard 30.000 BTU/h" },
  linha3: { model: "40RT PREMIUM BR", description: "Climatizador Premium 40.000 BTU/h" },
  linha4: { model: "25RT ECO BR", description: "Climatizador Eco 25.000 BTU/h" },
  linha5: { model: "35RT INDUSTRIAL BR", description: "Climatizador Industrial 35.000 BTU/h" },
}

const lineColors = {
  "Linha 1": {
    primary: "bg-blue-600",
    secondary: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-600",
    progress: "bg-blue-600",
  },
  "Linha 2": {
    primary: "bg-green-600",
    secondary: "bg-green-100",
    text: "text-green-600",
    border: "border-green-600",
    progress: "bg-green-600",
  },
  "Linha 3": {
    primary: "bg-orange-600",
    secondary: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-600",
    progress: "bg-orange-600",
  },
  "Linha 4": {
    primary: "bg-purple-600",
    secondary: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-600",
    progress: "bg-purple-600",
  },
  "Linha 5": {
    primary: "bg-red-600",
    secondary: "bg-red-100",
    text: "text-red-600",
    border: "border-red-600",
    progress: "bg-red-600",
  },
}

const formatTimestamp = (timestamp: number) => {
  if (timestamp === 0) return "-"
  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
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

export default function ProductionMonitoring() {
  const [activeLine, setActiveLine] = useState("geral")
  const [dailyGoals, setDailyGoals] = useState<Record<string, string>>({})
  const [isSavingGoal, setIsSavingGoal] = useState<Record<string, boolean>>({})
  const [saveError, setSaveError] = useState<Record<string, string | null>>({})
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({})
  const { setDailyProductionGoal } = useProductionData()
  const { toast } = useToast()

  const getStageStatus = (currentStage: number, stage: number) => {
    if (stage < currentStage) return "completed"
    if (stage === currentStage) return "current"
    return "pending"
  }

  const getStageColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "current":
        return "bg-blue-500"
      default:
        return "bg-gray-300"
    }
  }

  const getProductionData = (line: string) => {
    switch (line) {
      case "linha1":
        return productionDataLinha1
      case "linha2":
        return productionDataLinha2
      case "linha3":
        return productionDataLinha3
      case "linha4":
        return productionDataLinha4
      case "linha5":
        return productionDataLinha5
      default:
        return productionDataLinha1
    }
  }

  const getAllProductionData = () => {
    return {
      linha1: productionDataLinha1,
      linha2: productionDataLinha2,
      linha3: productionDataLinha3,
      linha4: productionDataLinha4,
      linha5: productionDataLinha5,
    }
  }

  // Calcular tempo total de paralização por linha
  const getDowntimeByLine = () => {
    const downtime = {
      "Linha 1": 0,
      "Linha 2": 0,
      "Linha 3": 0,
      "Linha 4": 0,
      "Linha 5": 0,
    }

    failureData.forEach((failure) => {
      if (failure.status === "Concluído") {
        downtime[failure.line] += failure.duration
      } else {
        // Para falhas em aberto, calcular tempo até agora
        downtime[failure.line] += Date.now() - failure.startTime
      }
    })

    return downtime
  }

  // Função para salvar meta diária de uma linha
  const handleSaveDailyGoal = async (line: string) => {
    const goalValue = dailyGoals[line]
    if (!goalValue || !goalValue.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma meta válida",
        variant: "destructive",
      })
      return
    }

    const goalNumber = parseInt(goalValue, 10)
    if (isNaN(goalNumber) || goalNumber <= 0) {
      toast({
        title: "Erro",
        description: "A meta deve ser um número positivo",
        variant: "destructive",
      })
      return
    }

    // per-line saving state
    setIsSavingGoal(prev => ({ ...prev, [line]: true }))
    setSaveError(prev => ({ ...prev, [line]: null }))
    setSaveSuccess(prev => ({ ...prev, [line]: false }))

    try {
      const result = await setDailyProductionGoal(line, goalNumber)
      if (result) {
        toast({
          title: "Meta Salva",
          description: `Meta diária de ${goalNumber} unidades definida para ${line}`,
        })
        // Limpa o campo após salvar
        setDailyGoals(prev => ({ ...prev, [line]: "" }))
        setSaveSuccess(prev => ({ ...prev, [line]: true }))
        // limpa o estado de sucesso depois de um tempo
        setTimeout(() => setSaveSuccess(prev => ({ ...prev, [line]: false })), 3000)
      } else {
        setSaveError(prev => ({ ...prev, [line]: "Resposta negativa da API" }))
        toast({
          title: "Erro",
          description: "Falha ao salvar meta diária",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      const msg = error?.message || "Erro desconhecido"
      setSaveError(prev => ({ ...prev, [line]: msg }))
      toast({
        title: "Erro",
        description: "Falha ao salvar meta diária",
        variant: "destructive",
      })
    } finally {
      setIsSavingGoal(prev => ({ ...prev, [line]: false }))
    }
  }

  const productionData = getProductionData(activeLine)
  const completionPercentage = Math.round((productionData.dailyProduction / productionData.dailyTarget) * 100)

  const LineCard = ({ lineKey, data, colors }) => {
    const percentage = Math.round((data.dailyProduction / data.dailyTarget) * 100)
    const productsInProduction = data.products.filter((p) => p.currentStage < 5).length
    const productsCompleted = data.products.filter((p) => p.currentStage === 5).length

    return (
      <Card className={`${colors.secondary} border-2 ${colors.border} shadow-lg`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-2xl font-bold ${colors.text} flex items-center gap-2`}>
              <Factory className="h-6 w-6" />
              {lineKey.replace("linha", "Linha ").toUpperCase()}
            </CardTitle>
            <Badge className={`${colors.primary} text-white text-lg px-3 py-1`}>{percentage}%</Badge>
          </div>
          <CardDescription className="text-lg font-semibold text-gray-700">{lineModels[lineKey].model}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${colors.text}`}>{data.dailyProduction}</div>
              <div className="text-sm text-gray-600">Produzidos</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${colors.text}`}>{data.dailyTarget}</div>
              <div className="text-sm text-gray-600">Meta</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${colors.primary} transition-all duration-300`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{productsInProduction}</div>
              <div className="text-xs text-gray-600">Em Produção</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{productsCompleted}</div>
              <div className="text-xs text-gray-600">Concluídos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Monitoramento de Produção</h1>
          <p className="text-gray-600">Linha de Produção - Com Dados Reais Integrados</p>
        </div>

        <Tabs value={activeLine} onValueChange={setActiveLine} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="falhas" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Falhas
            </TabsTrigger>
            <TabsTrigger value="linha1" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Linha 1
            </TabsTrigger>
            <TabsTrigger value="linha2" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Linha 2
            </TabsTrigger>
            <TabsTrigger value="linha3" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Linha 3
            </TabsTrigger>
            <TabsTrigger value="linha4" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Linha 4
            </TabsTrigger>
            <TabsTrigger value="linha5" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Linha 5
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            {/* Resumo geral */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">
                    {Object.values(getAllProductionData()).reduce((acc, line) => acc + line.dailyProduction, 0)}
                  </div>
                  <div className="text-lg">Total Produzido</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">
                    {Object.values(getAllProductionData()).reduce((acc, line) => acc + line.dailyTarget, 0)}
                  </div>
                  <div className="text-lg">Meta Total</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">
                    {Math.round(
                      (Object.values(getAllProductionData()).reduce((acc, line) => acc + line.dailyProduction, 0) /
                        Object.values(getAllProductionData()).reduce((acc, line) => acc + line.dailyTarget, 0)) *
                        100,
                    )}
                    %
                  </div>
                  <div className="text-lg">Eficiência Geral</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">5</div>
                  <div className="text-lg">Linhas Ativas</div>
                </CardContent>
              </Card>
            </div>

            {/* Cards das linhas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(getAllProductionData()).map(([lineKey, data]) => (
                <LineCard
                  key={lineKey}
                  lineKey={lineKey}
                  data={data}
                  colors={lineColors[lineKey.replace("linha", "Linha ")]}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="falhas" className="space-y-6">
            {/* Cards de resumo de tempo de paralização por linha */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {Object.entries(getDowntimeByLine()).map(([line, downtime]) => {
                const colors = lineColors[line]
                const openFailures = failureData.filter((f) => f.line === line && f.status === "Aberto").length

                return (
                  <Card key={line} className={`${colors.secondary} border-2 ${colors.border}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-lg font-bold ${colors.text} flex items-center gap-2`}>
                        <Factory className="h-5 w-5" />
                        {line}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${colors.text} mb-1`}>{formatDuration(downtime)}</div>
                      <div className="text-sm text-gray-600 mb-2">Tempo Parado Hoje</div>
                      {openFailures > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {openFailures} Falha{openFailures > 1 ? "s" : ""} Aberta{openFailures > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Tabela de falhas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Registro de Falhas e Paralizações
                </CardTitle>
                <CardDescription>Histórico detalhado de todas as paralizações das linhas de produção</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failureData
                      .sort((a, b) => b.startTime - a.startTime) // Ordenar por mais recente
                      .map((failure) => {
                        const colors = lineColors[failure.line]
                        return (
                          <TableRow key={failure.id}>
                            <TableCell>
                              <Badge className={`${colors.primary} text-white`}>{failure.line}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Etapa {failure.stage}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-mono">{formatTimestamp(failure.startTime)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-mono">
                                {failure.endTime ? formatTimestamp(failure.endTime) : "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                {failure.status === "Aberto"
                                  ? formatDuration(Date.now() - failure.startTime)
                                  : formatDuration(failure.duration)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={failure.status === "Aberto" ? "destructive" : "default"}
                                className={failure.status === "Aberto" ? "animate-pulse" : ""}
                              >
                                {failure.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Abas individuais das linhas */}
          {["linha1", "linha2", "linha3", "linha4", "linha5"].map((line) => (
            <TabsContent key={line} value={line} className="space-y-6">
              {/* Cards de métricas principais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Produção Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {getProductionData(line).dailyProduction}
                    </div>
                    <p className="text-sm text-gray-600">unidades produzidas hoje</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Meta Diária
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-600 mb-2">{getProductionData(line).dailyTarget}</div>
                    <p className="text-sm text-gray-600">unidades planejadas</p>
                    
<div className="mt-3 flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Nova meta"
                        value={dailyGoals[line] || ""}
                        onChange={(e) => setDailyGoals(prev => ({ ...prev, [line]: e.target.value }))}
                        className="w-24 h-8 text-sm"
                        min="1"
                        aria-label={`Nova meta para ${line}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveDailyGoal(line)}
                        disabled={!dailyGoals[line] || isSavingGoal[line]}
                        className="h-8 text-xs flex items-center gap-2"
                      >
                        {isSavingGoal[line] ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar"}
                      </Button>
                      {/* feedback icons */}
                      {saveSuccess[line] && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {saveError[line] && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Cumprimento da Meta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {Math.round(
                        (getProductionData(line).dailyProduction / getProductionData(line).dailyTarget) * 100,
                      )}
                      %
                    </div>
                    <Progress
                      value={Math.round(
                        (getProductionData(line).dailyProduction / getProductionData(line).dailyTarget) * 100,
                      )}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                {/* Card do modelo do dia */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      Modelo do Dia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600 mb-2">{lineModels[line].model}</div>
                    <p className="text-sm text-gray-600">{lineModels[line].description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de produtos em produção */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtos em Linha de Produção</CardTitle>
                  <CardDescription>Status atual dos produtos e tempo por etapa</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                                      <TableHeader>
                    <TableRow>
                      <TableHead>Código do Produto</TableHead>
                      <TableHead>Etapa Atual</TableHead>
                      <TableHead>Etapa 1</TableHead>
                      <TableHead>Etapa 2</TableHead>
                      <TableHead>Etapa 3</TableHead>
                      <TableHead>Etapa 4</TableHead>
                      <TableHead>Etapa 5</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {getProductionData(line).products.map((product) => (
                        <EnhancedProductRow
                          key={product.serialNumber}
                          product={product}
                          getStageStatus={getStageStatus}
                          getStageColor={getStageColor}
                          formatTimestamp={formatTimestamp}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

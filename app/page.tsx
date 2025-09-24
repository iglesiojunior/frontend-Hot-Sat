// app/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Target, TrendingUp, Factory, Monitor, AlertTriangle, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { EnhancedProductRow } from "@/components/enhanced-product-row"
import { useProductionData } from "@/hooks/use-production-data"
import { useToast } from "@/hooks/use-toast"
import { ProductionAPI, ProductionLine } from "@/services/api"

// Mantenha os dados de modelos e cores, eles não são mockados
const lineModels = {
  "Linha 1": { model: "20RT COMPACT BR", description: "Climatizador Compacto 20.000 BTU/h" },
  "Linha 2": { model: "30RT STANDARD BR", description: "Climatizador Standard 30.000 BTU/h" },
  "Linha 3": { model: "40RT PREMIUM BR", description: "Climatizador Premium 40.000 BTU/h" },
  "Linha 4": { model: "25RT ECO BR", description: "Climatizador Eco 25.000 BTU/h" },
  "Linha 5": { model: "35RT INDUSTRIAL BR", description: "Climatizador Industrial 35.000 BTU/h" },
}

const lineColors: { [key: string]: any } = {
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

// Formata um timestamp para uma string de data
const formatTimestamp = (timestamp: number) => {
  if (!timestamp || timestamp === 0) return "-"
  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// Formata uma duração em milissegundos para uma string legível
const formatDuration = (milliseconds: number) => {
  if (isNaN(milliseconds) || milliseconds < 0) return "0m 0s";
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
  const { lines, metrics, failures, isLoading, error, fetchData } = useProductionData()
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
  
  const getDowntimeByLine = () => {
    const downtime: Record<string, number> = { "Linha 1": 0, "Linha 2": 0, "Linha 3": 0, "Linha 4": 0, "Linha 5": 0 };
    if (failures) {
      failures.forEach((failure) => {
        const lineName = lines.find(l => l.id === failure.lineId)?.name;
        if (lineName && downtime.hasOwnProperty(lineName)) {
           downtime[lineName] += failure.duration;
        }
      })
    }
    return downtime;
  }

  const handleSaveDailyGoal = async (lineKey: string) => {
    const lineId = parseInt(lineKey.replace("linha", ""), 10)
    const goalValue = dailyGoals[lineKey]
    if (!goalValue || !goalValue.trim()) {
      toast({ title: "Erro", description: "Digite uma meta válida", variant: "destructive" })
      return
    }

    const goalNumber = parseInt(goalValue, 10)
    if (isNaN(goalNumber) || goalNumber <= 0) {
      toast({ title: "Erro", description: "A meta deve ser um número positivo", variant: "destructive" })
      return
    }

    setIsSavingGoal(prev => ({ ...prev, [lineKey]: true }))
    try {
      await ProductionAPI.setDailyProductionGoal(lineId, goalNumber)
      toast({
        title: "Meta Salva",
        description: `Meta diária de ${goalNumber} unidades definida para ${lineKey}`,
      })
      setDailyGoals(prev => ({ ...prev, [lineKey]: "" }))
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar meta diária",
        variant: "destructive",
      })
    } finally {
      setIsSavingGoal(prev => ({ ...prev, [lineKey]: false }))
    }
  }

  const LineCard = ({ data }: { data: ProductionLine }) => {
    const colors = lineColors[data.name] || {};
    const percentage = data.targetProduction > 0 ? Math.round((data.currentProduction / data.targetProduction) * 100) : 0;
    const productsInProduction = data.products.filter(p => p.status === 'in_production').length;
    const productsCompleted = data.products.filter(p => p.status === 'completed').length;
  
    return (
      <Card className={`${colors.secondary} border-2 ${colors.border} shadow-lg`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-2xl font-bold ${colors.text} flex items-center gap-2`}>
              <Factory className="h-6 w-6" />
              {data.name.toUpperCase()}
            </CardTitle>
            <Badge className={`${colors.primary} text-white text-lg px-3 py-1`}>{percentage}%</Badge>
          </div>
          <CardDescription className="text-lg font-semibold text-gray-700">{lineModels[data.name as keyof typeof lineModels]?.model}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${colors.text}`}>{data.currentProduction}</div>
              <div className="text-sm text-gray-600">Produzidos</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${colors.text}`}>{data.targetProduction}</div>
              <div className="text-sm text-gray-600">Meta</div>
            </div>
          </div>
          <Progress value={percentage} />
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
    );
  };
  
  if (isLoading && lines.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="ml-4 text-lg">Carregando dados do sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar dados</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Monitoramento de Produção</h1>
            <p className="text-gray-600">Linha de Produção</p>
          </div>
          <img
            src="/cropped-hotsat-logo.png"
            alt="Hotsat Logo"
            className="h-16 w-auto"
          />
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
            {lines.map((line) => (
              <TabsTrigger key={line.id} value={`linha${line.id}`} className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                {line.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{metrics.totalProduced}</div>
                    <div className="text-lg">Total Produzido</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{metrics.totalTarget}</div>
                    <div className="text-lg">Meta Total</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{metrics.overallEfficiency}%</div>
                    <div className="text-lg">Eficiência Geral</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{metrics.activeLines}</div>
                    <div className="text-lg">Linhas Ativas</div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lines.map((line) => (
                <LineCard key={line.id} data={line} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="falhas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {Object.entries(getDowntimeByLine()).map(([lineName, downtime]) => {
                const colors = lineColors[lineName] || { primary: "bg-gray-600", secondary: "bg-gray-100", text: "text-gray-600", border: "border-gray-600" };
                const openFailures = failures.filter(f => lines.find(l => l.id === f.lineId)?.name === lineName && f.status === "open").length;
                return (
                  <Card key={lineName} className={`${colors.secondary} border-2 ${colors.border}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-lg font-bold ${colors.text} flex items-center gap-2`}>
                        <Factory className="h-5 w-5" />
                        {lineName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${colors.text} mb-1`}>{formatDuration(downtime)}</div>
                      <div className="text-sm text-gray-600 mb-2">Tempo Parado Hoje</div>
                      {openFailures > 0 && (<Badge variant="destructive" className="text-xs">{openFailures} Falha{openFailures > 1 ? "s" : ""} Aberta{openFailures > 1 ? "s" : ""}</Badge>)}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
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
                    {failures
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((failure) => {
                        const lineName = lines.find(l => l.id === failure.lineId)?.name || "Linha Desconhecida";
                        const colors = lineColors[lineName] || { primary: "bg-gray-600", text: "text-gray-600" };
                        const startTimeMs = new Date(failure.startTime).getTime();
                        const endTimeMs = failure.endTime ? new Date(failure.endTime).getTime() : null;
                        const duration = failure.status === "open" ? Date.now() - startTimeMs : (endTimeMs || 0) - startTimeMs;

                        return (
                          <TableRow key={failure.id}>
                            <TableCell>
                              <Badge className={`${colors.primary} text-white`}>{lineName}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Etapa {failure.stage}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-mono">{formatTimestamp(startTimeMs)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-mono">
                                {endTimeMs ? formatTimestamp(endTimeMs) : "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{formatDuration(duration)}</span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={failure.status === "open" ? "destructive" : "default"}
                                className={failure.status === "open" ? "animate-pulse" : ""}
                              >
                                {failure.status === "open" ? "Aberto" : "Concluído"}
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

          {lines.map((lineData) => {
            const lineKey = `linha${lineData.id}`;
            const completionPercentage = lineData.targetProduction > 0 ? Math.round((lineData.currentProduction / lineData.targetProduction) * 100) : 0;
            const isLineSavingGoal = isSavingGoal[lineKey];

            return (
              <TabsContent key={lineData.id} value={lineKey} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Produção Atual
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-blue-600 mb-2">{lineData.currentProduction}</div>
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
                      <div className="text-4xl font-bold text-green-600 mb-2">{lineData.targetProduction}</div>
                      <p className="text-sm text-gray-600">unidades planejadas</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Nova meta"
                          value={dailyGoals[lineKey] || ""}
                          onChange={(e) => setDailyGoals(prev => ({ ...prev, [lineKey]: e.target.value }))}
                          className="w-24 h-8 text-sm"
                          min="1"
                          aria-label={`Nova meta para ${lineData.name}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveDailyGoal(lineKey)}
                          disabled={!dailyGoals[lineKey] || isLineSavingGoal}
                          className="h-8 text-xs flex items-center gap-2"
                        >
                          {isLineSavingGoal ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar"}
                        </Button>
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
                      <div className="text-4xl font-bold text-orange-600 mb-2">{completionPercentage}%</div>
                      <Progress value={completionPercentage} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Factory className="h-4 w-4" />
                        Modelo do Dia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600 mb-2">{lineModels[lineData.name as keyof typeof lineModels]?.model}</div>
                      <p className="text-sm text-gray-600">{lineModels[lineData.name as keyof typeof lineModels]?.description}</p>
                    </CardContent>
                  </Card>
                </div>

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
                        {lineData.products.map((product) => (
                          <EnhancedProductRow
                            key={product.id}
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
            );
          })}
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}
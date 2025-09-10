"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  ProductionStatusIndicator, 
  ProductionStatusList, 
  useProductionStatus 
} from "@/components/production-status-indicator"
import { 
  useProductionData, 
  type ProductionLine, 
  type Product, 
  type FailureRecord 
} from "@/services/api"
import { Plus, AlertTriangle, Settings, RefreshCw, TrendingUp } from "lucide-react"

export default function ExemploComponentesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [isAddFailureDialogOpen, setIsAddFailureDialogOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null)

  // Hooks para gerenciar dados
  const { 
    lines, 
    metrics, 
    failures, 
    isLoading, 
    error, 
    fetchData, 
    updateLineStatus, 
    addProduct, 
    reportFailure, 
    resolveFailure 
  } = useProductionData()

  const { 
    statuses, 
    addStatus, 
    updateStatus, 
    removeStatus 
  } = useProductionStatus()

  // Estado para formulários
  const [newProduct, setNewProduct] = useState({
    serialNumber: "",
    model: "",
    currentStage: 1,
  })

  const [newFailure, setNewFailure] = useState({
    lineId: "",
    stage: 1,
    description: "",
    severity: "medium" as const,
  })

  // Função para adicionar produto
  const handleAddProduct = async () => {
    if (!selectedLine || !newProduct.serialNumber || !newProduct.model) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const product: Omit<Product, "id"> = {
      serialNumber: newProduct.serialNumber,
      model: newProduct.model,
      currentStage: newProduct.currentStage,
      totalStages: 5,
      stageTimes: [Date.now(), 0, 0, 0, 0],
      totalActiveTime: 0,
      idleTime: 0,
      status: "in_production",
    }

    const result = await addProduct(selectedLine.id, product)
    if (result) {
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      })
      setNewProduct({ serialNumber: "", model: "", currentStage: 1 })
      setIsAddProductDialogOpen(false)
    } else {
      toast({
        title: "Erro",
        description: "Falha ao adicionar produto",
        variant: "destructive",
      })
    }
  }

  // Função para reportar falha
  const handleReportFailure = async () => {
    if (!newFailure.lineId || !newFailure.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const failure: Omit<FailureRecord, "id"> = {
      lineId: newFailure.lineId,
      stage: newFailure.stage,
      startTime: new Date(),
      duration: 0,
      status: "open",
      description: newFailure.description,
      severity: newFailure.severity,
    }

    const result = await reportFailure(failure)
    if (result) {
      toast({
        title: "Sucesso",
        description: "Falha registrada com sucesso!",
      })
      setNewFailure({ lineId: "", stage: 1, description: "", severity: "medium" })
      setIsAddFailureDialogOpen(false)
    } else {
      toast({
        title: "Erro",
        description: "Falha ao registrar problema",
        variant: "destructive",
      })
    }
  }

  // Função para atualizar status da linha
  const handleStatusUpdate = async (lineId: string, newStatus: ProductionLine["status"]) => {
    const success = await updateLineStatus(lineId, newStatus)
    if (success) {
      toast({
        title: "Sucesso",
        description: `Status da linha atualizado para ${newStatus}`,
      })
    } else {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive",
      })
    }
  }

  // Função para resolver falha
  const handleResolveFailure = async (failureId: string) => {
    const success = await resolveFailure(failureId)
    if (success) {
      toast({
        title: "Sucesso",
        description: "Falha resolvida com sucesso!",
      })
    } else {
      toast({
        title: "Erro",
        description: "Falha ao resolver problema",
        variant: "destructive",
      })
    }
  }

  // Função para recarregar dados
  const handleRefresh = () => {
    fetchData()
    toast({
      title: "Atualizando",
      description: "Dados sendo recarregados...",
    })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar dados</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Exemplo de Componentes React
              </h1>
              <p className="text-gray-600">
                Demonstração de como criar e usar componentes React com dados reais
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas Gerais */}
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

        {/* Tabs principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="lines" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Linhas de Produção
            </TabsTrigger>
            <TabsTrigger value="failures" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Falhas
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Componentes
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status das Linhas de Produção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lines.map((line) => (
                    <ProductionStatusIndicator
                      key={line.id}
                      status={{
                        id: line.id,
                        name: line.name,
                        currentProduction: line.currentProduction,
                        targetProduction: line.targetProduction,
                        efficiency: line.efficiency,
                        status: line.status,
                        lastUpdate: line.lastUpdate,
                        issues: line.issues,
                      }}
                      showDetails={true}
                      onStatusClick={(status) => {
                        const line = lines.find(l => l.id === status.id)
                        if (line) setSelectedLine(line)
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Linhas de Produção */}
          <TabsContent value="lines" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Linhas</h2>
              <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Produto</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="line">Linha de Produção</Label>
                      <Select
                        value={selectedLine?.id || ""}
                        onValueChange={(value) => {
                          const line = lines.find(l => l.id === value)
                          setSelectedLine(line || null)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma linha" />
                        </SelectTrigger>
                        <SelectContent>
                          {lines.map((line) => (
                            <SelectItem key={line.id} value={line.id}>
                              {line.name} - {line.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="serialNumber">Número de Série</Label>
                      <Input
                        id="serialNumber"
                        value={newProduct.serialNumber}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, serialNumber: e.target.value }))}
                        placeholder="Ex: 1209F25A16806100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        value={newProduct.model}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="Ex: MOD:20RT COMPACT BR"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stage">Estágio Inicial</Label>
                      <Select
                        value={newProduct.currentStage.toString()}
                        onValueChange={(value) => setNewProduct(prev => ({ ...prev, currentStage: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((stage) => (
                            <SelectItem key={stage} value={stage.toString()}>
                              Estágio {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddProduct} className="flex-1">
                        Adicionar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddProductDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lines.map((line) => (
                <Card key={line.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{line.name}</CardTitle>
                      <div className="flex gap-2">
                        <Select
                          value={line.status}
                          onValueChange={(value) => handleStatusUpdate(line.id, value as ProductionLine["status"])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="running">Em Produção</SelectItem>
                            <SelectItem value="stopped">Parado</SelectItem>
                            <SelectItem value="maintenance">Manutenção</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {line.currentProduction}
                          </div>
                          <div className="text-sm text-gray-600">Produzidos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {line.targetProduction}
                          </div>
                          <div className="text-sm text-gray-600">Meta</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Eficiência</span>
                          <span>{line.efficiency}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${line.efficiency}%` }}
                          />
                        </div>
                      </div>

                      {line.issues.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-red-600">Problemas:</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {line.issues.map((issue, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Produtos em Linha:</div>
                        <div className="space-y-2">
                          {line.products.length > 0 ? (
                            line.products.map((product) => (
                              <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <div className="font-mono text-sm">{product.serialNumber}</div>
                                  <div className="text-xs text-gray-600">Estágio {product.currentStage}/5</div>
                                </div>
                                <Badge variant={product.status === "completed" ? "default" : "secondary"}>
                                  {product.status === "completed" ? "Concluído" : "Em Produção"}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-4">
                              Nenhum produto em produção
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Falhas */}
          <TabsContent value="failures" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Registro de Falhas</h2>
              <Dialog open={isAddFailureDialogOpen} onOpenChange={setIsAddFailureDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reportar Falha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reportar Nova Falha</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="failureLine">Linha</Label>
                      <Select
                        value={newFailure.lineId}
                        onValueChange={(value) => setNewFailure(prev => ({ ...prev, lineId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma linha" />
                        </SelectTrigger>
                        <SelectContent>
                          {lines.map((line) => (
                            <SelectItem key={line.id} value={line.id}>
                              {line.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="failureStage">Estágio</Label>
                      <Select
                        value={newFailure.stage.toString()}
                        onValueChange={(value) => setNewFailure(prev => ({ ...prev, stage: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((stage) => (
                            <SelectItem key={stage} value={stage.toString()}>
                              Estágio {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="severity">Severidade</Label>
                      <Select
                        value={newFailure.severity}
                        onValueChange={(value) => setNewFailure(prev => ({ ...prev, severity: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={newFailure.description}
                        onChange={(e) => setNewFailure(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o problema..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleReportFailure} className="flex-1">
                        Reportar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddFailureDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {failures.map((failure) => {
                const line = lines.find(l => l.id === failure.lineId)
                const severityColors = {
                  low: "bg-green-100 text-green-800 border-green-200",
                  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  high: "bg-orange-100 text-orange-800 border-orange-200",
                  critical: "bg-red-100 text-red-800 border-red-200",
                }

                return (
                  <Card key={failure.id} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{line?.name || "Linha Desconhecida"}</CardTitle>
                        <Badge className={severityColors[failure.severity]}>
                          {failure.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm font-semibold">Estágio {failure.stage}</div>
                        <div className="text-sm text-gray-600">{failure.description}</div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <div>Início: {failure.startTime.toLocaleString("pt-BR")}</div>
                        {failure.endTime && (
                          <div>Fim: {failure.endTime.toLocaleString("pt-BR")}</div>
                        )}
                        <div>Duração: {Math.round(failure.duration / 60000)} minutos</div>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant={failure.status === "open" ? "destructive" : "default"}>
                          {failure.status === "open" ? "Aberto" : "Resolvido"}
                        </Badge>
                        {failure.status === "open" && (
                          <Button
                            size="sm"
                            onClick={() => handleResolveFailure(failure.id)}
                            className="ml-auto"
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Tab: Componentes */}
          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demonstração de Componentes Personalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Componente ProductionStatusIndicator</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lines.slice(0, 3).map((line) => (
                        <ProductionStatusIndicator
                          key={line.id}
                          status={{
                            id: line.id,
                            name: line.name,
                            currentProduction: line.currentProduction,
                            targetProduction: line.targetProduction,
                            efficiency: line.efficiency,
                            status: line.status,
                            lastUpdate: line.lastUpdate,
                            issues: line.issues,
                          }}
                          showDetails={true}
                          onStatusClick={(status) => {
                            toast({
                              title: "Clique detectado",
                              description: `Você clicou em ${status.name}`,
                            })
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Hook useProductionStatus</h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const newStatus = {
                              id: `status-${Date.now()}`,
                              name: `Status ${statuses.length + 1}`,
                              currentProduction: Math.floor(Math.random() * 100) + 50,
                              targetProduction: 150,
                              efficiency: 85,
                              status: "running" as const,
                              lastUpdate: new Date(),
                              issues: [],
                            }
                            addStatus(newStatus)
                            toast({
                              title: "Status Adicionado",
                              description: "Novo status de produção criado",
                            })
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Status
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (statuses.length > 0) {
                              removeStatus(statuses[statuses.length - 1].id)
                              toast({
                                title: "Status Removido",
                                description: "Último status removido",
                              })
                            }
                          }}
                        >
                          Remover Último
                        </Button>
                      </div>
                      
                      <ProductionStatusList
                        statuses={statuses}
                        onStatusClick={(status) => {
                          toast({
                            title: "Status Clicado",
                            description: `Status: ${status.name}`,
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
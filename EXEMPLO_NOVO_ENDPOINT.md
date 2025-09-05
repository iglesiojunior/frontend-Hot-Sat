# 🔧 Exemplo Prático: Implementando Novo Endpoint de Qualidade

## 📋 O que vamos implementar
Um sistema completo de controle de qualidade que inclui:
- ✅ Verificação de qualidade de produtos
- 📊 Relatórios de qualidade
- 🔔 Alertas automáticos
- 📈 Métricas de performance

---

## 🚀 Passo a Passo Completo

### **Passo 1: Backend - Criar Nova Rota**

Crie o arquivo `src/routes/quality.routes.ts` no seu backend:

```typescript
import express from 'express'
import { z } from 'zod'

const router = express.Router()

// Schema de validação
const qualityCheckSchema = z.object({
  productId: z.string().min(1, "ID do produto é obrigatório"),
  qualityScore: z.number().min(0).max(100, "Score deve estar entre 0 e 100"),
  notes: z.string().optional(),
  inspectorId: z.string().min(1, "ID do inspetor é obrigatório"),
  category: z.enum(['visual', 'functional', 'packaging', 'safety'])
})

// POST /quality-check - Submeter verificação de qualidade
router.post('/quality-check', async (req, res) => {
  try {
    // Validar dados de entrada
    const validatedData = qualityCheckSchema.parse(req.body)
    
    // Simular salvamento no banco (substitua pela sua lógica real)
    const qualityCheck = {
      id: `qc_${Date.now()}`,
      ...validatedData,
      checkedAt: new Date(),
      status: validatedData.qualityScore >= 80 ? 'passed' : 'failed'
    }
    
    // Aqui você salvaria no seu banco de dados
    // await qualityCheckRepository.save(qualityCheck)
    
    res.status(201).json({
      success: true,
      data: qualityCheck,
      message: 'Verificação de qualidade registrada com sucesso'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      })
    }
    
    console.error('Erro interno:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// GET /quality-reports - Obter relatórios de qualidade
router.get('/quality-reports', async (req, res) => {
  try {
    const { period = 'daily', start, end } = req.query
    
    // Simular dados de relatório (substitua pela sua lógica real)
    const report = {
      period: period as string,
      totalChecks: 150,
      passedChecks: 135,
      failedChecks: 15,
      averageScore: 87.5,
      topIssues: [
        { category: 'visual', count: 8, percentage: 53.3 },
        { category: 'functional', count: 4, percentage: 26.7 },
        { category: 'packaging', count: 3, percentage: 20.0 }
      ],
      generatedAt: new Date()
    }
    
    res.json({
      success: true,
      data: report
    })
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar relatório'
    })
  }
})

// GET /quality-check/:id - Obter verificação específica
router.get('/quality-check/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Simular busca no banco (substitua pela sua lógica real)
    const qualityCheck = {
      id,
      productId: 'prod_123',
      qualityScore: 85,
      notes: 'Produto aprovado com pequenas observações',
      inspectorId: 'insp_456',
      category: 'visual',
      checkedAt: new Date(),
      status: 'passed'
    }
    
    res.json({
      success: true,
      data: qualityCheck
    })
    
  } catch (error) {
    console.error('Erro ao buscar verificação:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

export default router
```

### **Passo 2: Backend - Registrar Nova Rota**

No seu arquivo principal `src/app.ts` ou `src/index.ts`:

```typescript
import express from 'express'
import qualityRoutes from './routes/quality.routes'

const app = express()

// ... outras configurações ...

// Registrar nova rota
app.use('/api/quality', qualityRoutes)

// ... resto do código ...
```

### **Passo 3: Frontend - Criar Interfaces**

No arquivo `services/production-api.ts`, adicione:

```typescript
// Novas interfaces para qualidade
export interface QualityCheck {
  id: string
  productId: string
  qualityScore: number
  notes?: string
  inspectorId: string
  category: 'visual' | 'functional' | 'packaging' | 'safety'
  checkedAt: Date
  status: 'passed' | 'failed'
}

export interface QualityReport {
  period: string
  totalChecks: number
  passedChecks: number
  failedChecks: number
  averageScore: number
  topIssues: Array<{
    category: string
    count: number
    percentage: number
  }>
  generatedAt: Date
}

export interface QualityCheckRequest {
  productId: string
  qualityScore: number
  notes?: string
  inspectorId: string
  category: 'visual' | 'functional' | 'packaging' | 'safety'
}
```

### **Passo 4: Frontend - Adicionar Métodos na API**

Ainda no `services/production-api.ts`, adicione à classe `ProductionAPI`:

```typescript
export class ProductionAPI {
  // ... métodos existentes ...

  // Submeter verificação de qualidade
  static async submitQualityCheck(check: QualityCheckRequest): Promise<QualityCheck | null> {
    try {
      const response = await fetch(`${this.baseUrl}/quality/quality-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(check),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao submeter verificação de qualidade')
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Erro ao submeter verificação de qualidade:', error)
      throw error
    }
  }

  // Obter relatórios de qualidade
  static async getQualityReports(period: string = 'daily'): Promise<QualityReport | null> {
    try {
      const response = await fetch(`${this.baseUrl}/quality/quality-reports?period=${period}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao obter relatórios de qualidade')
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Erro ao obter relatórios de qualidade:', error)
      throw error
    }
  }

  // Obter verificação específica
  static async getQualityCheck(id: string): Promise<QualityCheck | null> {
    try {
      const response = await fetch(`${this.baseUrl}/quality/quality-check/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao obter verificação de qualidade')
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Erro ao obter verificação de qualidade:', error)
      throw error
    }
  }
}
```

### **Passo 5: Frontend - Criar Hook Personalizado**

Crie o arquivo `hooks/use-quality-data.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import { ProductionAPI, QualityCheck, QualityReport, QualityCheckRequest } from '../services/production-api'

export function useQualityData() {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([])
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Submeter verificação de qualidade
  const submitQualityCheck = useCallback(async (check: QualityCheckRequest): Promise<QualityCheck | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await ProductionAPI.submitQualityCheck(check)
      if (result) {
        setQualityChecks(prev => [result, ...prev])
        return result
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
    return null
  }, [])

  // Buscar relatórios de qualidade
  const fetchQualityReports = useCallback(async (period: string = 'daily') => {
    setLoading(true)
    setError(null)
    
    try {
      const report = await ProductionAPI.getQualityReports(period)
      setQualityReport(report)
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar verificação específica
  const fetchQualityCheck = useCallback(async (id: string): Promise<QualityCheck | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const check = await ProductionAPI.getQualityCheck(id)
      return check
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    qualityChecks,
    qualityReport,
    loading,
    error,
    submitQualityCheck,
    fetchQualityReports,
    fetchQualityCheck,
    clearError
  }
}
```

### **Passo 6: Frontend - Criar Componente de Interface**

Crie o arquivo `components/quality-control.tsx`:

```typescript
'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { useQualityData } from '../hooks/use-quality-data'
import { QualityCheckRequest } from '../services/production-api'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function QualityControl() {
  const { 
    qualityReport, 
    loading, 
    error, 
    submitQualityCheck, 
    fetchQualityReports,
    clearError 
  } = useQualityData()

  const [formData, setFormData] = useState<QualityCheckRequest>({
    productId: '',
    qualityScore: 0,
    notes: '',
    inspectorId: '',
    category: 'visual'
  })

  useEffect(() => {
    fetchQualityReports('daily')
  }, [fetchQualityReports])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await submitQualityCheck(formData)
      
      // Limpar formulário após sucesso
      setFormData({
        productId: '',
        qualityScore: 0,
        notes: '',
        inspectorId: '',
        category: 'visual'
      })
      
      // Recarregar relatório
      fetchQualityReports('daily')
      
    } catch (error) {
      console.error('Erro ao submeter verificação:', error)
    }
  }

  const handleInputChange = (field: keyof QualityCheckRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Verificação */}
      <Card>
        <CardHeader>
          <CardTitle>Nova Verificação de Qualidade</CardTitle>
          <CardDescription>
            Submeta uma nova verificação de qualidade para um produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">ID do Produto</Label>
                <Input
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  placeholder="Ex: PROD_001"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inspectorId">ID do Inspetor</Label>
                <Input
                  id="inspectorId"
                  value={formData.inspectorId}
                  onChange={(e) => handleInputChange('inspectorId', e.target.value)}
                  placeholder="Ex: INSP_001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="functional">Funcional</SelectItem>
                    <SelectItem value="packaging">Embalagem</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qualityScore">Score de Qualidade (0-100)</Label>
                <Input
                  id="qualityScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.qualityScore}
                  onChange={(e) => handleInputChange('qualityScore', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações sobre a verificação..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submetendo...' : 'Submeter Verificação'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Relatório de Qualidade */}
      {qualityReport && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Qualidade - {qualityReport.period}</CardTitle>
            <CardDescription>
              Estatísticas geradas em {qualityReport.generatedAt.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {qualityReport.totalChecks}
                </div>
                <div className="text-sm text-gray-600">Total de Verificações</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-5 w-5" />
                  {qualityReport.passedChecks}
                </div>
                <div className="text-sm text-gray-600">Aprovados</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                  <XCircle className="h-5 w-5" />
                  {qualityReport.failedChecks}
                </div>
                <div className="text-sm text-gray-600">Reprovados</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {qualityReport.averageScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Score Médio</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Principais Problemas:</h4>
              {qualityReport.topIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{issue.category}</Badge>
                    <span className="text-sm text-gray-600">
                      {issue.count} ocorrências
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {issue.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### **Passo 7: Frontend - Integrar na Página Principal**

No seu `app/page.tsx`, adicione:

```typescript
import { QualityControl } from '../components/quality-control'

// ... dentro do seu componente principal ...
<TabsContent value="quality" className="space-y-4">
  <QualityControl />
</TabsContent>
```

---

## 🎯 Como Testar

1. **Inicie o backend** na porta 3001
2. **Inicie o frontend** na porta 3000
3. **Acesse a aba "Quality"** na sua aplicação
4. **Preencha o formulário** com dados de teste
5. **Submeta a verificação** e veja os resultados
6. **Verifique o console** para logs de API

---

## 🔧 Personalizações Possíveis

- **Adicionar validações mais complexas**
- **Implementar sistema de notificações**
- **Adicionar filtros por data/período**
- **Criar gráficos de tendência**
- **Implementar exportação de relatórios**
- **Adicionar sistema de aprovação em múltiplos níveis**

---

*Este exemplo mostra o fluxo completo de implementação de um novo endpoint. Use como base para criar outros sistemas!* 🚀 
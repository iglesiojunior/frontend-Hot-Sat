# 📋 Documentação: Meta Diária de Produção - Frontend

## 🎯 O que foi implementado

Sistema de definição de metas diárias para cada linha de produção, onde:
- ✅ Cada linha tem um campo de input para definir sua meta diária
- ✅ O valor é validado (deve ser número positivo)
- ✅ O valor é enviado para a API via POST
- ✅ Feedback visual com toast de sucesso/erro
- ✅ Campo é limpo após salvar com sucesso

---

## 🚀 Como funciona no Frontend

### **1. Campo de Input**
Cada linha de produção tem um campo de input no card de "Meta Diária":

```tsx
<Input
  type="number"
  placeholder="Nova meta"
  value={dailyGoals[line] || ""}
  onChange={(e) => setDailyGoals(prev => ({ ...prev, [line]: e.target.value }))}
  className="w-24 h-8 text-sm"
  min="1"
 />
```

### **2. Estado para gerenciar as metas**
```tsx
const [dailyGoals, setDailyGoals] = useState<Record<string, string>>({})
```

### **3. Botão para salvar**
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => handleSaveDailyGoal(line)}
  disabled={!dailyGoals[line] || isSavingGoal}
  className="h-8 text-xs"
>
  Salvar
</Button>
```

---

## 🔍 **EXPLICAÇÃO DETALHADA: Como funciona o envio HTTP para a API**

### **📋 Fluxo completo passo a passo:**

```
1. Usuário digita "150" no campo → 2. Clica em "Salvar" → 3. handleSaveDailyGoal é executada
     ↓
4. Validações são feitas → 5. setDailyProductionGoal é chamada → 6. Requisição HTTP é enviada
     ↓
7. Backend processa → 8. Resposta retorna → 9. Frontend mostra resultado
```

### **🔧 Vamos analisar cada parte do código:**

#### **Parte 1: Função que é executada quando clica em "Salvar"**
```tsx
const handleSaveDailyGoal = async (line: string) => {
  // 1. PEGAR O VALOR DO CAMPO
  const goalValue = dailyGoals[line]  // Exemplo: "150"
  
  // 2. VALIDAR SE NÃO ESTÁ VAZIO
  if (!goalValue || !goalValue.trim()) {
    toast({ title: "Erro", description: "Digite uma meta válida", variant: "destructive" })
    return
  }

  // 3. CONVERTER PARA NÚMERO E VALIDAR
  const goalNumber = parseInt(goalValue)  // Converte "150" para 150
  if (isNaN(goalNumber) || goalNumber <= 0) {
    toast({ title: "Erro", description: "A meta deve ser um número positivo", variant: "destructive" })
    return
  }

  // 4. ENVIAR PARA A API (AQUI É ONDE ACONTECE A REQUISIÇÃO HTTP!)
  setIsSavingGoal(true)
  try {
    // ⭐ ESTA É A FUNÇÃO QUE ENVIA A REQUISIÇÃO HTTP!
    const result = await setDailyProductionGoal(line, goalNumber)
    
    if (result) {
      toast({ title: "Meta Salva", description: `Meta diária de ${goalNumber} unidades definida para ${line}` })
      setDailyGoals(prev => ({ ...prev, [line]: "" }))
    }
  } catch (error) {
    toast({ title: "Erro", description: "Falha ao salvar meta diária", variant: "destructive" })
  } finally {
    setIsSavingGoal(false)
  }
}
```

#### **Parte 2: A função que realmente envia a requisição HTTP**
```tsx
// ⭐ ESTA FUNÇÃO VEM DO HOOK useProductionData
const { setDailyProductionGoal } = useProductionData()

// ⭐ QUANDO ELA É CHAMADA, ELA EXECUTA O CÓDIGO ABAIXO:
const setDailyProductionGoal = async (lineId: string, goal: number) => {
  try {
    // ⭐ AQUI É ONDE A REQUISIÇÃO HTTP É FEITA!
    const response = await fetch(`${API_BASE_URL}/api/linhas/${lineId}/meta-diaria`, {
      method: 'POST',                    // ⭐ MÉTODO HTTP: POST
      headers: {                         // ⭐ CABEÇALHOS DA REQUISIÇÃO
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({             // ⭐ DADOS ENVIADOS NO CORPO
        metaDiaria: goal,                // Exemplo: 150
        data: new Date().toISOString().split('T')[0]  // Exemplo: "2025-01-13"
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
```

### **🌐 O que acontece quando a requisição HTTP é enviada:**

#### **1. URL da requisição:**
```
http://localhost:3001/api/linhas/linha1/meta-diaria
```

#### **2. Método HTTP:**
```
POST (envia dados para o servidor)
```

#### **3. Cabeçalhos (Headers):**
```
Content-Type: application/json
```

#### **4. Corpo da requisição (Body):**
```json
{
  "metaDiaria": 150,
  "data": "2025-01-13"
}
```

#### **5. O que o fetch() faz:**
- **Cria uma requisição HTTP** para o servidor
- **Envia os dados** no formato JSON
- **Aguarda a resposta** do servidor
- **Retorna o resultado** para o frontend

---

## 📤 Como enviar a requisição para o Backend

### **Função para salvar meta diária:**

```tsx
const handleSaveDailyGoal = async (line: string) => {
  // 1. Pegar o valor do campo
  const goalValue = dailyGoals[line]
  
  // 2. Validar se não está vazio
  if (!goalValue || !goalValue.trim()) {
    toast({
      title: "Erro",
      description: "Digite uma meta válida",
      variant: "destructive",
    })
    return
  }

  // 3. Converter para número e validar
  const goalNumber = parseInt(goalValue)
  if (isNaN(goalNumber) || goalNumber <= 0) {
    toast({
      title: "Erro",
      description: "A meta deve ser um número positivo",
      variant: "destructive",
    })
    return
  }

  // 4. Enviar para a API
  setIsSavingGoal(true)
  try {
    const result = await setDailyProductionGoal(line, goalNumber)
    if (result) {
      toast({
        title: "Meta Salva",
        description: `Meta diária de ${goalNumber} unidades definida para ${line}`,
      })
      // 5. Limpar o campo após salvar
      setDailyGoals(prev => ({ ...prev, [line]: "" }))
    }
  } catch (error) {
    toast({
      title: "Erro",
      description: "Falha ao salvar meta diária",
      variant: "destructive",
    })
  } finally {
    setIsSavingGoal(false)
  }
}
```

---

## 🔧 Como implementar no seu projeto

### **Passo 1: Adicionar os imports necessários**

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProductionData } from "@/hooks/use-production-data"
import { useToast } from "@/hooks/use-toast"
```

### **Passo 2: Adicionar o estado e hooks**

```tsx
export default function SeuComponente() {
  // Estado para gerenciar as metas de cada linha
  const [dailyGoals, setDailyGoals] = useState<Record<string, string>>({})
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  
  // Hook para enviar dados para a API
  const { setDailyProductionGoal } = useProductionData()
  
  // Hook para mostrar mensagens de toast
  const { toast } = useToast()

  // ... resto do código
}
```

### **Passo 3: Adicionar o campo de input no card de meta diária**

```tsx
<Card className="border-l-4 border-l-green-500">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
      <Target className="h-4 w-4" />
      Meta Diária
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-4xl font-bold text-green-600 mb-2">
      {getProductionData(line).dailyTarget}
    </div>
    <p className="text-sm text-gray-600">unidades planejadas</p>
    
    {/* Campo de input para nova meta */}
    <div className="mt-3 flex items-center gap-2">
      <Input
        type="number"
        placeholder="Nova meta"
        value={dailyGoals[line] || ""}
        onChange={(e) => setDailyGoals(prev => ({ ...prev, [line]: e.target.value }))}
        className="w-24 h-8 text-sm"
        min="1"
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleSaveDailyGoal(line)}
        disabled={!dailyGoals[line] || isSavingGoal}
        className="h-8 text-xs"
      >
        Salvar
      </Button>
    </div>
  </CardContent>
</Card>
```

### **Passo 4: Implementar a função de salvar**

```tsx
const handleSaveDailyGoal = async (line: string) => {
  const goalValue = dailyGoals[line]
  
  // Validações
  if (!goalValue || !goalValue.trim()) {
    toast({
      title: "Erro",
      description: "Digite uma meta válida",
      variant: "destructive",
    })
    return
  }

  const goalNumber = parseInt(goalValue)
  if (isNaN(goalNumber) || goalNumber <= 0) {
    toast({
      title: "Erro",
      description: "A meta deve ser um número positivo",
      variant: "destructive",
    })
    return
  }

  // Enviar para API
  setIsSavingGoal(true)
  try {
    const result = await setDailyProductionGoal(line, goalNumber)
    if (result) {
      toast({
        title: "Meta Salva",
        description: `Meta diária de ${goalNumber} unidades definida para ${line}`,
      })
      setDailyGoals(prev => ({ ...prev, [line]: "" }))
    }
  } catch (error) {
    toast({
      title: "Erro",
      description: "Falha ao salvar meta diária",
      variant: "destructive",
    })
  } finally {
    setIsSavingGoal(false)
  }
}
```

---

## 🗄️ ONDE IMPLEMENTAR A ROTA DA API NO BACKEND

### **📁 Estrutura de arquivos do backend:**

```
seu-projeto-backend/
├── src/
│   ├── routes/
│   │   ├── production-goals.routes.ts  ← CRIAR ESTE ARQUIVO
│   │   ├── alert.routes.ts
│   │   ├── event.routes.ts
│   │   └── ...
│   ├── server.ts                       ← MODIFICAR ESTE ARQUIVO
│   └── ...
```

### **🔧 Passo 1: Criar o arquivo de rotas**

Crie o arquivo `src/routes/production-goals.routes.ts`:

```typescript
import express from 'express'

const router = express.Router()

// POST /api/linhas/:lineId/meta-diaria - Definir meta diária para uma linha
router.post('/:lineId/meta-diaria', async (req, res) => {
  try {
    const { lineId } = req.params
    const { metaDiaria, data } = req.body
    
    // Validações básicas
    if (!metaDiaria || metaDiaria <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Meta deve ser um número positivo'
      })
    }
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data é obrigatória'
      })
    }
    
    // Aqui você implementaria a lógica para salvar no banco de dados
    // Por enquanto, vamos apenas retornar sucesso
    
    const dailyGoal = {
      id: `goal_${Date.now()}`,
      lineId: lineId,
      metaDiaria: metaDiaria,
      data: data,
      createdAt: new Date(),
      status: 'active'
    }
    
    // 💾 SALVAR NO BANCO DE DADOS
    // await dailyGoalRepository.save(dailyGoal)
    
    res.status(201).json({
      success: true,
      data: dailyGoal,
      message: `Meta diária de ${metaDiaria} unidades definida para linha ${lineId}`
    })
    
  } catch (error) {
    console.error('Erro ao definir meta diária:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

export default router
```

### **🔧 Passo 2: Registrar a rota no servidor principal**

No arquivo `src/server.ts`, adicione:

```typescript
import express from 'express'
import productionGoalsRoutes from './routes/production-goals.routes'

const app = express()

// Middleware para JSON
app.use(express.json())

// Registrar rotas
app.use('/api/linhas', productionGoalsRoutes)  ← ADICIONAR ESTA LINHA

// ... outras rotas existentes

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001')
})
```

### **🔧 Passo 3: Testar a rota**

Após implementar, você pode testar com:

```bash
# Teste com cURL
curl -X POST http://localhost:3001/api/linhas/linha1/meta-diaria \
  -H "Content-Type: application/json" \
  -d '{"metaDiaria": 150, "data": "2025-01-13"}'

# Ou com Postman/Insomnia
# URL: POST http://localhost:3001/api/linhas/linha1/meta-diaria
# Body: {"metaDiaria": 150, "data": "2025-01-13"}
```

---

## 📡 Estrutura da Requisição para o Backend

### **Endpoint:**
```
POST /api/linhas/{lineId}/meta-diaria
```

### **URL completa:**
```
http://localhost:3001/api/linhas/linha1/meta-diaria
http://localhost:3001/api/linhas/linha2/meta-diaria
http://localhost:3001/api/linhas/linha3/meta-diaria
```

### **Headers:**
```
Content-Type: application/json
```

### **Body (JSON):**
```json
{
  "metaDiaria": 150,
  "data": "2025-01-13"
}
```

### **Exemplo de requisição:**
```tsx
// Para linha1 com meta de 150 unidades
const response = await fetch('/api/linhas/linha1/meta-diaria', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    metaDiaria: 150,
    data: new Date().toISOString().split('T')[0] // Data atual: YYYY-MM-DD
  })
})
```

---

## 📥 Como receber resposta do Backend

### **Resposta de sucesso (201):**
```json
{
  "success": true,
  "data": {
    "id": "goal_1705123456789",
    "lineId": "linha1",
    "metaDiaria": 150,
    "data": "2025-01-13",
    "createdAt": "2025-01-13T10:30:56.789Z",
    "status": "active"
  },
  "message": "Meta diária de 150 unidades definida para linha linha1"
}
```

### **Resposta de erro (400):**
```json
{
  "success": false,
  "error": "Meta deve ser um número positivo"
}
```

---

## 🔍 Exemplo completo de uso

```tsx
// 1. Usuário digita "200" no campo de meta da linha1
// 2. Clica em "Salvar"
// 3. Sistema valida o valor
// 4. Envia requisição POST para /api/linhas/linha1/meta-diaria
// 5. Backend responde com sucesso
// 6. Frontend mostra toast de sucesso
// 7. Campo é limpo automaticamente

// O fluxo completo:
const handleSaveDailyGoal = async (line: string) => {
  const goalValue = dailyGoals[line]
  
  if (!goalValue || !goalValue.trim()) {
    toast({ title: "Erro", description: "Digite uma meta válida", variant: "destructive" })
    return
  }

  const goalNumber = parseInt(goalValue)
  if (isNaN(goalNumber) || goalNumber <= 0) {
    toast({ title: "Erro", description: "A meta deve ser um número positivo", variant: "destructive" })
    return
  }

  setIsSavingGoal(true)
  try {
    const result = await setDailyProductionGoal(line, goalNumber)
    if (result) {
      toast({
        title: "Meta Salva",
        description: `Meta diária de ${goalNumber} unidades definida para ${line}`,
      })
      setDailyGoals(prev => ({ ...prev, [line]: "" }))
    }
  } catch (error) {
    toast({ title: "Erro", description: "Falha ao salvar meta diária", variant: "destructive" })
  } finally {
    setIsSavingGoal(false)
  }
}
```

---

## ⚠️ Pontos importantes

1. **Validação obrigatória**: Sempre valide se o campo não está vazio
2. **Conversão para número**: Use `parseInt()` e valide se não é NaN
3. **Feedback visual**: Use toast para informar sucesso/erro
4. **Estado de loading**: Desabilite o botão durante o envio
5. **Limpeza do campo**: Limpe o campo após salvar com sucesso
6. **Tratamento de erro**: Sempre trate erros da API
7. **URL da API**: Certifique-se de que a URL está correta no backend

---

## 🎯 Resumo do que você precisa fazer

### **Frontend:**
1. **Adicionar campo de input** no card de meta diária de cada linha
2. **Criar estado** para gerenciar os valores dos campos
3. **Implementar função** para validar e enviar dados
4. **Adicionar botão** para salvar a meta
5. **Tratar respostas** da API (sucesso/erro)
6. **Mostrar feedback** visual para o usuário

### **Backend:**
1. **Criar arquivo** `src/routes/production-goals.routes.ts`
2. **Implementar rota** POST `/api/linhas/:lineId/meta-diaria`
3. **Registrar rota** no `src/server.ts`
4. **Testar endpoint** com Postman/cURL

---

## 🔗 Fluxo completo da aplicação

```
Frontend (React) → API (Backend) → Banco de Dados
     ↓                    ↓              ↓
1. Usuário digita   2. Valida dados   3. Salva meta
   meta no campo    e processa        no banco
4. Clica em        5. Retorna        6. Confirma
   "Salvar"        resposta          sucesso
7. Mostra toast    8. Frontend      9. Sistema
   de sucesso      recebe resposta   atualizado
```

---

## 🎯 **RESUMO FINAL: Como funciona o envio HTTP**

### **1. Usuário interage:**
- Digita "150" no campo
- Clica em "Salvar"

### **2. Frontend processa:**
- `handleSaveDailyGoal("linha1")` é executada
- Valida o valor "150"
- Converte para número 150

### **3. Requisição HTTP é enviada:**
- `setDailyProductionGoal("linha1", 150)` é chamada
- **fetch()** cria uma requisição HTTP POST
- **URL:** `http://localhost:3001/api/linhas/linha1/meta-diaria`
- **Body:** `{"metaDiaria": 150, "data": "2025-01-13"}`

### **4. Backend recebe:**
- Servidor Express recebe a requisição
- Processa os dados
- Retorna resposta de sucesso

### **5. Frontend recebe resposta:**
- Mostra toast de sucesso
- Limpa o campo
- Sistema atualizado

---

*Documentação criada em: 13/01/2025*
*Versão: 1.2 - Com explicação detalhada do HTTP*

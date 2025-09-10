// services/api.ts
// Este arquivo contém todas as interfaces e a lógica de comunicação com a API de produção.

// Definições de tipos de dados para a API
export interface ProductionLine {
  id: string;
  name: string;
  model: string;
  currentProduction: number;
  targetProduction: number;
  status: "running" | "stopped" | "maintenance" | "completed";
  efficiency: number;
  lastUpdate: Date;
  issues: string[];
  products: Product[];
}

export interface Product {
  id: string;
  serialNumber: string;
  barcode?: string;
  model: string;
  currentStage: number;
  totalStages: number;
  stageTimes: number[];
  totalActiveTime: number;
  idleTime: number;
  status: "in_production" | "completed" | "paused";
}

export interface ProductionMetrics {
  totalProduced: number;
  totalTarget: number;
  overallEfficiency: number;
  activeLines: number;
  totalIssues: number;
  averageCycleTime: number;
}

export interface FailureRecord {
  id: string;
  lineId: string;
  stage: number;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: "open" | "resolved";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface ProductAnalysis {
  analisePorEtapa: Array<{
    etapaId: number;
    nomeEtapa: string;
    duracaoEtapa: number;
    tempoDeOcio: any;
  }>;
  ocioTotalSegundos: number;
}

// URL base da sua API. Altere para a URL de produção se necessário.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Classe principal da API para centralizar todas as chamadas HTTP.
export class ProductionAPI {
  // Buscar todas as linhas de produção
  static async getProductionLines(): Promise<ProductionLine[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/linhas-producao`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Converte timestamps de string para objetos Date
      return data.map((line: any) => ({
        ...line,
        lastUpdate: new Date(line.lastUpdate),
        products: line.products.map((p: any) => ({
          ...p,
          stageTimes: p.stageTimes.map((ts: number) => new Date(ts)),
        })),
      }));
    } catch (error) {
      console.error("Erro ao buscar linhas de produção:", error);
      throw new Error("Falha ao buscar dados de linhas de produção.");
    }
  }

  // Buscar métricas gerais de produção
  static async getProductionMetrics(): Promise<ProductionMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/production-metrics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar métricas de produção:", error);
      throw new Error("Falha ao buscar dados de métricas de produção.");
    }
  }

  // Buscar registros de falhas
  static async getFailureRecords(): Promise<FailureRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alertas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Converte timestamps de string para objetos Date
      return data.map((failure: any) => ({
        ...failure,
        startTime: new Date(failure.startTime),
        endTime: failure.endTime ? new Date(failure.endTime) : null,
      }));
    } catch (error) {
      console.error("Erro ao buscar registros de falhas:", error);
      throw new Error("Falha ao buscar dados de falhas.");
    }
  }

  // Análise de tempos de um produto específico
  static async getProductAnalysis(productId: string): Promise<ProductAnalysis | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analise-tempo/produtos/${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching product analysis:", error);
      return null;
    }
  }

  // Definir meta diária de produção para uma linha
  static async setDailyProductionGoal(lineId: string, goal: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metas/linhas/${lineId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meta: goal }),
      });
      return response.ok;
    } catch (error) {
      console.error("Error setting daily production goal:", error);
      return false;
    }
  }
}
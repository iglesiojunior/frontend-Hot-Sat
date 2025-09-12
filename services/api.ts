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
    duracaoEtapa: {
      seconds: number;
      minutes: number;
      hours: number;
      days: number;
    };
    tempoDeOcio: {
      seconds: number;
      minutes: number;
      hours: number;
      days: number;
    };
  }>;
  ocioTotalSegundos: number;
}

// URL base da sua API. Altere para a URL de produção se necessário.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Classe principal da API para centralizar todas as chamadas HTTP.
export class ProductionAPI {
  // Simula a busca de todas as linhas de produção (este endpoint não existe no backend fornecido)
  static async getProductionLines(): Promise<ProductionLine[]> {
    console.warn("Endpoint getProductionLines não existe no backend. Retornando dados mockados.");
    // Aqui você retornaria dados mockados ou faria uma chamada para um endpoint real, se existisse.
    return [
      // ... dados mockados, se necessário
    ];
  }

  // Simula a busca de métricas gerais de produção (este endpoint não existe no backend fornecido)
  static async getProductionMetrics(): Promise<ProductionMetrics> {
    console.warn("Endpoint getProductionMetrics não existe no backend. Retornando dados mockados.");
    // Aqui você retornaria dados mockados, se necessário.
    return {
      totalProduced: 0,
      totalTarget: 0,
      overallEfficiency: 0,
      activeLines: 0,
      totalIssues: 0,
      averageCycleTime: 0,
    };
  }

  // Busca registros de alertas no backend e os mapeia para o formato do frontend
  static async getFailureRecords(): Promise<FailureRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alertas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((alert: any) => ({
        id: alert.id,
        lineId: alert.linha_id,
        stage: alert.etapa_id,
        startTime: new Date(alert.inicio_alerta_ts),
        endTime: alert.fim_alerta_ts ? new Date(alert.fim_alerta_ts) : undefined,
        duration: (alert.fim_alerta_ts ? new Date(alert.fim_alerta_ts).getTime() : Date.now()) - new Date(alert.inicio_alerta_ts).getTime(),
        status: alert.status_alerta === 'Aberto' ? "open" : "resolved",
        description: alert.descricao,
        severity: "medium", // O backend não tem este campo, então o definimos como um valor padrão
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
        return null;
      }
      const result = await response.json();
      return {
        ...result,
        ocioTotalSegundos: result.ocioTotal?.seconds || 0 // Mapeia o campo "ocioTotal"
      }
    } catch (error) {
      console.error("Error fetching product analysis:", error);
      return null;
    }
  }

  // Define uma meta diária de produção para uma linha
  static async setDailyProductionGoal(lineId: number, meta: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metas/linhas/${lineId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meta: meta }),
      });
      return response.ok;
    } catch (error) {
      console.error("Error setting daily production goal:", error);
      return false;
    }
  }

  // Processa um evento de produção (iniciar/parar)
  static async processProductionEvent(tipo: "start" | "stop", etapa: number, linhaId: number): Promise<number | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo,
          etapa_id: etapa,
          linha_id: linhaId,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.produtoId;
    } catch (error) {
      console.error("Error processing production event:", error);
      return null;
    }
  }

  // Cria um novo alerta
  static async createAlert(linhaId: number, etapaId?: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alertas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linha_id: linhaId,
          etapa_id: etapaId,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error creating alert:", error);
      return null;
    }
  }

  // Resolve um alerta
  static async resolveAlert(linhaId: number, etapaId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alertas/linhas/${linhaId}/etapas/${etapaId}/resolver`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error resolving alert:", error);
      return null;
    }
  }

  // Associa um número de série a um produto
  static async associateSerialNumber(numeroSerie: string, linhaId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scanner/linhas/${linhaId}/associar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero_serie: numeroSerie,
          linha_id: linhaId,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error associating serial number:", error);
      return null;
    }
  }
}
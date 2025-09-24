// services/api.ts

export interface AnaliseLinha {
  produtosConcluidos: number;
  totalProdutosNaLinha: number;
  analiseProdutos: ProdutoDaLinha[];
}

export interface ProdutoDaLinha {
  produtoId: number;
  nSerie: string | null;
  status: string | null;
  ocioTotal: string;
  historico: EtapaHistorico[];
}

export interface EtapaHistorico {
  etapaId: number;
  nomeEtapa: string;
  inicioTs: string | null;
  fimTs: string | null;
  tempoDeOcio: string;
}

export interface Alerta {
  id: number;
  linhaId: number;
  etapaId: number | null;
  descricao: string;
  inicioAlertaTs: string;
  fimAlertaTs: string | null;
  statusAlerta: string | null;
}

export interface MetaDiaria {
    data: string;
    metaTotal: number;
    metas: {
        linhaId: number;
        meta: number;
    }[];
}

export interface ProductAnalysis {
  produto: {
    id: number;
    nSerie: string | null;
    linhaId: number;
    statusGeral: string | null;
  };
  analisePorEtapa: Array<{
    etapaId: number;
    nomeEtapa: string;
    inicioEtapa: string;
    fimEtapa: string;
    duracaoEtapa: any; 
    tempoDeOcio: any;
  }>;
  ocioTotal: string;
}

// Interfaces que o frontend usa para renderizar.
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
  model: string;
  fabrication: string;
  currentStage: number;
  nextStage: number | null;
  stageTimes: number[];
  totalActiveTime: number;
  idleTime: number;
  status: "in_production" | "completed" | "paused";
  barcode?: string;
  totalStages: number;
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


// URL base da sua API.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Classe principal da API para centralizar todas as chamadas HTTP.
export class ProductionAPI {

  // --- ANÁLISES E LINHAS ---
  static async getLineAnalysis(lineId: number): Promise<AnaliseLinha | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analise-tempo/linha/${lineId}/hoje`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar análise da linha ${lineId}:`, error);
      throw error;
    }
  }

  static async getProductAnalysis(productId: string): Promise<ProductAnalysis | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analise-tempo/produto/${productId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching product analysis:", error);
      return null;
    }
  }

  // --- METAS ---
  static async setDailyProductionGoal(lineId: number, goal: number): Promise<boolean> {
    try {
      const updateResponse = await fetch(`${API_BASE_URL}/api/metas/linha/${lineId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta: goal }),
      });
  
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || `HTTP error! status: ${updateResponse.status}`);
      }
      return true;

    } catch (error) {
      console.error("Error setting daily production goal:", error);
      throw error;
    }
  }

  static async getDailyTargets(): Promise<MetaDiaria | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metas`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar metas diárias:", error);
      throw error;
    }
  }
  
  // --- ALERTAS ---
  static async getAlerts(): Promise<Alerta[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/alertas`);
        if (!response.ok) {
            if (response.status === 404) return [];
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar alertas:", error);
        throw new Error("Falha ao buscar dados de alertas.");
    }
  }

  static async createAlert(linhaId: number, etapaId: number): Promise<Alerta | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alertas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linha_id: linhaId, etapa_id: etapaId, descricao: `Alerta manual na linha ${linhaId}` }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Erro ao criar alerta:", error);
      return null;
    }
  }

  static async resolveAlert(linhaId: number, etapaId: number): Promise<Alerta | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alertas/linhas/${linhaId}/etapas/${etapaId}/resolver`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Erro ao resolver alerta:", error);
      return null;
    }
  }

  // --- EVENTOS DE PRODUÇÃO (START/STOP) ---
  static async processProductionEvent(tipo: 'start' | 'stop', etapaId: number, linhaId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, etapa_id: etapaId, linha_id: linhaId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao processar evento '${tipo}':`, error);
      throw error;
    }
  }

  // --- SCANNER ---
  static async associateSerialNumber(linhaId: number, numeroSerie: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scanner/linhas/${linhaId}/associar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_serie: numeroSerie, linha_id: linhaId }),
      });
       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao associar número de série:", error);
      throw error;
    }
  }
}
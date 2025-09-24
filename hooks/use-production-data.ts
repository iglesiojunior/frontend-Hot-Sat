// hooks/use-production-data.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  ProductionAPI, 
  type ProductionLine, 
  type ProductionMetrics, 
  type FailureRecord,
  type Product,
  type AnaliseLinha,
  type Alerta 
} from "../services/api"
import { useToast } from "./use-toast"

// Função para mapear o status do produto do backend para o formato do frontend
const mapProductStatus = (backendStatus: string | null): Product['status'] => {
  if (backendStatus === 'Concluido') return 'completed';
  if (backendStatus === 'Em producao') return 'in_production';
  return 'paused';
};

export function useProductionData() {
  const [lines, setLines] = useState<ProductionLine[]>([])
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null)
  const [failures, setFailures] = useState<FailureRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoading(true)
    }
    setError(null)
    
    try {
      // 1. Buscar todas as falhas (alertas) de uma vez.
      const alertsData: Alerta[] = await ProductionAPI.getAlerts();
      const mappedFailures: FailureRecord[] = alertsData.map(f => ({
        id: f.id.toString(),
        lineId: f.linhaId.toString(),
        stage: f.etapaId ?? 0,
        startTime: new Date(f.inicioAlertaTs),
        endTime: f.fimAlertaTs ? new Date(f.fimAlertaTs) : undefined,
        duration: (f.fimAlertaTs ? new Date(f.fimAlertaTs).getTime() : Date.now()) - new Date(f.inicioAlertaTs).getTime(),
        status: f.statusAlerta === 'Aberto' ? 'open' : 'resolved',
        description: f.descricao,
        severity: 'medium' 
      }));
      setFailures(mappedFailures);

      const GoalData = await ProductionAPI.getDailyTargets();

      // 2. Buscar os dados de cada linha individualmente.
      const lineIds = [1, 2, 3, 4, 5];
      const lineAnalysisPromises = lineIds.map(id => ProductionAPI.getLineAnalysis(id).catch(() => null));
      const linesAnalysis = await Promise.all(lineAnalysisPromises);

      // 3. Montar os dados das linhas no formato que o frontend espera.
      const linesData: ProductionLine[] = linesAnalysis.map((analysis, index) => {
        const lineId = lineIds[index];
        const lineName = `Linha ${lineId}`;
        const lineFailures = mappedFailures.filter(f => f.lineId === lineId.toString() && f.status === 'open');
        const status: ProductionLine['status'] = lineFailures.length > 0 ? "stopped" : "running";
        
        const currentProduction = analysis?.produtosConcluidos ?? 0;

        const lineGoal = GoalData?.metas.find((m:any) => m.linhaId === lineId);
        const targetProduction = lineGoal?.meta ?? 0; // Provisório. O ideal é buscar de /api/metas
        const efficiency = targetProduction > 0 ? Math.round((currentProduction / targetProduction) * 100) : 0;
        
        const products: Product[] = analysis?.analiseProdutos.map(p => {
            const stageTimes = Array(5).fill(0);
            let currentStage = 0;
            p.historico.forEach(h => {
                if (h.inicioTs) {
                  currentStage = Math.max(currentStage, h.etapaId);
                }
            });
             if (p.status === 'Concluido') {
              currentStage = 5;
            }
            
            return {
                id: p.produtoId.toString(),
                serialNumber: p.nSerie || `PROD-${p.produtoId}`,
                model: `Modelo da Linha ${lineId}`,
                fabrication: 'FAB:01/2025',
                currentStage: currentStage,
                nextStage: currentStage > 0 && currentStage < 5 ? currentStage + 1 : null,
                stageTimes: stageTimes,
                status: mapProductStatus(p.status),
                barcode: p.nSerie || undefined,
                totalStages: 5,
                totalActiveTime: 0, 
                idleTime: 0, 
            }
        }) ?? [];

        return {
          id: lineId.toString(),
          name: lineName,
          model: `Modelo da Linha ${lineId}`,
          currentProduction,
          targetProduction,
          status,
          efficiency,
          products,
          issues: lineFailures.map(f => f.description),
          lastUpdate: new Date(),
        };
      });
      setLines(linesData);

      // 4. Calcular métricas gerais no frontend.
      const totalProduced = linesData.reduce((acc, line) => acc + line.currentProduction, 0);
      const totalTarget = linesData.reduce((acc, line) => acc + line.targetProduction, 0);
      const overallEfficiency = totalTarget > 0 ? Math.round((totalProduced / totalTarget) * 100) : 0;

      setMetrics({
        totalProduced,
        totalTarget,
        overallEfficiency,
        activeLines: linesData.filter(l => l.status === 'running').length,
        totalIssues: failures.filter(f => f.status === 'open').length,
        averageCycleTime: 0,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar dados.");
    } finally {
      if (isInitialLoad) {
        setIsLoading(false)
      }
    }
  }, []);

  // Efeito para buscar dados iniciais e configurar a atualização automática
  useEffect(() => {
    // Busca os dados na primeira vez que o hook é usado
    fetchData(true);

    const intervalId = setInterval(() => {
      console.log("Atualizando dados...");
      fetchData(false);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fetchData]); 

  return { 
    lines, 
    metrics, 
    failures, 
    isLoading, 
    error, 
    fetchData,
  }
}

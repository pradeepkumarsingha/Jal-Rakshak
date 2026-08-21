import { useQuery } from '@tanstack/react-query'
import { floodApi } from '../services/floodApi'
import { useFloodData } from '../context/FloodDataContext'

export function useFloodRisk(params = {}) {
  const { riskScore, dataMode } = useFloodData()

  const normalizedParams =
    typeof params === 'string'
      ? { locationName: params, simulationMode: dataMode !== 'live' }
      : { ...params, simulationMode: dataMode !== 'live' }

  const query = useQuery({
    queryKey: ['floodRisk', normalizedParams, dataMode],
    queryFn: () => floodApi.getRiskPrediction(normalizedParams),
    staleTime: 60 * 1000,
  })

  return {
    ...query,
    effectiveRiskScore: riskScore ?? query.data?.riskScore ?? null,
  }
}

export default useFloodRisk

import { useQuery } from '@tanstack/react-query'
import { floodApi } from '../services/floodApi'
import { useFloodData } from '../context/FloodDataContext'

export function useFloodRisk(location = 'Cuttack') {
  const { riskScore, scenario } = useFloodData()

  const query = useQuery({
    queryKey: ['floodRisk', location, scenario],
    queryFn: () => floodApi.getRiskPrediction(location),
    staleTime: 60 * 1000,
  })

  return {
    ...query,
    effectiveRiskScore: riskScore,
  }
}

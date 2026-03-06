'use client'

import dynamic from 'next/dynamic'

const CostByTypeChart = dynamic(() => import('./cost-by-type-chart'), { ssr: false })

type Props = { data: { type: string; total: number }[]; total?: number }

export default function CostByTypeChartWrapper({ data, total }: Props) {
  return <CostByTypeChart data={data} total={total} />
}

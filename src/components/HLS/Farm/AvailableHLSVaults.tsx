import Table from 'components/HLS/Farm/Table'
import useHLSVaults from 'hooks/useHLSVaults'

export default function AvailableHlsVaults() {
  const { data: HLSStrategies } = useHLSVaults()
  return <Table data={HLSStrategies} />
}

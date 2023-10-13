import useHLSStakingAssets from 'hooks/useHLSStakingAssets'

export default function AvailableHlsStakingAssets() {
  const { data: HLSStakingAssets } = useHLSStakingAssets()

  return <code>{JSON.stringify(HLSStakingAssets)}</code>
}

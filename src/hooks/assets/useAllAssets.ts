import useStore from 'store'

export default function useAllAssets() {
  return useStore((s) => s.chainConfig.assets)
}

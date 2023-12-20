import useStore from 'store'

export default function useChainConfig() {
  return useStore((s) => s.chainConfig)
}

import React from 'react'

import useHLSVaults from 'hooks/useHLSVaults'

export default function AvailableHlsVaults() {
  const { data: HLSVaults } = useHLSVaults()

  return <code>{JSON.stringify(HLSVaults)}</code>
}

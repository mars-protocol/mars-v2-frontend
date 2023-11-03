import React from 'react'

import Button from 'components/Button'

export const MANAGE_META = { id: 'manage' }

interface Props {
  account: HLSAccountWithStrategy
}

export default function Manage(props: Props) {
  // TODO: Impelement dropdown
  return <Button text='Manage' color='tertiary' />
}

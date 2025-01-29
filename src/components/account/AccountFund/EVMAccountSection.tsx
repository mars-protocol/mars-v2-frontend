import React from 'react'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'

interface EVMAccountSectionProps {
  isConnected: boolean
  isConfirming: boolean
  handleConnectWallet: () => void
  handleDisconnectWallet: () => void
  hasEVMAssetSelected: boolean
}

export default function EVMAccountSection({
  isConnected,
  isConfirming,
  handleConnectWallet,
  handleDisconnectWallet,
  hasEVMAssetSelected,
}: EVMAccountSectionProps) {
  return (
    <>
      {!hasEVMAssetSelected && (
        <Callout type={CalloutType.INFO} className='mt-4'>
          {isConnected
            ? 'Now that you have connected an EVM Wallet, please select the assets you want to deposit.'
            : 'You want to add USDC from an Ethereum L1 or L2 chain? Connect your EVM wallet by clicking the button below and enable the deposit of EVM based USDC.'}
        </Callout>
      )}
      <Button
        className='w-full mt-4'
        text={isConnected ? 'Disconnect EVM Wallet' : 'Connect EVM Wallet'}
        color='quaternary'
        onClick={isConnected ? handleDisconnectWallet : handleConnectWallet}
        disabled={isConfirming}
      />
    </>
  )
}

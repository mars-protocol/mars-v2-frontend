import React from 'react'
import Button from 'components/common/Button'
import { Plus } from 'components/common/Icons'
import { Callout, CalloutType } from 'components/common/Callout'

interface EVMAccountSectionProps {
  isConnected: boolean
  isConfirming: boolean
  handleSelectAssetsClick: () => void
  handleConnectWallet: () => void
  handleDisconnectWallet: () => void
}

export default function EVMAccountSection({
  isConnected,
  isConfirming,
  handleSelectAssetsClick,
  handleConnectWallet,
  handleDisconnectWallet,
}: EVMAccountSectionProps) {
  return (
    <>
      <Button
        className='w-full mt-4'
        text='Select Assets'
        color='tertiary'
        rightIcon={<Plus />}
        iconClassName='w-3'
        onClick={handleSelectAssetsClick}
        disabled={isConfirming}
      />
      <div className='mt-4 border border-transparent border-t-white/10' />
      <Callout type={CalloutType.INFO} className='mt-4'>
        {isConnected
          ? 'Now that you have connected an EVM Wallet, please select the assets you want to deposit.'
          : 'You want to add USDC from an Ethereum L1 or L2 chain? Connect your EVM wallet by clicking the button below and enable the deposit of EVM based USDC.'}
      </Callout>
      <Button
        className='w-full mt-4'
        text={isConnected ? 'Disconnect EVM Wallet' : 'Connect EVM Wallet'}
        color='primary'
        onClick={isConnected ? handleDisconnectWallet : handleConnectWallet}
      />
    </>
  )
}

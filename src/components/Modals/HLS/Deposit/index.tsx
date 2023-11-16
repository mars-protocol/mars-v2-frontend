import React, { useMemo, useState } from 'react'

import Accordion from 'components/Accordion'
import useStakingController from 'components/Modals/HLS/Deposit//useStakingController'
import useVaultController from 'components/Modals/HLS/Deposit//useVaultController'
import useAccordionItems from 'components/Modals/HLS/Deposit/useAccordionItems'
import { EMPTY_ACCOUNT_HLS } from 'constants/accounts'
import useAccounts from 'hooks/useAccounts'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useIsOpenArray from 'hooks/useIsOpenArray'
import useVault from 'hooks/useVault'
import useStore from 'store'
import { isAccountEmpty } from 'utils/accounts'

interface Props {
  borrowAsset: BorrowAsset
  collateralAsset: Asset
  vaultAddress: string | null
  strategy?: HLSStrategy
}

export default function Controller(props: Props) {
  const [selectedAccount, setSelectedAccount] = useState<Account>(EMPTY_ACCOUNT_HLS)
  const [isOpen, toggleIsOpen] = useIsOpenArray(4, false)
  const address = useStore((s) => s.address)
  const { data: hlsAccounts } = useAccounts('high_levered_strategy', address)
  const emptyHlsAccounts = useMemo(() => {
    const emptyAccounts = hlsAccounts.filter((account) => isAccountEmpty(account))

    if (emptyAccounts.length > 0 && selectedAccount.id === 'default') {
      setSelectedAccount(emptyAccounts[0])
    }

    return emptyAccounts
  }, [hlsAccounts, selectedAccount])
  const walletCollateralAsset = useCurrentWalletBalance(props.collateralAsset.denom)
  const vault = useVault(props.vaultAddress || '')

  if (vault)
    return (
      <Vault
        walletCollateralAsset={walletCollateralAsset}
        vault={vault}
        collateralAsset={props.collateralAsset}
        borrowAsset={props.borrowAsset}
        emptyHlsAccounts={emptyHlsAccounts}
        hlsAccounts={hlsAccounts}
        isOpen={isOpen}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        toggleIsOpen={toggleIsOpen}
      />
    )

  if (props.strategy) {
    return (
      <StakingContent
        walletCollateralAsset={walletCollateralAsset}
        collateralAsset={props.collateralAsset}
        borrowAsset={props.borrowAsset}
        emptyHlsAccounts={emptyHlsAccounts}
        hlsAccounts={hlsAccounts}
        isOpen={isOpen}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        toggleIsOpen={toggleIsOpen}
        strategy={props.strategy}
      />
    )
  }

  return null
}

interface ContentProps {
  borrowAsset: BorrowAsset
  collateralAsset: Asset
  emptyHlsAccounts: Account[]
  hlsAccounts: Account[]
  isOpen: boolean[]
  selectedAccount: Account
  setSelectedAccount: (account: Account) => void
  toggleIsOpen: (index: number) => void
  walletCollateralAsset: Coin | undefined
}

interface VaultContentProps extends ContentProps {
  vault: Vault
}

function Vault(props: VaultContentProps) {
  const {
    borrowAmount,
    depositAmount,
    execute,
    leverage,
    maxBorrowAmount,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    updatedAccount,
  } = useVaultController({
    vault: props.vault,
    collateralAsset: props.collateralAsset,
    borrowAsset: props.borrowAsset,
    selectedAccount: props.selectedAccount,
  })

  const items = useAccordionItems({
    apy: props.vault.apy || 0,
    borrowAmount,
    borrowAsset: props.borrowAsset,
    collateralAsset: props.collateralAsset,
    depositAmount,
    emptyHlsAccounts: props.emptyHlsAccounts,
    execute,
    hlsAccounts: props.hlsAccounts,
    isOpen: props.isOpen,
    leverage,
    maxBorrowAmount,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    selectedAccount: props.selectedAccount,
    setSelectedAccount: props.setSelectedAccount,
    toggleIsOpen: props.toggleIsOpen,
    updatedAccount,
    walletCollateralAsset: props.walletCollateralAsset,
  })

  return <Accordion className='h-[546px] overflow-y-scroll scrollbar-hide' items={items} />
}

interface StakingContentProps extends ContentProps {
  strategy: HLSStrategy
}

function StakingContent(props: StakingContentProps) {
  const {
    depositAmount,
    onChangeCollateral,
    updatedAccount,
    borrowAmount,
    onChangeDebt,
    leverage,
    maxBorrowAmount,
    positionValue,
    execute,
  } = useStakingController({
    collateralAsset: props.collateralAsset,
    borrowAsset: props.borrowAsset,
    selectedAccount: props.selectedAccount,
  })

  const items = useAccordionItems({
    borrowAmount,
    borrowAsset: props.borrowAsset,
    collateralAsset: props.collateralAsset,
    depositAmount,
    emptyHlsAccounts: props.emptyHlsAccounts,
    execute,
    hlsAccounts: props.hlsAccounts,
    isOpen: props.isOpen,
    leverage,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    selectedAccount: props.selectedAccount,
    setSelectedAccount: props.setSelectedAccount,
    strategy: props.strategy,
    toggleIsOpen: props.toggleIsOpen,
    updatedAccount,
    maxBorrowAmount,
    apy: props.strategy.apy || 0,
    walletCollateralAsset: props.walletCollateralAsset,
  })

  return <Accordion className='h-[546px] overflow-y-scroll scrollbar-hide' items={items} />
}

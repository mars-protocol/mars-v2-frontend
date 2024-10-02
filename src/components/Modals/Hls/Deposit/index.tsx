import { useMemo, useState } from 'react'

import Accordion from 'components/common/Accordion'
import useAccordionItems from 'components/Modals/Hls/Deposit/useAccordionItems'
import useStakingController from 'components/Modals/Hls/Deposit/useStakingController'
import { EMPTY_ACCOUNT_HLS } from 'constants/accounts'
import useAccounts from 'hooks/accounts/useAccounts'
import useIsOpenArray from 'hooks/common/useIsOpenArray'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { isAccountEmpty } from 'utils/accounts'

interface Props {
  borrowMarket: Market
  collateralAsset: Asset
  vaultAddress: string | null
  strategy?: HlsStrategy
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

  if (props.strategy) {
    return (
      <StakingContent
        walletCollateralAsset={walletCollateralAsset}
        collateralAsset={props.collateralAsset}
        borrowMarket={props.borrowMarket}
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
  borrowMarket: Market
  collateralAsset: Asset
  emptyHlsAccounts: Account[]
  hlsAccounts: Account[]
  isOpen: boolean[]
  selectedAccount: Account
  setSelectedAccount: (account: Account) => void
  toggleIsOpen: (index: number) => void
  walletCollateralAsset: Coin | undefined
}

interface StakingContentProps extends ContentProps {
  strategy: HlsStrategy
}

function StakingContent(props: StakingContentProps) {
  const {
    depositAmount,
    onChangeCollateral,
    borrowAmount,
    onChangeDebt,
    leverage,
    maxBorrowAmount,
    positionValue,
    execute,
  } = useStakingController({
    collateralAsset: props.collateralAsset,
    borrowMarket: props.borrowMarket,
    selectedAccount: props.selectedAccount,
  })

  const items = useAccordionItems({
    borrowAmount,
    borrowMarket: props.borrowMarket,
    collateralAsset: props.collateralAsset,
    depositAmount,
    emptyHlsAccounts: props.emptyHlsAccounts,
    execute,
    isOpen: props.isOpen,
    leverage,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    selectedAccount: props.selectedAccount,
    setSelectedAccount: props.setSelectedAccount,
    strategy: props.strategy,
    toggleIsOpen: props.toggleIsOpen,
    maxBorrowAmount,
    apy: props.strategy.apy || 0,
    walletCollateralAsset: props.walletCollateralAsset,
  })

  return <Accordion items={items} />
}

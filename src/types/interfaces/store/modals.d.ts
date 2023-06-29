interface ModalSlice {
  addVaultBorrowingsModal: AddVaultBorrowingsModal | null
  borrowModal: BorrowModal | null
  createAccountModal: boolean
  deleteAccountModal: boolean
  fundAccountModal: boolean
  fundAndWithdrawModal: 'fund' | 'withdraw' | null
  vaultModal: VaultModal | null
  unlockModal: UnlockModal | null
  lendAndReclaimModal: LendAndReclaimModalConfig | null
}

type LendAndReclaimModalAction = 'lend' | 'reclaim'
interface LendAndReclaimModalConfig {
  data: LendingMarketTableData
  action: LendAndReclaimModalAction
}

interface BorrowModal {
  asset: Asset
  marketData: BorrowAsset | BorrowAssetActive
  isRepay?: boolean
}

interface VaultModal {
  vault: Vault | DepositedVault
  isDeposited?: boolean
  selectedBorrowDenoms: string[]
}

interface AddVaultBorrowingsModal {
  selectedDenoms: string[]
}

interface UnlockModal {
  vault: DepositedVault
}

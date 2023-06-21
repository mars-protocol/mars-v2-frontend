interface ModalSlice {
  addVaultBorrowingsModal: AddVaultBorrowingsModal | null
  borrowModal: BorrowModal | null
  createAccountModal: boolean
  deleteAccountModal: boolean
  fundAccountModal: boolean
  fundAndWithdrawModal: 'fund' | 'withdraw' | null
  vaultModal: VaultModal | null
  unlockModal: UnlockModal | null
  lendAndWithdrawModal: LendAndWithdrawModalConfig | null
}

type LendAndWithdrawModalActions = 'lend' | 'withdraw'
interface LendAndWithdrawModalConfig {
  data: LendingMarketTableData
  action: LendAndWithdrawModalActions
}

interface BorrowModal {
  asset: Asset
  marketData: BorrowAsset | BorrowAssetActive
  isRepay?: boolean
}

interface VaultModal {
  vault: Vault
  selectedBorrowDenoms: string[]
}

interface AddVaultBorrowingsModal {
  selectedDenoms: string[]
}

interface UnlockModal {
  vault: DepositedVault
}

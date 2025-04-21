import Button from 'components/common/Button'
import { ArrowRight, Vault } from 'components/common/Icons'
import Text from 'components/common/Text'
import CreateVaultContent from 'components/managedVaults/createVault/CreateVaultContent'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function MintVaultAccount() {
  const [isTxPending, setIsTxPending] = useState(false)
  const createAccount = useStore((s) => s.createAccount)
  const { vaultAddress } = useParams<{ vaultAddress: string }>()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const { isOwner, isLoading } = useManagedVaultDetails(vaultAddress)

  const handleCreateVault = useCallback(async () => {
    if (!vaultAddress || !address || !isOwner) return

    setIsTxPending(true)
    try {
      const accountKind = {
        fund_manager: {
          vault_addr: vaultAddress,
        },
      }
      const accountId = await createAccount(accountKind, false)

      if (!accountId) {
        setIsTxPending(false)
        return
      }

      navigate(
        getRoute(
          getPage(`vaults/${vaultAddress}/details`, chainConfig),
          searchParams,
          address,
          accountId,
        ),
      )
    } catch (error) {
      console.error('Failed to create vault account:', error)
    } finally {
      setIsTxPending(false)
    }
  }, [address, chainConfig, createAccount, isOwner, navigate, searchParams, vaultAddress])

  return (
    <CreateVaultContent cardClassName='h-118 flex justify-end'>
      <div className='flex flex-col items-center w-full gap-24'>
        <div className='flex flex-col items-center justify-center gap-6 w-80'>
          <div className='flex items-center justify-center rounded-full p-10 bg-white/10'>
            <span className='w-10 h-10'>
              <Vault />
            </span>
          </div>
          <div className='space-y-2 text-center'>
            <Text size='base'>Create Vault Account</Text>
            {!isLoading && !isOwner ? (
              <Text size='sm' className='text-error'>
                Only the vault creator can mint this account.
              </Text>
            ) : (
              <Text size='sm' className='text-white/60'>
                We require one more transaction approval from you in order to continue.
              </Text>
            )}
          </div>
        </div>

        <Button
          onClick={handleCreateVault}
          size='md'
          rightIcon={<ArrowRight />}
          className='w-full md:w-70'
          text='Create Vault Account (2/2)'
          showProgressIndicator={isTxPending}
          disabled={isTxPending || !isOwner || isLoading}
        />
      </div>
    </CreateVaultContent>
  )
}

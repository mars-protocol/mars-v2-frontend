import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import FullOverlayContent from 'components/common/FullOverlayContent'
import WalletSelect from 'components/Wallet/WalletSelect'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const createAccount = useStore((s) => s.createAccount)
  const [isCreating, setIsCreating] = useToggle(false)
  const [searchParams] = useSearchParams()
  const accountKind = useStore((s) => s.accountKind)
  const [title, setTitle] = useState<string>()
  const [subTitle, setSubTitle] = useState<string>()
  const [desc, setDesc] = useState<string>()
  const [nickName, setNickName] = useState<string>()

  useEffect(() => {
    if (!address) useStore.setState({ focusComponent: { component: <WalletSelect /> } })
      useStore.setState({accountKind: 'default'})
  }, [address])

  const handleApproveTransactionClick = useCallback(async () => {
    setIsCreating(true)
    const accountId = await createAccount(accountKind, title, subTitle, desc, nickName)
    setIsCreating(false)
    if (accountId) {
      navigate(getRoute(getPage(pathname), searchParams, address, accountId))
      if (accountKind === 'fund_manager') {
        useStore.setState({ focusComponent: null, getStartedModal: true })
      } else {
        navigate(getRoute(getPage(pathname), searchParams, address, accountId))
        useStore.setState({ 
          focusComponent: {
            component: <AccountFundFullPage />,
            onClose: () => {
              useStore.setState({ getStartedModal: true })
            },
          },
        })
      }
    }
  }, [setIsCreating, createAccount, navigate, pathname, searchParams, address, accountKind, title, subTitle, desc, nickName])

  const handleDefaultClick = (async () => {
    useStore.setState({accountKind: 'default'})
  })

  const handleFundManagerClick = (async () => {
    useStore.setState({accountKind: 'fund_manager'})
  })
  
  const handleTitleChange = ((text: string) => {
    setTitle(text)
  })
  const handleSubTitleChange = ((text: string) => {
    setSubTitle(text)
  })
  const handleDescChange = ((text: string) => {
    setDesc(text)
  })
  const handleNickNameChange = ((text: string) => {
    setNickName(text)
  })


  return (
    <FullOverlayContent
      title='Mint your account'
      copy="We'll require you to authorise a transaction in your wallet in order to begin."
      select={[{
        className: 'mt-4 w-full',
        text: 'Standard',
        color: accountKind === 'default' ? 'secondary' : 'quaternary',
        showProgressIndicator: isCreating,
        onClick: handleDefaultClick,
        size: 'sm',
      }, {
        className: 'mt-4 w-full',
        text: 'Fund Manager',
        color: accountKind === 'fund_manager' ? 'secondary' : 'quaternary',
        showProgressIndicator: isCreating,
        onClick: handleFundManagerClick,
        size: 'sm',
      }]}
      text={accountKind === 'fund_manager' ? [
        {
          text: title,
          onChange: handleTitleChange,
          placeholder: 'vault title'
        },
        {
          text: subTitle,
          onChange: handleSubTitleChange,
          placeholder: 'vault subtitle'
        },
        {
          text: desc,
          onChange: handleDescChange,
          placeholder: 'vault description'
        },
        {
          text: nickName,
          onChange: handleNickNameChange,
          placeholder: 'vault nickname'
        }
      ] : undefined}
      button={{
        className: 'mt-4 w-full',
        text: 'Approve transaction',
        color: 'tertiary',
        showProgressIndicator: isCreating,
        onClick: handleApproveTransactionClick,
        size: 'lg',
      }}
      docs='account'
    />
  )
}

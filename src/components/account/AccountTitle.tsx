import Text from 'components/common/Text'
import useAccountTitle from 'hooks/accounts/useAccountTitle'

interface Props {
  account: Account
}

export default function AccountTitle(props: Props) {
  const accountTitle = useAccountTitle(props.account)

  return (
    <Text size='xs' className='flex flex-1'>
      {accountTitle}
    </Text>
  )
}

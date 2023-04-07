import AccountOverview from 'components/Portfolio/AccountOverview'

interface Props {
  params: PageParams
}

export default function Portfoliopage(props: Props) {
  return <AccountOverview params={props.params} />
}

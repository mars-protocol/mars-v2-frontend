import Overview from 'components/Council/Overview'

interface Props {
  params: PageParams
}

export default function Councilpage(props: Props) {
  return <Overview params={props.params} />
}

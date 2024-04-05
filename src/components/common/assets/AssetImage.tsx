interface Props {
  asset: Asset
  className?: string
}

export default function AssetImage(props: Props) {
  const AssetLogo = props.asset?.logo ?? null
  return <div className={props.className}>{AssetLogo && <AssetLogo />}</div>
}

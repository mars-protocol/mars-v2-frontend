interface Props {
  asset: Asset
  className?: string
}

export default function AssetImage(props: Props) {
  if (!props.asset.logo) return <div className={props.className} />
  const AssetLogo = props.asset.logo
  return (
    <div className={props.className}>
      <AssetLogo />
    </div>
  )
}

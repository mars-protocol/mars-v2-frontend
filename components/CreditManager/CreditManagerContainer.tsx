import React from 'react'

// move this component outside and probably adapt generic container component to different UI variants
export const CreditManagerContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={`rounded-lg bg-[#D8DAEA] p-2 text-[#585A74] ${className}`}>{children}</div>
}

export default CreditManagerContainer

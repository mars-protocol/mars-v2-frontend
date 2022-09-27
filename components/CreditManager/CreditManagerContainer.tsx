import React from 'react'

// move this component outside and probably adapt generic container component to different UI variants
export const CreditManagerContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={`p-2 bg-[#D8DAEA] rounded-lg text-[#585A74] ${className}`}>{children}</div>
}

export default CreditManagerContainer

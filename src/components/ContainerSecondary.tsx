import React from 'react'

export const ContainerSecondary = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`rounded-md bg-[#D8DAEA] px-3 py-2 text-[#585A74] ${className}`}>
      {children}
    </div>
  )
}

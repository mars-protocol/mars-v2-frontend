import React from 'react'
import useCreditManagerStore from 'stores/useCreditManagerStore'

import CreditManager from 'components/CreditManager'
import Navigation from 'components/Navigation'
import styles from './Layout.module.css'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isOpen = useCreditManagerStore((s) => s.isOpen)

  return (
    <div className={styles.background}>
      <Navigation />
      <div className={`${styles.container} relative`}>
        {children}
        {isOpen && <CreditManager />}
      </div>
    </div>
  )
}

export default Layout

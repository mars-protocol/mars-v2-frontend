import Navigation from "components/Navigation";
import React from "react";
import useCreditManagerStore from "stores/useCreditManagerStore";

import styles from "./Layout.module.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isOpen = useCreditManagerStore((s) => s.isOpen);

  return (
    <div className={styles.background}>
      <Navigation />
      <div className={`${styles.container} relative`}>
        {children}
        {isOpen && (
          <div className="absolute inset-0 left-auto p-2 w-[400px] bg-background-2 border-l border-white/20">
            Credit Manager Module
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;

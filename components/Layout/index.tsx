import Navigation from "components/Navigation";
import React from "react";

import styles from "./Layout.module.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.background}>
      <Navigation />
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export default Layout;

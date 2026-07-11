import React from "react";
import Sidebar from "./sidebar";

const Layout = ({ children }) => {
  const pageStyle = {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F6F8FC",
  };

  const contentStyle = {
    flex: 1,
    minWidth: 0,
    padding: "24px",
    overflowY: "auto",
  };

  return (
    <div style={pageStyle}>
      <Sidebar />
      <main style={contentStyle}>{children}</main>
    </div>
  );
};

export default Layout;

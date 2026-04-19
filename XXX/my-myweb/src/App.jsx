import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import IndexPage from "./pages/IndexPage";

function App() {
  const [page, setPage] = useState("admin");

return (
  <div style={styles.container}>
    
    {/* SIDEBAR */}
    <div style={styles.sidebar}>
      <div style={styles.logo}>🎓 Cert System</div>

      <div style={styles.menu}>
        <div
          className={`menu-item ${page === "admin" ? "active" : ""}`}
          onClick={() => setPage("admin")}
        >
          ⚙️ Dashboard
        </div>

        <div
          className={`menu-item ${page === "verify" ? "active" : ""}`}
          onClick={() => setPage("verify")}
        >
          🔍 Verify
        </div>
      </div>
    </div>

    {/* CONTENT */}
    <div style={styles.content}>
      {page === "admin" ? <AdminPage /> : <IndexPage />}
    </div>

  </div>
);
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "#fff",
  },

  sidebar: {
    width: 220,
    background: "#111827",
    padding: "20px 16px",
    borderRight: "1px solid rgba(255,255,255,0.05)",
  },

  logo: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 30,
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  content: {
    flex: 1,
    padding: 20,
    overflow: "auto",
  },
};

export default App;
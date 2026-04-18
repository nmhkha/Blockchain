import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import IndexPage from "./pages/IndexPage";

function App() {
  const [page, setPage] = useState("admin");

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setPage("admin")}>Admin</button>
        <button onClick={() => setPage("verify")}>Verify</button>
      </div>

      {page === "admin" ? <AdminPage /> : <IndexPage />}
    </div>
  );
}

export default App;
import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";


const uploadToIPFS = async (data) => {
  await new Promise((r) => setTimeout(r, 800));
  return "QmExampleIPFSHash" + Math.random().toString(36).slice(2, 8);
};

const hashData = (data) => {
  let hash = 0;
  const str = JSON.stringify(data);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "0");
};

export default function AdminPage() {
  const { account, connectWallet, mintCertificateOnChain } =
    useContext(Web3Context) || {};

  const [form, setForm] = useState({
    studentId: "",
    fullName: "",
    degree: "",
    major: "",
    graduationYear: "",
    gpa: "",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); 
  const [txHash, setTxHash] = useState("");
  const [logs, setLogs] = useState([]);

  const addLog = (msg) =>
    setLogs((prev) => [
      { msg, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => setFile(e.target.files[0] || null);

  const handleSubmit = async () => {
    const required = ["studentId", "fullName", "degree", "major", "graduationYear"];
    if (required.some((k) => !form[k].trim())) {
      setStatus("error");
      addLog("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      setStatus("loading");
      setTxHash("");

      
      addLog("Đang tải tệp lên IPFS...");
      const ipfsHash = await uploadToIPFS({ ...form, file: file?.name });
      addLog(`IPFS Hash: ${ipfsHash}`);

      
      addLog("Đang tạo mã băm chứng chỉ...");
      const certHash = hashData({ ...form, ipfsHash });
      addLog(`Mã băm: ${certHash.slice(0, 20)}...`);

      
      addLog("Đang ghi lên Blockchain...");
      const tx = mintCertificateOnChain
        ? await mintCertificateOnChain(certHash, ipfsHash)
        : { hash: "0xMockTx" + Math.random().toString(16).slice(2, 12) };

      setTxHash(tx.hash || tx);
      addLog(`Thành công! TX: ${(tx.hash || tx).slice(0, 20)}...`);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      addLog("Lỗi: " + (err.message || "Không xác định"));
    }
  };

  const handleReset = () => {
    setForm({ studentId: "", fullName: "", degree: "", major: "", graduationYear: "", gpa: "" });
    setFile(null);
    setStatus(null);
    setTxHash("");
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý Chứng chỉ</h1>
        <p style={styles.subtitle}>Cấp phát & ghi nhận chứng chỉ lên Blockchain</p>
        {account ? (
          <div style={styles.walletBadge}>
            <span style={styles.dot} />
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        ) : (
          <button style={styles.connectBtn} onClick={connectWallet}>
            Kết nối Ví
          </button>
        )}
      </div>

      <div style={styles.body}>
        {/* Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Thông tin Sinh viên</h2>
          <div style={styles.grid}>
            {[
              { label: "Mã sinh viên *", name: "studentId", placeholder: "VD: SV2024001" },
              { label: "Họ và tên *", name: "fullName", placeholder: "Nguyễn Văn A" },
              { label: "Bằng cấp *", name: "degree", placeholder: "Cử nhân / Thạc sĩ..." },
              { label: "Ngành học *", name: "major", placeholder: "Công nghệ Thông tin" },
              { label: "Năm tốt nghiệp *", name: "graduationYear", placeholder: "2024" },
              { label: "GPA", name: "gpa", placeholder: "3.5 / 4.0" },
            ].map(({ label, name, placeholder }) => (
              <div key={name} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  style={styles.input}
                />
              </div>
            ))}
          </div>

          {/* File Upload */}
          <div style={{ marginTop: 20 }}>
            <label style={styles.label}>Tệp đính kèm (PDF / Ảnh)</label>
            <label style={styles.fileLabel}>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <span style={styles.fileBtn}>Chọn tệp</span>
              <span style={styles.fileName}>
                {file ? file.name : "Chưa chọn tệp"}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button style={styles.resetBtn} onClick={handleReset}>
              Làm mới
            </button>
            <button
              style={{
                ...styles.mintBtn,
                opacity: status === "loading" ? 0.7 : 1,
                cursor: status === "loading" ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Đang xử lý..." : "Mint lên Blockchain"}
            </button>
          </div>

          {/* Status Banner */}
          {status === "success" && (
            <div style={{ ...styles.banner, ...styles.bannerSuccess }}>
              <strong>Cấp chứng chỉ thành công!</strong>
              {txHash && (
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  TX Hash: <code style={styles.code}>{txHash}</code>
                </div>
              )}
            </div>
          )}
          {status === "error" && (
            <div style={{ ...styles.banner, ...styles.bannerError }}>
              Có lỗi xảy ra. Kiểm tra log bên dưới.
            </div>
          )}
        </div>

        {/* Log Panel */}
        <div style={styles.logPanel}>
          <h2 style={styles.cardTitle}>Nhật ký xử lý</h2>
          {logs.length === 0 ? (
            <p style={styles.emptyLog}>Chưa có hoạt động nào.</p>
          ) : (
            <ul style={styles.logList}>
              {logs.map((l, i) => (
                <li key={i} style={styles.logItem}>
                  <span style={styles.logTime}>{l.time}</span>
                  <span>{l.msg}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    maxWidth: 900,
    margin: "0 auto",
    padding: "24px 16px",
    color: "#1a1a1a",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 22, fontWeight: 600 },
  subtitle: { margin: 0, fontSize: 14, color: "#666", flex: 1 },
  walletBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "6px 14px",
    borderRadius: 20,
    fontWeight: 500,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#43a047",
    display: "inline-block",
  },
  connectBtn: {
    padding: "8px 18px",
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
  },
  body: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 },
  card: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    padding: 24,
  },
  cardTitle: { margin: "0 0 18px", fontSize: 16, fontWeight: 600 },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px 20px",
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#555", fontWeight: 500 },
  input: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    transition: "border 0.2s",
  },
  fileLabel: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  fileBtn: {
    padding: "7px 16px",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    background: "#f5f5f5",
  },
  fileName: { fontSize: 13, color: "#888" },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 22,
  },
  resetBtn: {
    padding: "9px 20px",
    background: "transparent",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    color: "#555",
  },
  mintBtn: {
    padding: "9px 24px",
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
  },
  banner: {
    marginTop: 16,
    padding: "12px 16px",
    borderRadius: 8,
    fontSize: 14,
  },
  bannerSuccess: { background: "#e8f5e9", color: "#2e7d32" },
  bannerError: { background: "#fdecea", color: "#c62828" },
  code: {
    fontFamily: "monospace",
    fontSize: 11,
    wordBreak: "break-all",
    background: "rgba(0,0,0,0.06)",
    padding: "2px 6px",
    borderRadius: 4,
  },
  logPanel: {
    background: "#1a1a2e",
    border: "1px solid #333",
    borderRadius: 12,
    padding: 20,
    color: "#e0e0e0",
  },
  emptyLog: { color: "#666", fontSize: 13, margin: 0 },
  logList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  logItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 6,
    fontSize: 13,
    borderLeft: "3px solid #3a86ff",
  },
  logTime: { fontSize: 11, color: "#888" },
};
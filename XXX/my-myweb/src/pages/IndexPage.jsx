import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";


const mockVerify = async (hash) => {
  await new Promise((r) => setTimeout(r, 1000));
  
  if (!hash || hash.length < 10) throw new Error("Mã băm không hợp lệ.");
  if (hash.endsWith("a")) {
    return { valid: false, reason: "Chứng chỉ đã bị thu hồi." };
  }
  return {
    valid: true,
    studentId: "SV2024001",
    fullName: "Nguyễn Văn A",
    degree: "Cử nhân",
    major: "Công nghệ Thông tin",
    graduationYear: "2024",
    gpa: "3.75",
    ipfsHash: "QmExampleIPFSHash123456",
    mintedAt: "2024-06-15T08:30:00Z",
    txHash: "0xabc123def456789000000000000000000000000000000000000000000000001",
  };
};

export default function IndexPage() {
  const { verifyCertificateOnChain } = useContext(Web3Context) || {};

  const [inputHash, setInputHash] = useState("");
  const [result, setResult] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);

const handleVerify = async () => {
  if (!inputHash.trim()) return;

  setLoading(true);
  setResult(null);
  setStudent(null);

  try {
    const storage = JSON.parse(localStorage.getItem("certs") || "{}");

    const key = inputHash.trim();

    console.log("🔍 KEY:", key);
    console.log("📦 STORAGE:", storage);

    const data = storage[key];

    if (data) {
      console.log("✅ FOUND:", data);

      setStudent(data);

      setResult({
        valid: true,
        ...data,
      });

    } else {
      console.log("❌ NOT FOUND");

      setStudent(null);

      setResult({
        valid: false,
        error: "Không tìm thấy chứng chỉ",
      });
    }

  } catch (err) {
    console.log("🔥 ERROR:", err);

    setStudent(null);

    setResult({
      valid: false,
      error: "Lỗi xử lý dữ liệu",
    });

  } finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  const handleClear = () => {
    setInputHash("");
    setResult(null);
    setStudent(null);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.hero}>
        <div style={styles.iconWrap}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 style={styles.heroTitle}>Tra cứu Chứng chỉ</h1>
        <p style={styles.heroSub}>
          Xác minh tính hợp lệ của chứng chỉ thông qua Blockchain
        </p>
      </div>

      {/* Search Box */}
      <div style={styles.searchCard}>
        <label style={styles.searchLabel}>Nhập mã băm (Hash) chứng chỉ</label>
        <div style={styles.searchRow}>
          <input
            onChange={(e) => setInputHash(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0x... hoặc Qm... (IPFS hash)"
            style={styles.searchInput}
          />
          <button
            style={{
              ...styles.verifyBtn,
              opacity: loading || !inputHash.trim() ? 0.6 : 1,
              cursor: loading || !inputHash.trim() ? "not-allowed" : "pointer",
            }}
            onClick={handleVerify}
            disabled={loading || !inputHash.trim()}
          >
            {loading ? "Đang kiểm tra..." : "Xác minh"}
          </button>
          {inputHash && (
            <button style={styles.clearBtn} onClick={handleClear}>
              Xoá
            </button>
          )}
        </div>
        <p style={styles.hint}>
          Mã băm được cung cấp bởi trường đại học hoặc nhà tuyển dụng nhận từ ứng viên.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.statusBox}>
          <div style={styles.spinner} />
          <span style={{ color: "#555", fontSize: 14 }}>
            Đang truy vấn Smart Contract...
          </span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
  <>
    {result.valid === true && (
      <>
        <StatusBanner
          valid={true}
          message="Chứng chỉ hợp lệ và được xác thực trên Blockchain."
        />
        <CertCard data={result} />
      </>
    )}

    {result.valid === false && (
      <StatusBanner
        valid={false}
        message={result.error || "Không tìm thấy chứng chỉ"}
      />
    )}
  </>
)}

      {/* Empty state */}
      {!result && !loading && (
        <div style={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p style={{ color: "#aaa", marginTop: 12, fontSize: 14 }}>
            Nhập mã băm để tra cứu chứng chỉ
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBanner({ valid, message }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 20px",
        borderRadius: 10,
        marginBottom: 20,
        background: valid ? "#e8f5e9" : "#fdecea",
        border: `1px solid ${valid ? "#a5d6a7" : "#ef9a9a"}`,
      }}
    >
      <span style={{ fontSize: 20 }}>{valid ? "✅" : "❌"}</span>
      <div>
        <strong style={{ color: valid ? "#2e7d32" : "#c62828", fontSize: 15 }}>
          {valid ? "Hợp lệ" : "Không hợp lệ"}
        </strong>
        <p style={{ margin: 0, fontSize: 13, color: valid ? "#388e3c" : "#d32f2f" }}>
          {message}
        </p>
      </div>
    </div>
  );
}

function CertCard({ data }) {
  const fields = [
    { label: "Mã sinh viên", value: data.studentId },
    { label: "Họ và tên", value: data.fullName },
    { label: "Bằng cấp", value: data.degree },
    { label: "Ngành học", value: data.major },
    { label: "Năm tốt nghiệp", value: data.graduationYear },
    { label: "GPA", value: data.gpa },
  ];

  return (
    <div style={styles.certCard}>
      {/* Card Header */}
      <div style={styles.certHeader}>
        <div style={styles.avatar}>
          {data.fullName
            ?.split(" ")
            .slice(-2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </div>
        <div>
          <h2 style={styles.certName}>{data.fullName}</h2>
          <span style={styles.certBadge}>{data.degree} — {data.major}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div style={styles.certGrid}>
        {fields.map(({ label, value }) => (
          <div key={label} style={styles.certField}>
            <span style={styles.certFieldLabel}>{label}</span>
            <span style={styles.certFieldValue}>{value || "—"}</span>
          </div>
        ))}
      </div>

      {/* Chain Info */}
      <div style={styles.chainInfo}>
        <h3 style={styles.chainTitle}>Thông tin Blockchain</h3>
        <div style={styles.hashRow}>
          <span style={styles.hashLabel}>IPFS</span>
          <code style={styles.hashVal}>{data.ipfsHash}</code>
        </div>
        <div style={styles.hashRow}>
          <span style={styles.hashLabel}>TX Hash</span>
          <code style={styles.hashVal}>{data.txHash?.slice(0, 42)}...</code>
        </div>
        <div style={styles.hashRow}>
          <span style={styles.hashLabel}>Ngày cấp</span>
          <span style={{ fontSize: 13, color: "#555" }}>
            {data.mintedAt ? new Date(data.mintedAt).toLocaleDateString("vi-VN") : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    maxWidth: 680,
    margin: "0 auto",
    padding: "32px 16px",
    color: "#1a1a1a",
  },
  hero: {
    textAlign: "center",
    marginBottom: 32,
  },
  iconWrap: {
    width: 56,
    height: 56,
    background: "#e8f0fe",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  heroTitle: { margin: "0 0 8px", fontSize: 26, fontWeight: 700 },
  heroSub: { margin: 0, color: "#666", fontSize: 15 },
  searchCard: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  searchLabel: { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 10 },
  searchRow: { display: "flex", gap: 10 },
  searchInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "monospace",
    outline: "none",
  },
  verifyBtn: {
    padding: "10px 22px",
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  clearBtn: {
    padding: "10px 14px",
    background: "transparent",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    color: "#666",
  },
  hint: { margin: "10px 0 0", fontSize: 12, color: "#999" },
  statusBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 32,
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "2px solid #e0e0e0",
    borderTopColor: "#1a73e8",
    animation: "spin 0.8s linear infinite",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 0",
  },
  certCard: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
  },
  certHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "20px 24px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#e8f0fe",
    color: "#1a73e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
  },
  certName: { margin: "0 0 4px", fontSize: 18, fontWeight: 600 },
  certBadge: {
    display: "inline-block",
    background: "#e8f0fe",
    color: "#1557b0",
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 500,
  },
  certGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 0,
    padding: "0 24px",
  },
  certField: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    padding: "14px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  certFieldLabel: { fontSize: 12, color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 },
  certFieldValue: { fontSize: 15, fontWeight: 500 },
  chainInfo: {
    padding: "16px 24px",
    background: "#1a1a2e",
    borderTop: "1px solid #333",
  },
  chainTitle: { margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 },
  hashRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  hashLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#666",
    width: 50,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hashVal: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#64b5f6",
    wordBreak: "break-all",
  },
};
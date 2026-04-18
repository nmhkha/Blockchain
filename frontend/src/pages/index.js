import React, { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context"; // Đảm bảo đường dẫn đúng

export default function Home() {
  const [hashInput, setHashInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { currentAccount, verifyCertificateOnChain } = useContext(Web3Context);

  const handleSearch = async () => {
    if (!hashInput) return setError("Vui lòng nhập mã băm (Hash)!");
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Gọi hàm tra cứu từ Web3Context
      const certData = await verifyCertificateOnChain(hashInput);
      
      if (certData && certData[0]) {
        // Dữ liệu trả về từ Smart Contract thường là một mảng hoặc object
        setResult({
          studentId: certData[0],
          studentName: certData[1],
          major: certData[2],
          ipfsHash: certData[3],
          // Convert timestamp sang ngày tháng dễ nhìn
          issueDate: new Date(Number(certData[4]) * 1000).toLocaleDateString('vi-VN'), 
          isValid: certData[5]
        });
      } else {
        setError("❌ Không tìm thấy chứng chỉ với mã băm này!");
      }
    } catch (err) {
      setError("❌ Có lỗi xảy ra khi tra cứu Blockchain.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎓 Hệ thống Xác thực Chứng chỉ Số</h1>
        <p style={styles.subtitle}>Minh bạch - An toàn - Phi tập trung trên Blockchain</p>
        {currentAccount && (
          <div style={styles.walletBadge}>
            🟢 Ví đang dùng: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
          </div>
        )}
      </div>

      {/* Thanh tìm kiếm */}
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Nhập mã băm (Hash) của chứng chỉ vào đây..."
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSearch} disabled={loading} style={styles.button}>
          {loading ? "⏳ Đang quét khối..." : "🔍 Tra cứu ngay"}
        </button>
      </div>

      {/* Hiển thị lỗi */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Hiển thị Kết quả */}
      {result && (
        <div style={styles.resultCard}>
          <div style={styles.statusBadge(result.isValid)}>
            {result.isValid ? "✅ CHỨNG CHỈ HỢP LỆ" : "⛔ CHỨNG CHỈ ĐÃ BỊ THU HỒI"}
          </div>
          
          <div style={styles.infoRow}>
            <span style={styles.label}>Sinh viên:</span>
            <span style={styles.value}>{result.studentName}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Mã số SV:</span>
            <span style={styles.value}>{result.studentId}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Ngành học:</span>
            <span style={styles.value}>{result.major}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Ngày cấp:</span>
            <span style={styles.value}>{result.issueDate}</span>
          </div>
          
          <div style={styles.ipfsLink}>
            <a href={`https://ipfs.io/ipfs/${result.ipfsHash}`} target="_blank" rel="noreferrer" style={{color: '#3498db'}}>
              📄 Xem file gốc trên IPFS
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// === CÁC THIẾT LẬP MÀU SẮC & LÀM ĐẸP (CSS) ===
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f7f6",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "50px 20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    color: "#2c3e50",
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#7f8c8d",
    fontSize: "1.1rem",
  },
  walletBadge: {
    marginTop: "15px",
    display: "inline-block",
    backgroundColor: "#e8f8f5",
    color: "#16a085",
    padding: "8px 15px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    border: "1px solid #1abc9c",
  },
  searchBox: {
    display: "flex",
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
    borderRadius: "30px",
    overflow: "hidden",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    padding: "20px 25px",
    border: "none",
    fontSize: "1.1rem",
    outline: "none",
  },
  button: {
    padding: "0 30px",
    backgroundColor: "#2980b9",
    color: "white",
    border: "none",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  error: {
    marginTop: "20px",
    color: "#e74c3c",
    backgroundColor: "#fadbd8",
    padding: "15px 25px",
    borderRadius: "10px",
    fontWeight: "bold",
  },
  resultCard: {
    marginTop: "40px",
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
    borderTop: "5px solid #27ae60",
  },
  statusBadge: (isValid) => ({
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: isValid ? "#d5f5e3" : "#fadbd8",
    color: isValid ? "#27ae60" : "#c0392b",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginBottom: "25px",
    width: "100%",
    textAlign: "center",
  }),
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #eee",
    padding: "12px 0",
    fontSize: "1.1rem",
  },
  label: {
    color: "#7f8c8d",
    fontWeight: "bold",
  },
  value: {
    color: "#2c3e50",
    fontWeight: "bold",
  },
  ipfsLink: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "1rem",
    fontWeight: "bold",
  }
};
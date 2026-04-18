import React, { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";

export default function Admin() {
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "", major: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  
  const { currentAccount, connectWallet, mintCertificateOnChain } = useContext(Web3Context);

  const handleMint = async () => {
    if (!studentInfo.name || !studentInfo.id || !studentInfo.major) {
      return setStatus({ type: "error", message: "⚠️ Vui lòng nhập đầy đủ thông tin sinh viên!" });
    }
    
    setLoading(true);
    setStatus({ type: "processing", message: "⏳ Đang gửi yêu cầu lên Blockchain. Vui lòng xác nhận trên MetaMask..." });
    
    try {
      // Tạo mã băm (Hash) làm ID duy nhất cho bằng cấp
      const rawString = `${studentInfo.name}-${studentInfo.id}-${Date.now()}`;
      const certificateHash = ethers.keccak256(ethers.toUtf8Bytes(rawString));
      
      const mockIpfs = "ipfs://QmDefaultHashForDemo"; // Link IPFS giả lập

      // Gọi hàm cấp bằng
      const success = await mintCertificateOnChain(
        certificateHash,
        studentInfo.id,
        studentInfo.name,
        studentInfo.major,
        mockIpfs
      );
      
      if (success) {
        setStatus({ 
          type: "success", 
          message: `✅ CẤP BẰNG THÀNH CÔNG!\n\nMã tra cứu của sinh viên là:\n${certificateHash}` 
        });
        // Reset form sau khi thành công
        setStudentInfo({ name: "", id: "", major: "" });
      } else {
        setStatus({ type: "error", message: "❌ Giao dịch thất bại hoặc bị từ chối bởi MetaMask." });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "❌ Đã có lỗi hệ thống xảy ra." });
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🛠 Trang Quản Trị Hệ Thống</h1>
          <p style={styles.subtitle}>Khu vực dành riêng cho Ban Giám Hiệu cấp phát chứng chỉ</p>
        </div>

        {!currentAccount ? (
          <div style={styles.connectSection}>
            <div style={styles.warningBox}>
              🔒 Bạn cần kết nối ví có quyền Admin để truy cập khu vực này.
            </div>
            <button onClick={connectWallet} style={styles.connectBtn}>
              🦊 Kết nối ví MetaMask
            </button>
          </div>
        ) : (
          <div style={styles.formSection}>
            <div style={styles.walletInfo}>
              🟢 Trạng thái: Đã kết nối Admin <br/>
              <code style={styles.codeSnippet}>{currentAccount}</code>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Họ và tên sinh viên</label>
              <input 
                value={studentInfo.name}
                placeholder="VD: Nguyễn Văn A" 
                onChange={e => setStudentInfo({...studentInfo, name: e.target.value})} 
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mã số sinh viên (MSSV)</label>
              <input 
                value={studentInfo.id}
                placeholder="VD: SV123456" 
                onChange={e => setStudentInfo({...studentInfo, id: e.target.value})} 
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Ngành học</label>
              <input 
                value={studentInfo.major}
                placeholder="VD: Kỹ thuật Phần mềm" 
                onChange={e => setStudentInfo({...studentInfo, major: e.target.value})} 
                style={styles.input}
              />
            </div>

            <button onClick={handleMint} disabled={loading} style={styles.mintBtn(loading)}>
              {loading ? "⚙️ Đang đóng dấu lên Blockchain..." : "✍️ Khắc bằng lên Blockchain"}
            </button>

            {status.message && (
              <div style={styles.statusBox(status.type)}>
                {status.message.split('\n').map((line, index) => (
                  <span key={index}>{line}<br/></span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// === CÁC THIẾT LẬP MÀU SẮC LÀM ĐẸP (CSS) ===
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f7f6",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },
  card: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: "550px",
    borderRadius: "20px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
    padding: "40px",
    borderTop: "5px solid #2980b9",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    color: "#2c3e50",
    fontSize: "2rem",
    margin: "0 0 10px 0",
  },
  subtitle: {
    color: "#7f8c8d",
    fontSize: "1rem",
    margin: 0,
  },
  connectSection: {
    textAlign: "center",
    marginTop: "20px",
  },
  warningBox: {
    backgroundColor: "#fef9e7",
    color: "#d4ac0d",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid #f1c40f",
  },
  connectBtn: {
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    padding: "15px 30px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    borderRadius: "30px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(230, 126, 34, 0.4)",
    transition: "transform 0.2s",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  walletInfo: {
    backgroundColor: "#e8f8f5",
    color: "#16a085",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "0.9rem",
    border: "1px solid #1abc9c",
  },
  codeSnippet: {
    display: "inline-block",
    marginTop: "5px",
    backgroundColor: "white",
    padding: "2px 8px",
    borderRadius: "5px",
    fontWeight: "bold",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "bold",
    color: "#34495e",
    fontSize: "0.95rem",
  },
  input: {
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #bdc3c7",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s",
  },
  mintBtn: (isLoading) => ({
    backgroundColor: isLoading ? "#95a5a6" : "#2980b9",
    color: "white",
    border: "none",
    padding: "16px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    borderRadius: "10px",
    cursor: isLoading ? "not-allowed" : "pointer",
    marginTop: "10px",
    boxShadow: isLoading ? "none" : "0 4px 15px rgba(41, 128, 185, 0.4)",
  }),
  statusBox: (type) => ({
    marginTop: "20px",
    padding: "20px",
    borderRadius: "10px",
    fontWeight: "bold",
    lineHeight: "1.5",
    wordBreak: "break-all",
    backgroundColor: type === "success" ? "#d5f5e3" : type === "error" ? "#fadbd8" : "#ebf5fb",
    color: type === "success" ? "#27ae60" : type === "error" ? "#c0392b" : "#2980b9",
    border: `1px solid ${type === "success" ? "#2ecc71" : type === "error" ? "#e74c3c" : "#3498db"}`,
  })
};
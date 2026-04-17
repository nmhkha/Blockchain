import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export default function Test() {
    const { account, connectWallet, mintCertificateOnChain, verifyCertificateOnChain } = useWeb3();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        certHash: "CERT001",
        studentId: "SV01",
        studentName: "Nguyễn Văn A",
        major: "Blockchain",
        ipfsHash: "Qm123"
    });

    const handleMint = async () => {
        setLoading(true);
        const res = await mintCertificateOnChain(form.certHash, form.studentId, form.studentName, form.major, form.ipfsHash);
        setResult(res.success ? `✅ Đã lưu lên mạng: ${res.hash}` : `❌ Thất bại: ${res.error}`);
        setLoading(false);
    };

    const handleVerify = async () => {
        setLoading(true);
        const data = await verifyCertificateOnChain(form.certHash);
        if (data && data.isValid) {
            setResult(`🔍 Tìm thấy: ${data.studentName} - Ngành: ${data.major} (Ngày: ${data.issueDate})`);
        } else {
            setResult("❌ Không tìm thấy thông tin!");
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "auto", fontFamily: "sans-serif" }}>
            <h2>Hệ Thống Chứng Chỉ UTC</h2>
            <button onClick={connectWallet} style={{ marginBottom: "20px", padding: "10px" }}>
                {account ? `Ví: ${account.slice(0, 6)}...` : "Kết nối Ví MetaMask"}
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input value={form.certHash} placeholder="Mã Hash chứng chỉ" onChange={e => setForm({ ...form, certHash: e.target.value })} />
                <input value={form.studentName} placeholder="Tên sinh viên" onChange={e => setForm({ ...form, studentName: e.target.value })} />
                <input value={form.major} placeholder="Chuyên ngành" onChange={e => setForm({ ...form, major: e.target.value })} />

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button disabled={loading} onClick={handleMint} style={{ flex: 1, padding: "10px", backgroundColor: "#4CAF50", color: "white" }}>
                        {loading ? "Đang xử lý..." : "MINT (Tạo)"}
                    </button>
                    <button disabled={loading} onClick={handleVerify} style={{ flex: 1, padding: "10px", backgroundColor: "#2196F3", color: "white" }}>
                        {loading ? "Đang check..." : "VERIFY (Kiểm tra)"}
                    </button>
                </div>
            </div>

            {result && (
                <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "5px", wordBreak: "break-all" }}>
                    <strong>Kết quả:</strong> <p>{result}</p>
                </div>
            )}
        </div>
    );
}
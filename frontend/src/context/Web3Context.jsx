import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

// CHÚ Ý: Bạn phải dán địa chỉ sau khi chạy lệnh "npx hardhat run scripts/deploy.js" vào đây
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const contractABI = [
    "function mintCertificate(string _certHash, string _studentId, string _studentName, string _major, string _ipfsHash) public",
    "function verifyCertificate(string _certHash) view returns (string studentId, string studentName, string major, string ipfsHash, uint256 issueDate, bool isValid)"
];

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);

    const connectWallet = async () => {
        try {
            if (!window.ethereum) return alert("Hãy cài MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const instance = new ethers.Contract(contractAddress, contractABI, signer);
            setAccount(address);
            setContract(instance);
            return address;
        } catch (err) {
            console.error("Lỗi kết nối:", err);
            return null;
        }
    };

    const mintCertificateOnChain = async (certHash, studentId, studentName, major, ipfsHash) => {
        try {
            if (!contract) throw new Error("Chưa kết nối ví!");
            const tx = await contract.mintCertificate(certHash, studentId, studentName, major, ipfsHash);
            await tx.wait(); // Chờ giao dịch hoàn tất
            return { success: true, hash: tx.hash };
        } catch (err) {
            console.error("Lỗi Mint:", err);
            return { success: false, error: err.reason || err.message };
        }
    };

    const verifyCertificateOnChain = async (certHash) => {
        try {
            if (!contract) throw new Error("Chưa kết nối ví!");
            const res = await contract.verifyCertificate(certHash);
            // Quan trọng: Convert BigInt sang String để tránh lỗi hiển thị
            return {
                studentId: res[0],
                studentName: res[1],
                major: res[2],
                ipfsHash: res[3],
                issueDate: res[4].toString(),
                isValid: res[5]
            };
        } catch (err) {
            console.error("Lỗi Verify:", err);
            return null;
        }
    };

    return (
        <Web3Context.Provider value={{ account, connectWallet, mintCertificateOnChain, verifyCertificateOnChain }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => useContext(Web3Context);
import React, { createContext, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../utils/abi.json"; // Gọi file ABI

export const Web3Context = createContext();

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const Web3Provider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");

  // Hàm gọi Smart Contract
  const getEthereumContract = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt ví MetaMask!");
      return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
  };

  // Hàm kết nối ví MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Vui lòng cài MetaMask.");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  // Hàm Tra cứu (Verify)
  const verifyCertificateOnChain = async (hash) => {
    try {
      const contract = await getEthereumContract();
      if (!contract) return;
      
      // Hàm verifyCertificate phải trùng tên với hàm trong file .sol của bạn
      const isValid = await contract.verifyCertificate(hash); 
      return isValid;
    } catch (error) {
      console.error("Lỗi tra cứu:", error);
      return false;
    }
  };

  // --- PHẦN THÊM MỚI CHO TRANG ADMIN ---
  const mintCertificateOnChain = async (certHash, studentId, studentName, major, ipfsHash) => {
    try {
      const contract = await getEthereumContract();
      if (!contract) return false;
      
      // Truyền đủ 5 tham số theo đúng thứ tự trong file .sol của bạn
      const tx = await contract.mintCertificate(
        certHash, 
        studentId, 
        studentName, 
        major, 
        ipfsHash
      ); 
      
      console.log("Đang chờ Blockchain xác nhận...");
      await tx.wait(); 
      return true;
    } catch (error) {
      console.error("Lỗi khi Mint:", error);
      return false;
    }
  };

  return (
    <Web3Context.Provider value={{ 
      currentAccount, 
      connectWallet, 
      verifyCertificateOnChain,
      mintCertificateOnChain // Đưa hàm vào đây để các trang khác có thể gọi
    }}>
      {children}
    </Web3Context.Provider>
  );
};
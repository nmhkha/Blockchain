import { createContext } from "react";

export const Web3Context = createContext({
  account: "0x1234567890abcdef",
  connectWallet: () => alert("Giả lập connect ví"),
  mintCertificateOnChain: async () => {
    return { hash: "0xFAKE_TX_123456" };
  },
});
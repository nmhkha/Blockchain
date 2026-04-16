import { ethers } from "ethers";

/**
 * Hàm băm thông tin sinh viên và link IPFS thành một mã Hash duy nhất
 * @param {string} studentId - Mã số sinh viên
 * @param {string} studentName - Tên sinh viên
 * @param {string} ipfsHash - Mã CID nhận được từ Pinata
 * @returns {string} - Mã băm chuẩn Keccak-256 (bắt đầu bằng 0x...)
 */
export const generateCertificateHash = (studentId, studentName, ipfsHash) => {
    try {
        // 1. Gom các trường thông tin quan trọng thành một chuỗi duy nhất
        // Lưu ý: Tuyệt đối không thay đổi thứ tự ghép chuỗi sau này, nếu không mã Hash sẽ bị sai.
        const rawData = `${studentId}|${studentName}|${ipfsHash}`;

        // 2. Chuyển đổi chuỗi thành dạng bytes
        const dataBytes = ethers.toUtf8Bytes(rawData);

        // 3. Băm dữ liệu bằng chuẩn Keccak-256 của Ethereum
        const finalHash = ethers.keccak256(dataBytes);

        console.log("Chuỗi gốc:", rawData);
        console.log("Mã băm tạo ra:", finalHash);

        return finalHash;
    } catch (error) {
        console.error("Lỗi khi băm dữ liệu:", error);
        throw error;
    }
};
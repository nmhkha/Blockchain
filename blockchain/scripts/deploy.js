import hre from "hardhat";

async function main() {
    console.log("⏳ Đang khởi tạo giao dịch deploy...");

    // 1. Lấy mã nguồn contract đã được biên dịch
    const Certificate = await hre.ethers.getContractFactory("AcademicCertificate");

    // 2. Gửi lệnh deploy lên mạng lưới
    const certificate = await Certificate.deploy();

    // 3. Chờ mạng lưới xác nhận giao dịch (Chuẩn Ethers v6)
    await certificate.waitForDeployment();

    // 4. Lấy địa chỉ của contract sau khi lên chuỗi
    const contractAddress = await certificate.getAddress();

    console.log("\n==========================================");
    console.log("✅ DEPLOY THÀNH CÔNG!");
    console.log("📍 Contract Address: ", contractAddress);
    console.log("==========================================");
}

// Bắt lỗi nếu có
main().catch((error) => {
    console.error("❌ Lỗi khi deploy:", error);
    process.exitCode = 1;
});
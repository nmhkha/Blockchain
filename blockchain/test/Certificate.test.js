import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("AcademicCertificate Smart Contract", function () {
    // Khai báo các biến dùng chung cho toàn bộ các bài test
    let Certificate;
    let certificate;
    let admin;
    let student;
    let employer;

    // Dữ liệu mẫu (Mock data)
    const MOCK_CERT_HASH = "0x7465737468617368313233000000000000000000000000000000000000000000"; // Định dạng bytes32 ảo
    const STUDENT_ID = "SV001";
    const STUDENT_NAME = "Minh Kha";
    const MAJOR = "Data Science";
    const IPFS_HASH = "QmTest123456789";

    // Hàm beforeEach: Chạy lại TỪ ĐẦU trước mỗi một bài test (it)
    // Giúp đảm bảo dữ liệu test trước không ảnh hưởng tới test sau
    beforeEach(async function () {
        // Lấy danh sách các tài khoản (ví) ảo do Hardhat cung cấp
        [admin, student, employer] = await ethers.getSigners();

        // Lấy mã nguồn Contract đã compile
        Certificate = await ethers.getContractFactory("AcademicCertificate");

        // Deploy contract mới tinh
        certificate = await Certificate.deploy();
        // Chờ cho contract deploy xong (Hardhat v6 trở lên dùng await certificate.waitForDeployment() nếu lỗi)
        await certificate.waitForDeployment();
    });

    // ========================================================
    // NHÓM TEST 1: Kiểm tra hàm Khởi tạo (Deployment)
    // ========================================================
    describe("Deployment", function () {
        it("Phải gán đúng địa chỉ ví Deployer làm University Admin", async function () {
            // Kỳ vọng (expect): Biến universityAdmin trên contract phải bằng địa chỉ ví admin
            expect(await certificate.universityAdmin()).to.equal(admin.address);
        });
    });

    // ========================================================
    // NHÓM TEST 2: Kiểm tra chức năng Cấp bằng (Minting)
    // ========================================================
    describe("Minting Certificates", function () {
        it("Admin phải cấp được bằng mới và lưu đúng thông tin", async function () {
            // Admin gọi hàm cấp bằng
            await certificate.mintCertificate(
                MOCK_CERT_HASH,
                STUDENT_ID,
                STUDENT_NAME,
                MAJOR,
                IPFS_HASH
            );

            // Lấy thông tin bằng vừa cấp ra để kiểm tra
            const certData = await certificate.verifyCertificate(MOCK_CERT_HASH);

            // Kiểm tra từng trường dữ liệu
            expect(certData.studentId).to.equal(STUDENT_ID);
            expect(certData.studentName).to.equal(STUDENT_NAME);
            expect(certData.isValid).to.equal(true);
        });

        it("Phải BÁO LỖI (Revert) nếu KHÔNG PHẢI Admin cố tình cấp bằng", async function () {
            // Giả lập hacker (ví student) gọi hàm cấp bằng bằng lệnh .connect(student)
            await expect(
                certificate.connect(student).mintCertificate(
                    MOCK_CERT_HASH,
                    "HackerID",
                    "HackerName",
                    "IT",
                    "QmHacker"
                )
            ).to.be.revertedWith("Access Denied: Only University Admin can perform this action");
        });

        it("Phải BÁO LỖI nếu cấp một mã Hash đã tồn tại (Chống cấp đúp)", async function () {
            // Lần 1: Cấp hợp lệ
            await certificate.mintCertificate(MOCK_CERT_HASH, STUDENT_ID, STUDENT_NAME, MAJOR, IPFS_HASH);

            // Lần 2: Cố tình cấp lại mã Hash đó
            await expect(
                certificate.mintCertificate(MOCK_CERT_HASH, "SV002", "New Name", "IT", "QmNew")
            ).to.be.revertedWith("Error: Certificate Hash already exists!");
        });
    });

    // ========================================================
    // NHÓM TEST 3: Kiểm tra chức năng Thu hồi (Revoke)
    // ========================================================
    describe("Revoking Certificates", function () {
        // Chạy sẵn lệnh cấp bằng trước mỗi bài test trong nhóm này
        beforeEach(async function () {
            await certificate.mintCertificate(MOCK_CERT_HASH, STUDENT_ID, STUDENT_NAME, MAJOR, IPFS_HASH);
        });

        it("Admin phải thu hồi được bằng (Chuyển isValid thành false)", async function () {
            // Gọi hàm thu hồi
            await certificate.revokeCertificate(MOCK_CERT_HASH);

            // Lấy data ra check lại
            const certData = await certificate.verifyCertificate(MOCK_CERT_HASH);
            expect(certData.isValid).to.equal(false);
        });

        it("Phải BÁO LỖI nếu KHÔNG PHẢI Admin cố tình thu hồi bằng", async function () {
            // Giả lập ai đó (ví employer) cố tình thu hồi
            await expect(
                certificate.connect(employer).revokeCertificate(MOCK_CERT_HASH)
            ).to.be.revertedWith("Access Denied: Only University Admin can perform this action");
        });
    });
});
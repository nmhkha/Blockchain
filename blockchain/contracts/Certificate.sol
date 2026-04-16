// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AcademicCertificate {
    // 1. Khai báo người quản trị (Nhà trường)
    address public universityAdmin;

    // 2. Cấu trúc dữ liệu của một tấm bằng
    struct Certificate {
        string studentId;
        string studentName;
        string major;
        string ipfsHash; // Link trỏ tới file PDF lưu trên IPFS
        uint256 issueDate;
        bool isValid;    // Trạng thái: true = Hợp lệ, false = Bị thu hồi
    }

    // 3. Mapping: Dùng mã Hash tổng của bằng cấp để tra cứu ra thông tin (Giống Dictionary)
    mapping(string => Certificate) private certificates;

    // 4. Events: Lưu lại lịch sử giao dịch trên chuỗi để Frontend dễ dàng lắng nghe
    event CertificateIssued(string indexed certHash, string studentId);
    event CertificateRevoked(string indexed certHash);

    // 5. Hàm khởi tạo (Chạy 1 lần duy nhất khi deploy)
    constructor() {
        universityAdmin = msg.sender; // Gán ví deploy contract làm Admin
    }

    // 6. Modifier: Bộ lọc bảo mật, chỉ Admin mới được chạy các hàm bên dưới
    modifier onlyAdmin() {
        require(msg.sender == universityAdmin, "Access Denied: Only University Admin can perform this action");
        _;
    }

    // ==========================================
    // CÁC HÀM NGHIỆP VỤ CHÍNH
    // ==========================================

    /**
     * @dev Cấp phát một chứng chỉ mới (Chỉ Admin)
     */
    function mintCertificate(
        string memory _certHash, 
        string memory _studentId, 
        string memory _studentName, 
        string memory _major, 
        string memory _ipfsHash
    ) public onlyAdmin {
        // Kiểm tra xem bằng này đã tồn tại chưa
        require(bytes(certificates[_certHash].studentId).length == 0, "Error: Certificate Hash already exists!");

        // Lưu thông tin vào Blockchain
        certificates[_certHash] = Certificate({
            studentId: _studentId,
            studentName: _studentName,
            major: _major,
            ipfsHash: _ipfsHash,
            issueDate: block.timestamp,
            isValid: true
        });

        // Phát tín hiệu ra mạng lưới
        emit CertificateIssued(_certHash, _studentId);
    }

    /**
     * @dev Xác minh chứng chỉ (Bất kỳ ai cũng có thể gọi)
     */
    function verifyCertificate(string memory _certHash) public view returns (
        string memory studentId,
        string memory studentName,
        string memory major,
        string memory ipfsHash,
        uint256 issueDate,
        bool isValid
    ) {
        // Kiểm tra xem mã băm có tồn tại không
        require(bytes(certificates[_certHash].studentId).length != 0, "Error: Certificate not found!");

        Certificate memory cert = certificates[_certHash];
        return (cert.studentId, cert.studentName, cert.major, cert.ipfsHash, cert.issueDate, cert.isValid);
    }

    /**
     * @dev Thu hồi chứng chỉ (Chỉ Admin)
     */
    function revokeCertificate(string memory _certHash) public onlyAdmin {
        require(bytes(certificates[_certHash].studentId).length != 0, "Error: Certificate not found!");
        require(certificates[_certHash].isValid == true, "Error: Certificate is already revoked!");

        certificates[_certHash].isValid = false;
        emit CertificateRevoked(_certHash);
    }
}
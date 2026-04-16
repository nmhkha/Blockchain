
# 🎓 Hệ thống Cấp và Xác thực Chứng chỉ số (D-App)

Dự án áp dụng công nghệ Blockchain (Ethereum/Polygon) và IPFS để lưu trữ, cấp phát và xác thực bằng đại học/chứng chỉ khóa học nhằm chống làm giả và dễ dàng tra cứu.

---

## 🏗 Kiến trúc Hệ thống

Dự án được thiết kế theo cấu trúc Monorepo, bao gồm 2 phần độc lập nhưng giao tiếp với nhau:

1. **Lớp On-chain (`/blockchain`):** Xây dựng bằng Solidity và Hardhat. Chứa Smart Contract quản lý việc mint (cấp), verify (xác thực) và revoke (thu hồi) bằng cấp.
2. **Lớp Off-chain (`/frontend`):** Xây dựng bằng Next.js (React). Chứa giao diện người dùng, mã hóa dữ liệu (Hash) và kết nối với mạng IPFS thông qua Pinata.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Dành cho toàn bộ Team)

**Yêu cầu bắt buộc:** Máy tính cần cài sẵn **Node.js** (phiên bản 18 trở lên) và **MetaMask** (Extension trên trình duyệt).

### Bước 1: Khởi động mạng lưới Blockchain ảo
Mở **Terminal 1**, di chuyển vào thư mục blockchain và chạy mạng lưới nội bộ:
```bash
git clone "https://github.com/nmhkha/Blockchain"
cd blockchain
npm install
npx hardhat node
```
*⚠️ KHÔNG TẮT terminal này trong suốt quá trình code.*

### Bước 2: Deploy Smart Contract
Mở **Terminal 2**, chạy lệnh để đưa contract lên mạng lưới vừa tạo ở Bước 1:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```
👉 **Lưu ý quan trọng cho Team Frontend:** Sau khi chạy lệnh trên, terminal sẽ in ra một chuỗi `Contract Address` (VD: `0x5FbDB231...`). Các bạn phải copy mã này để sử dụng cho Web3Context.

### Bước 3: Khởi chạy Giao diện (Frontend)
Mở **Terminal 3**, di chuyển vào thư mục frontend và khởi chạy Next.js:
```bash
cd frontend
npm install
npm run dev
```
Truy cập trang web tại: `http://localhost:3000`

---

## 🛠 Phân chia Nhiệm vụ (Task List)

### 🟢 Team Blockchain & Smart Contract (Hoàn thành: ✅)
- Viết logic cấp/xác thực/thu hồi trong `Certificate.sol`.
- Viết Unit Test tự động bằng Chai/Mocha trong `Certificate.test.js`.
- Viết script deploy lên mạng lưới trong `deploy.js`.

### 🔵 Team Web3 Integration & Frontend (Đang làm: ⏳)
**1. Setup Web3Context (`/frontend/src/context/Web3Context.js`):**
- Import thư viện `ethers.js`.
- Cấu hình biến `CONTRACT_ADDRESS` (lấy từ Bước 2) và file ABI.
- Viết các hàm: `connectWallet()`, `mintCertificateOnChain()`, `verifyCertificateOnChain()`.


**2. Giao diện Người dùng (`/frontend/src/pages/`):**
- **Trang Admin (`admin.js`):** Form điền thông tin sinh viên, nút upload file. Gọi hàm `ipfs.js` -> băm `hash.js` -> đưa lên Blockchain qua hàm `mint`.
- **Trang Tra cứu (`index.js`):** Ô nhập mã băm để nhà tuyển dụng kiểm tra. Truy vấn Smart Contract và hiển thị trạng thái Hợp lệ/Vô hiệu hóa.
```

---


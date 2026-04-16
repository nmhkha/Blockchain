
/**
 * Hàm upload file lên IPFS thông qua Pinata
 * @param {File} fileToUpload - File PDF hoặc ảnh lấy từ input trên web
 * @returns {string} - Trả về mã CID của file trên mạng IPFS
 */
export const uploadFileToIPFS = async (fileToUpload) => {
    try {
        // 1. Tạo đối tượng FormData để chứa file
        const formData = new FormData();
        formData.append("file", fileToUpload);

        // 2. Tùy chọn siêu dữ liệu cho file trên Pinata (Tùy chọn, để quản lý dễ hơn)
        const metadata = JSON.stringify({
            name: fileToUpload.name,
        });
        formData.append("pinataMetadata", metadata);

        // 3. Tùy chọn thư mục (Tùy chọn)
        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append("pinataOptions", options);

        // 4. Lấy JWT từ file .env
        const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
        if (!pinataJWT) throw new Error("Chưa cấu hình Pinata JWT trong file .env");

        // 5. Gửi request lên Pinata API
        console.log("Đang upload file lên IPFS...");
        const res = await fetch(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${pinataJWT}`,
                },
                body: formData,
            }
        );

        // 6. Xử lý kết quả trả về
        const resData = await res.json();

        if (resData.IpfsHash) {
            console.log("Upload thành công. CID:", resData.IpfsHash);
            return resData.IpfsHash; // Đây chính là chuỗi `ipfsHash` bạn sẽ nhét vào Smart Contract
        } else {
            throw new Error(resData.error || "Lỗi không xác định từ Pinata");
        }

    } catch (error) {
        console.error("Lỗi khi upload lên Pinata:", error);
        throw error;
    }
};
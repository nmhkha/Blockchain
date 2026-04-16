# Sử dụng image Node.js nhẹ nhất
FROM node:18-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Copy file quản lý thư viện vào trước để tối ưu cache
COPY package*.json ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ source code
COPY . .

# Mở port 3000 cho Next.js
EXPOSE 3000

# Lệnh khởi chạy chế độ Dev
CMD ["npm", "run", "dev"]
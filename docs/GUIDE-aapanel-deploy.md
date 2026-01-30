# Hướng dẫn Deploy Website lên Home Server (Ubuntu + aaPanel)

Tài liệu này hướng dẫn chi tiết từng bước cho người mới bắt đầu, sử dụng giao diện aaPanel để đưa ứng dụng R4B (mmopro.click) lên mạng.

---

## 🟢 Bước 1: Cài đặt Môi trường (Docker)
Trước khi chạy web, ta cần cài "cỗ máy" để chạy nó là Docker.

1.  Đăng nhập vào **aaPanel**.
2.  Ở menu bên trái, chọn **App Store**.
3.  Tại ô tìm kiếm, gõ: `Docker`.
4.  Bạn sẽ thấy **"Docker Manager"** hoặc **"Docker Official"**. Ấn nút **Install**.
5.  Đợi `Install` chạy xong (có thể mất 1-2 phút).
6.  Sau khi xong, gạt công tắc **Status** sang màu xanh lá (Start) và tích vào **Home Display** để dễ quản lý.

---

## 🟢 Bước 2: Upload Source Code
Bây giờ ta chuyển code từ máy tính của bạn lên Server.

**Tại máy tính của bạn:**
1.  Vào thư mục code dự án.
2.  Xóa thư mục `node_modules` (nếu có) và `.git` để file nhẹ hơn.
3.  Nén toàn bộ file (bao gồm `server`, `src`, `docker-compose.prod.yml`, `deploy.sh`, `.env.production`...) thành file **`.zip`** (Ví dụ: `app.zip`).

**Trên aaPanel:**
1.  Menu trái -> chọn **Files**.
2.  Vào đường dẫn: `/www/wwwroot`.
3.  Ấn nút **New Dir** -> Đặt tên `r4b-app` -> OK.
4.  Click đúp vào thư mục `r4b-app` vừa tạo để mở nó.
5.  Ấn nút **Upload** -> Kéo thả file `app.zip` vào -> Start Upload.
6.  Sau khi xong, chuột phải vào `app.zip` chọn **Unzip** -> Confirm.
7.  **Quan trọng**:
    *   Tìm file `docker-compose.prod.yml` -> Chuột phải -> Rename -> đổi tên thành `docker-compose.yml` (hoặc giữ nguyên nếu dùng script của tôi).
    *   Tìm file `.env.production` -> Chuột phải -> Rename -> đổi tên thành **`.env`**.

---

## 🟢 Bước 3: Chạy ứng dụng (Deploy)
Ta sẽ dùng Terminal (màn hình đen) của aaPanel để ra lệnh chạy.

1.  Menu trái -> chọn **Terminal**.
2.  Nhập mật khẩu `root` nếu được hỏi (lần đầu).
3.  Gõ lệnh sau để vào thư mục app:
    ```bash
    cd /www/wwwroot/r4b-app
    ```
4.  Cấp quyền chạy cho file script:
    ```bash
    chmod +x deploy.sh
    ```
5.  Bắt đầu chạy web:
    ```bash
    ./deploy.sh
    ```
6.  Ngồi đợi. Lần đầu cài sẽ mất khoảng 3-5 phút để tải Docker Image. Khi nào thấy dòng chữ **"Deployment Complete!"** màu xanh là xong.

---

## 🟢 Bước 4: Cấu hình Tên miền (Reverse Proxy)
Lúc này Web đã chạy ở cổng nội bộ `8080`. Ta cần nối tên miền `mmopro.click` vào cổng này.

1.  Menu trái -> chọn **Website**.
2.  Ấn **Add Site**.
    *   **Domain name**: Nhập `mmopro.click`.
    *   **Database**: Chọn `No database created` (vì ta chạy DB bằng Docker rồi).
    *   **PHP Version**: Chọn `Statics` (Web tĩnh) hoặc mặc định.
    *   Ấn **Submit**.
3.  Sau khi tạo xong, click vào tên miền `mmopro.click` (cột Name) để mở bảng cài đặt.
4.  Chọn mục **Reverse proxy** -> Ấn **Add reverse proxy**.
    *   **Proxy name**: Đặt tên gì cũng được (ví dụ `App`).
    *   **Target URL**: Nhập chính xác `http://127.0.0.1:8080`.
    *   **Sent Domain**: Giữ nguyên `$host`.
    *   Ấn **Submit**.

---

## 🟢 Bước 5: Kiểm tra
1.  Mở trình duyệt truy cập: `http://mmopro.click`.
2.  Nếu thấy Web hiện lên -> **Thành công!** 🎉

---

## 🟢 Bước 6: Cập nhật & Sửa code (Update)
Làm thế nào khi bạn muốn sửa code sau khi đã deploy?

**Cách 1: Sửa nhanh (Chỉ sửa file nhỏ, config)**
1.  Vào aaPanel -> **Files**.
2.  Tìm đến file cần sửa (Ví dụ `.env` hoặc file code `.js`).
3.  Click đúp để mở -> Sửa nội dung -> Ấn **Save**.
4.  Vào Terminal gõ: `./deploy.sh` để server nhận code mới.

**Cách 2: Sửa lớn (Thêm tính năng mới từ máy tính)**
1.  Sửa code và test xong xuôi ở máy tính (Local).
2.  Zip toàn bộ source code lại thành `app_v2.zip`.
3.  Trên aaPanel -> **Files**:
    *   Xóa thư mục `src`, `server` cũ đi.
    *   Upload `app_v2.zip` lên và Unzip (ghi đè file cũ).
4.  Vào Terminal gõ: `./deploy.sh`.
    *   Lệnh này sẽ tự động Build lại code mới nhất cho bạn.

---

## ⚠️ Lưu ý về Mạng (Home Server)
Vì bạn dùng Home Server (máy chủ tại nhà), bạn cần đảm bảo:
1.  **OPNsense / Modem WiFi**: Đã mở cổng (Port Forwarding) **80** và **443** trỏ về địa chỉ IP Web Server của bạn (VD: `192.168.1.100`).
2.  **Cloudflare**: Trong DNS, bật đám mây màu vàng (Proxied) nếu muốn Cloudflare che IP giúp bạn.

Chúc bạn thành công! Nếu gặp lỗi ở bước nào, hãy chụp ảnh màn hình aaPanel gửi cho tôi.

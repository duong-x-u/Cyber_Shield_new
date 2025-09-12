# Dự án Cyber Shield

## Giới thiệu

Cyber Shield là một ứng dụng bảo mật di động hoạt động nền, có khả năng giám sát thông báo và tin nhắn trên _Android_. Khi phát hiện nội dung đáng ngờ, ứng dụng sẽ gửi cảnh báo theo thời gian thực, giúp người dùng phòng tránh trước khi tương tác với liên kết hoặc nội dung lừa đảo.

## Yêu cầu cần có
- npm/yarn
- Node.js
- Java JDK 17
- Android Studio

## Hướng dẫn cài đặt và sử dụng (Test)

1.  **Clone dự án:**
    ```bash
    git clone "https://github.com/duong-x-u/Cyber_Shield_new"
    ```
2.  **Tải file cấu hình:**
    Tải file `.zip` cần thiết tại [Google Drive](https://drive.google.com/file/d/1V5ILnQfRwEmz35f1BK6wVfZF6R-ikpYm/view?usp=sharing).

3.  **Giải nén vào thư mục gốc của dự án.** Cấu trúc dự án sau khi giải nén sẽ có các thư mục như:
    - `android`
    - `components`
    - `node_modules`
    - ...

4.  **Di chuyển vào thư mục gốc của dự án:**
    ```powershell
    cd <đường_dẫn_đến_thư_mục_dự_án>
    ```

5.  **Khởi chạy Metro Bundler:**
    ```powershell
    npx react-native start --reset-cache
    ```

6.  **Chạy ứng dụng trên thiết bị Android:**
    Mở một cửa sổ terminal khác và chạy lệnh:
    ```powershell
    npx react-native run-android
    ```
    Hoặc trong Metro, nhấn phím `a` để chạy ứng dụng (chế độ Debug) trên thiết bị Android đã kết nối.

## Hướng dẫn cấp quyền cho ứng dụng

Để ứng dụng hoạt động chính xác, bạn cần cấp các quyền sau:

1.  **Quyền truy cập thông báo**
    - Đi tới: `Cài đặt > Ứng dụng > Quyền truy cập đặc biệt > Quyền truy cập thông báo`
    - Tìm và bật quyền cho **Cyber Shield (Beta)**.

2.  **Quyền truy cập thông tin sử dụng**
    - Đi tới: `Cài đặt > Ứng dụng > Quyền truy cập ứng dụng đặc biệt > Thông tin sử dụng`
    - Tìm và bật quyền cho **Cyber Shield (Beta)**.

> **Lưu ý:** Tên các mục trong Cài đặt có thể thay đổi tùy theo phiên bản Android và nhà sản xuất điện thoại.

## Tác giả
- **Tên:** Phạm Thái Dương (Dương Nker)
- **Trường:** THPT Nguyễn Khuyến
- **Lớp:** 10A6
- **Giáo viên hướng dẫn:** Cô Lưu Vinh

## Lưu ý thêm
1. Ứng dụng có thể gặp một số vấn đề về quyền "Truy cập thông báo" do các giới hạn bảo mật từ hệ điều hành Android trên một số dòng máy.


## Các liên kết bổ sung
1. Mã nguồn gốc: [GitHub](github.com/duong-x-u/Cyber_Shield_new)
2. Phiên bản thử nghiệm của ứng dụng: [Phiên bản thử nghiệm - Lưu trữ trên Drive](https://drive.google.com/drive/u/0/folders/1T2hFph7rQzfD7gPp8fizqn3EXYQ43P-v)
3. Kết quả test từ nhà phát triển: [Kết quả test - Lưu trữ trên Drive](https://drive.google.com/drive/u/0/folders/1t1V5oJ1yNhZKzyO9Mj-sSy9vpErAztSL)
4. Kho dữ liệu của AI: [Anna AI Data Base - Use Google Sheets](https://docs.google.com/spreadsheets/d/1vK2DoSOi81ZA4NevtlucwaLKO_N4pyI8hbN-oTpDGWU/edit?usp=drive_link)
5. Các mẫu tin nhán lừa đảo phổ biến: [Mẫu tin nhắn](https://docs.google.com/document/d/1dBzBrJkQ2XQ9q4XT6uwLhqrnc75gvAilFmUZCQS9IBM/edit?usp=drive_link

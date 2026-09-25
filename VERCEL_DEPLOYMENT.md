# 🚀 Hướng Dẫn Triển Khai HanziVibe (汉字韵) Lên Vercel & Cài Đặt PWA iOS

Tài liệu này cung cấp hướng dẫn toàn diện từ A-Z để đóng gói, triển khai nền tảng **HanziVibe (汉字韵)** lên hạ tầng đám mây toàn cầu **Vercel** hoàn toàn miễn phí ($0/tháng), cấu hình biến môi trường an toàn và hướng dẫn học viên cài đặt PWA (Add to Home Screen) trên thiết bị Apple (iPad Pro 12.9" & iPhone 12 Pro Max).

---

## 1. Kiến Trúc Triển Khai Không Chi Phí (Zero-Cost Vercel Architecture)

HanziVibe được kiến trúc theo chuẩn **Static Site Generation (SSG) / Static Export** của Next.js 15:
- **Cấu hình xuất tĩnh:** `output: 'export'` trong `next.config.ts`.
- **Thư mục đầu ra:** Toàn bộ mã nguồn HTML, CSS, JavaScript và tài nguyên tĩnh được biên dịch vào thư mục `out/`.
- **Hạ tầng phục vụ:** Vercel Edge Network (Global CDN) phân phối nội dung tĩnh với độ trễ cực thấp (<20ms tại Việt Nam và Châu Á).
- **Chi phí vận hành:** **$0 / tháng vĩnh viễn** — Không tiêu tốn tài nguyên Serverless Compute hay Edge Middleware runtime.
- **Bảo mật & SSL:** Tự động kích hoạt HTTPS với chứng chỉ SSL/TLS miễn phí từ Let's Encrypt / DigiCert.

---

## 2. Các Bước Triển Khai Lên Vercel (1-Click & Git Integration)

### Cách 1: Triển khai qua Vercel Dashboard (Khuyên dùng)

1. **Đăng nhập Vercel:**
   - Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub của bạn.

2. **Nhập Kho Mã Nguồn (Import Git Repository):**
   - Chọn **"Add New..."** ➔ **"Project"**.
   - Tìm kho mã nguồn: `https://github.com/thanh-16/Web-h-c-ti-ng-trung-.git` (hoặc tên repo GitHub tương ứng).
   - Nhấn **"Import"**.

3. **Cấu Hình Dự Án (Project Configuration):**
   - **Framework Preset:** Chọn `Next.js`.
   - **Root Directory:** `./` (hoặc để trống nếu repo chứa trực tiếp mã nguồn).
   - **Build Command:** `npm run build`
   - **Output Directory:** `out` *(Lưu ý: Next.js static export xuất ra thư mục `out`, hãy ghi đè nếu Vercel để mặc định là `.next`)*.
   - **Install Command:** `npm install`

4. **Cấu Hình Biến Môi Trường (Environment Variables):**
   - Mở mục **"Environment Variables"** trong giao diện cấu hình.
   - Thêm cặp khóa sau:
     * **Key:** `NEXT_PUBLIC_GEMINI_API_KEY`
     * **Value:** `<YOUR_GEMINI_API_KEY>` (Ví dụ: API key từ Google AI Studio)
   - *(Tùy chọn bổ sung)*:
     * **Key:** `GEMINI_API_KEY`
     * **Value:** `<YOUR_GEMINI_API_KEY>`
   - *Ghi chú:* Vì HanziVibe chạy chế độ tĩnh 100% trên trình duyệt người dùng, tiền tố `NEXT_PUBLIC_` giúp Next.js gắn biến môi trường vào bundle client để gọi trực tiếp Google Gemini API.

5. **Kích hoạt Deploy:**
   - Nhấn nút **"Deploy"**.
   - Quá trình build sẽ diễn ra trong khoảng 45-90 giây. Sau khi hoàn tất, Vercel sẽ cấp phát URL dạng: `https://hanzivibe.vercel.app` (hoặc tên miền tùy chỉnh của bạn).

---

### Cách 2: Triển khai qua Vercel CLI (Dành cho Lập trình viên)

```powershell
# 1. Cài đặt Vercel CLI toàn cục (nếu chưa có)
npm install -g vercel

# 2. Đăng nhập tài khoản Vercel
vercel login

# 3. Đứng tại thư mục dự án HanziVibe
cd "d:/Vibe coding/HanziVibe"

# 4. Kiểm tra build cục bộ trước khi deploy
npm test
npm run build

# 5. Triển khai Preview
vercel

# 6. Triển khai Production kèm thiết lập Output Directory 'out'
vercel --prod
```

---

## 3. Quản Lý Khóa API & Cơ Chế Dự Phòng (API Keys & Fallback Mechanism)

### Nguyên tắc bảo mật:
- **Tuyệt đối KHÔNG commit khóa API** lên GitHub. File `.env.local` đã được cấu hình trong `.gitignore`.
- Chỉ cấu hình API Key trên giao diện quản trị an toàn của Vercel (Project Settings ➔ Environment Variables).

### Cơ chế hoạt động của Trợ Lý AI Gemini 1.5 Flash:
- Khi có `NEXT_PUBLIC_GEMINI_API_KEY`: Trợ lý AI sẽ gọi trực tiếp đến API Google Gemini 1.5 Flash để phân tích ngữ nghĩa, nguồn gốc chiết tự và đặt câu tương tác thời gian thực.
- **Khi không có API Key hoặc mất kết nối mạng:** Hệ thống kích hoạt **100% Genuine Pedagogical Fallback Engine** (`GeminiAiService`), tự động phân tích chiết tự bộ thủ, cung cấp mẹo nhớ đòn bẩy Hán - Việt và trích xuất 3 mẫu câu giao tiếp từ cơ sở dữ liệu HSK chính quy mà không bao giờ gây lỗi giao diện hoặc crash ứng dụng.

---

## 4. Hướng Dẫn Cài Đặt PWA Trên iPad Pro & iPhone (Add to Home Screen)

HanziVibe được trang bị đầy đủ **Progressive Web App (PWA) Manifest**, Web App Meta Tags cho Apple iOS và Service Worker cache dữ liệu nét viết HSK. Trải nghiệm tốt nhất là chạy ứng dụng ở chế độ Standalone không viền trình duyệt.

### 📱 Trên iPhone 12 Pro Max (Màn hình 6.7" Super Retina XDR)
1. Mở trình duyệt **Safari** trên iPhone và truy cập vào URL dự án (ví dụ: `https://hanzivibe.vercel.app`).
2. Nhấn vào biểu tượng **Chia sẻ** (hình vuông có mũi tên hướng lên) ở thanh điều hướng dưới cùng của Safari.
3. Cuộn xuống và chọn **"Thêm vào MH chính"** (*Add to Home Screen*).
4. Đặt tên ứng dụng là **"HanziVibe"** (hoặc **汉字韵**) và nhấn **"Thêm"** (*Add*).
5. Ứng dụng xuất hiện trên màn hình chính với biểu tượng Cyberpunk Zen. Nhấn mở ứng dụng để trải nghiệm giao diện toàn màn hình, thanh trạng thái đen tuyền và tối ưu khu vực an toàn (Safe Area Insets) quanh cụm tai thỏ và thanh gạt Home.

---

### 💻 Trên iPad Pro 12.9" (Màn hình Liquid Retina XDR & Apple Pencil)
1. Mở **Safari** trên iPad và truy cập vào trang web HanziVibe.
2. Nhấn vào biểu tượng **Chia sẻ** ở góc trên bên phải thanh địa chỉ.
3. Chọn mục **"Thêm vào Màn hình chính"** (*Add to Home Screen*).
4. Nhấn **"Thêm"**.
5. Mở biểu tượng HanziVibe từ Home Screen:
   - Giao diện tự động kích hoạt bố cục **Multi-Column Studio** chia đôi cân đối: Cột trái là Bảng luyện viết HanziWriter kích thước chuẩn thư pháp, Cột phải là Phòng luyện 4 thanh điệu F0 và Thẻ Flashcard 3D.
   - **Hỗ trợ Apple Pencil:** Bảng vẽ tích hợp lớp bảo vệ `touch-action: none; overscroll-behavior: none;`, vô hiệu hóa hoàn toàn hiện tượng cuộn trang vô ý, cho phép tì cổ tay lên màn hình và viết nét chữ Hán tự nhiên như trên giấy Tuyên.

---

## 5. Xử Lý Giấy Phép Microphone & Mở Khóa Web Audio Trên iOS Safari

Trình duyệt Apple iOS Safari có chính sách bảo mật âm thanh nghiêm ngặt:

1. **Yêu cầu kết nối HTTPS:**
   - Safari chỉ cho phép truy cập Microphone thông qua giao thức an toàn `https://` (Vercel tự động đáp ứng điều này).
2. **Cấp quyền Microphone lần đầu:**
   - Khi học viên nhấn nút **"Bắt đầu luyện giọng"** (biểu tượng Micro), iOS Safari sẽ hiển thị hộp thoại:
     > *"hanzivibe.vercel.app muốn sử dụng Microphone của bạn"*
   - Học viên cần nhấn **"Cho phép"** (*Allow*).
3. **Mở khóa AudioContext (User Gesture Resilient Unlock):**
   - HanziVibe tích hợp module `AudioContextManager` tự động lắng nghe cử chỉ chạm đầu tiên (`touchend`, `click`) để kích hoạt Web Audio API và phát 1 mẫu đệm im lặng (silent buffer), ngăn chặn tình trạng âm thanh bị câm trên thiết bị iOS.
4. **Tự động khôi phục khi chuyển ứng dụng:**
   - Khi người dùng thoát ra màn hình chính và quay lại, `AudioContextManager` tự động kiểm tra và phục hồi trạng thái `running` ngay lập tức.

---

## 6. Bảng Kiểm Tra Sẵn Sàng Vận Hành (Production Verification Gate)

Trước khi công bố liên kết cho học viên, hãy rà soát bảng kiểm tra sau:

| STT | Hạng mục kiểm tra | Tiêu chuẩn đạt | Trạng thái |
|:---:|:---|:---|:---:|
| 1 | Bộ kiểm thử tự động | Chạy `npm test` đạt 358/358 tests pass (27 test suites) | ✅ Đạt |
| 2 | Đóng gói xuất tĩnh | Chạy `npm run build` sinh thư mục `out/` không cảnh báo lỗi | ✅ Đạt |
| 3 | Tên miền HTTPS | Truy cập qua Vercel URL có biểu tượng ổ khóa bảo mật | ✅ Đạt |
| 4 | Thu âm thanh điệu F0 | Đồ thị Pitch Contour phản hồi dải tần số 80 - 450 Hz | ✅ Đạt |
| 5 | Bảng viết Hanzi | Nhận diện đúng nét và cảnh báo ngược hướng (`isBackwards`) | ✅ Đạt |
| 6 | Flashcard Quizlet | Hoạt động mượt mà 3 chế độ (Lật thẻ 3D, Quiz, Ghép từ) | ✅ Đạt |
| 7 | Lưu trữ tiến độ | Lưu chuỗi streak và từ thuộc tính vào LocalStorage an toàn | ✅ Đạt |
| 8 | Trợ lý Circle-to-Search | Nhận diện câu/từ khoanh vùng, tra cứu tài liệu kèm Offline Fallback | ✅ Đạt |
| 9 | Động cơ SRS SM-2 | Lặp lại ngắt quãng SuperMemo SM-2, tính chu kỳ và hạn ôn tập tự động | ✅ Đạt |
| 10 | Bảng Giấy Trắng Tự Do | Vẽ tự do không gợi ý nét, đối chiếu tự hình chuẩn bằng 1 chạm | ✅ Đạt |
| 11 | Đấu Trường 60s | Phản xạ từ vựng tốc độ cao, combo multiplier x1-x3 và lưu High Score | ✅ Đạt |

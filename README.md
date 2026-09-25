# 🏮 HanziVibe (汉字韵) — Nền Tảng Học Tiếng Trung Công Nghệ Cao

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-358%2F358%20Pass-10B981?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

> **HanziVibe (汉字韵)** là giải pháp Web Application tiên phong kết hợp công nghệ âm thanh thời gian thực (Real-time Audio DSP), trí tuệ nhân tạo (Google Gemini AI), mô phỏng thư pháp SVG tương tác, thuật toán lặp lại ngắt quãng **SuperMemo SM-2**, Đấu trường 60s phản xạ và phương pháp đòn bẩy ngữ âm **Hán - Việt**, mang lại trải nghiệm luyện phát âm chuẩn xác và viết chữ Hán sống động trên mọi thiết bị di động, tối ưu chuyên sâu cho **iPad Pro 12.9 inch** và **iPhone 12 Pro Max**.

---

## 🌟 Tầm Nhìn & Giá Trị Đột Phá

Học tiếng Trung truyền thống thường gặp hai rào cản lớn nhất:
1. **Lệch chuẩn thanh điệu (Tones):** Khó hình dung và kiểm soát cao độ giọng nói để phân biệt 4 thanh (bằng, lên, lượn sóng, dốc).
2. **Quên thứ tự nét (Stroke Order) & Viết ngược:** Không có cơ chế phản hồi tức thì khi bút thuận sai hướng.

**HanziVibe** giải quyết triệt để hai vấn đề này bằng cách:
- Số hóa âm thanh qua thuật toán DSP **YIN**, vẽ biểu đồ cao độ $F_0$ trực tiếp so khớp với mô hình thanh điệu chuẩn Chao (5-level system).
- Bảng luyện viết SVG độ nét cao với thuật toán nhận diện lỗi vẽ ngược nét (`isBackwards`), chế độ **Giấy Trắng Tự Do (Freehand Blank Paper)** kiểm tra trí nhớ tuyệt đối, khóa cảm ứng chống chạm nhầm lòng bàn tay (Palm Rejection) cho Apple Pencil.
- Tận dụng kho tàng hơn 60% từ vựng Hán - Việt giúp người Việt nắm bắt nghĩa và bản chất chữ Hán siêu tốc.
- Thuật toán **SRS SuperMemo SM-2** lên lịch ôn tập ngắt quãng tự động và **Đấu Trường 60s (Time-Attack Battle)** tôi luyện phản xạ.

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

| Tầng công nghệ | Công nghệ chính | Vai trò & Đặc điểm kỹ thuật |
|---|---|---|
| **Core Framework** | **Next.js 15 (App Router)** | Static HTML Export (`output: 'export'`) cho tốc độ tải tức thì và triển khai $0 trên Vercel CDN |
| **UI Library** | **React 19** | Quản lý trạng thái tương tác mượt mà, hỗ trợ Transitions và StrictMode |
| **Language** | **TypeScript 5.7 (Strict)** | Khóa chặt kiểu dữ liệu 100%, không sử dụng `any`, giao diện chuẩn hóa |
| **Styling & Theme** | **Tailwind CSS 3.4** | Bảng màu **Cyberpunk Zen** (Đen than vũ trụ `#0B0F19`, Xanh neon Cyan `#06B6D4`, Hổ phách `#F59E0B`, Ngọc bích `#10B981`) |
| **Audio Processing** | **Web Audio API + YIN Algorithm** | Thuật toán YIN DSP thuần TypeScript giải mã tần số cơ bản $F_0$ trong <1ms, dải tần 80-450 Hz |
| **Calligraphy Canvas**| **HanziWriter 3.7 (SVG Engine)** | Vẽ nét chữ vector không vỡ hạt trên màn hình Retina, nhận diện bút thuận và vẽ ngược hướng |
| **AI Assistant** | **Google Gemini 1.5 Flash** | Giải mã chiết tự chữ Hán, mẹo nhớ ngữ âm Hán - Việt và sinh mẫu câu ngữ cảnh đàm thoại |
| **Quality & Testing** | **Vitest 3.0 + JSDOM 26** | 27 tệp kiểm thử tự động, 358 bài test xác minh tính toàn vẹn và độ chịu tải |

---

## 🎯 Tính Năng Nổi Bật (Feature Highlights)

### 1. Bảng Luyện Viết Chữ Hán Cảm Ứng (Hanzi Stroke Canvas)
- **Hoạt họa thứ tự nét (Stroke Order Animation):** Hiển thị tuần tự từng nét viết chuẩn thư pháp với tốc độ tùy chỉnh.
- **Chế độ Luyện viết tương tác (Quiz Mode):**
  * Nhận diện nét viết đúng/sai thời gian thực.
  * Thuật toán phát hiện lỗi **viết ngược hướng nét** (`isBackwards`) và nhắc nhở học viên sửa lại theo đúng bút thuận.
  * Hiển thị số lần viết sai và tự động gợi ý nét tiếp theo sau 3 lần sai.
- **Khung lưới Điền Tự Cách / Mễ Tự Cách (Tian Zi Ge Grid):** Đường gióng căn chỉnh cân đối cấu trúc chữ.
- **Khóa cảm ứng đa điểm (Touch Lock):** Cấu hình `touch-action: none; overscroll-behavior: none;` cho phép tì cổ tay và sử dụng mượt mà với **Apple Pencil** hoặc ngón tay.

### 2. Phòng Luyện 4 Thanh Điệu Thời Gian Thực (Real-Time Voice Pitch Contour F0)
- **Thuật toán YIN Pitch Detection:** Trích xuất cao độ $F_0$ với độ trễ cực thấp (<1ms) ngay trên thiết bị mà không cần gửi dữ liệu giọng nói lên máy chủ.
- **Mô hình 4 Thanh Điệu Chuẩn Chao:**
  * **Thanh 1 (Âm Bình - 55):** Cao độ cao và giữ thăng bằng.
  * **Thanh 2 (Dương Bình - 35):** Đi vút lên từ âm vực trung bình.
  * **Thanh 3 (Thượng Thanh - 214):** Xuống thấp rồi lượn sóng vòng lên.
  * **Thanh 4 (Khứ Thanh - 51):** Rơi dốc dứt khoát từ đỉnh cao độ xuống đáy.
- **Chuẩn hóa Semitone:** Tự động quy đổi tần số $F_0$ sang dải nửa cung (semitones) tương đối, giúp so sánh chính xác công bằng cho cả giọng nam trầm, giọng nữ cao và trẻ em.
- **Biểu đồ sóng âm 60 FPS Retina Canvas:** Hiển thị vệt sáng Cyan giọng người học đè lên đường cong tham chiếu Hổ phách, kèm điểm số tương đồng (Pitch Score 0-100%) và nhận xét hướng dẫn điều chỉnh giọng.

### 3. Trung Tâm Flashcard Ôn Tập Kiểu Quizlet (Flashcard Hub)
- **Chế độ Lật Thẻ 3D (3D Flip Card):**
  * Mặt trước: Chữ Hán thư pháp, Pinyin, phát âm giọng chuẩn bản xứ qua Web Speech API.
  * Mặt sau: Âm Hán Việt, Nghĩa tiếng Việt, Bộ thủ, Số nét và Ví dụ ngữ cảnh thực tế.
  * Hỗ trợ phím tắt điều hướng nhanh (Space lật thẻ, Mũi tên chuyển thẻ).
- **Chế độ Luyện Tập (Learn Quiz):** Trắc nghiệm 4 lựa chọn đảo chiều hai chiều (Nhìn chữ Hán chọn nghĩa tiếng Việt & Nhìn nghĩa tiếng Việt chọn chữ Hán). Thuật toán tạo phương án nhiễu thông minh, tự động lưu các câu sai vào danh sách ôn tập.
- **Chế độ Ghép Từ Tốc Độ (Match Game):** Thử thách ghép cặp chữ Hán và nghĩa Hán Việt phản xạ nhanh với hiệu ứng âm thanh sống động và bảng thành tích thời gian.
- **Bộ Lọc Đa Năng:** Phân loại từ "Tất cả", "Đã thuộc" (Mastered), "Cần ôn lại" (Review) và "Đã đánh dấu" (Bookmarked).

### 4. Hệ Thống Đăng Nhập & Theo Dõi Tiến Độ (Auth & Progress Tracking)
- **Lưu trữ dữ liệu an toàn:** Kiến trúc Local-First trên LocalStorage, tự động sao lưu và bảo vệ dữ liệu học tập khi mất mạng.
- **Chuỗi ngày học liên tục (Daily Streak):** Thuật toán tính toán ngày thông minh, tự động cộng chuỗi khi học đều đặn mỗi ngày và duy trì chuỗi qua múi giờ địa phương.
- **Huy hiệu thành tích (Achievement Badges):** Mở khóa các huy hiệu Tân thủ Hán tự, Chuyên gia thanh điệu, Bậc thầy ghép thẻ.

### 5. Trợ Lý Trí Tuệ Nhân Tạo Google Gemini 1.5 Flash
- **Giải mã chiết tự (Etymology):** Phân tích nguồn gốc lịch sử và kết cấu văn tự cổ.
- **Mẹo nhớ Hán - Việt (Mnemonics):** Tạo cầu nối liên tưởng hài hước, dễ nhớ giữa âm đọc Hán Việt và nghĩa chữ.
- **3 Mẫu câu đàm thoại ngữ cảnh:** Mở rộng vốn từ qua các tình huống giao tiếp đời thường.
- **Cơ chế dự phòng sư phạm (Offline Pedagogical Fallback):** Khi mất kết nối hoặc không có khóa API, hệ thống tự động sinh tài liệu chuẩn hóa từ cơ sở dữ liệu nội tại mà không bị gián đoạn.

---

## 📐 Bố Cục Thích Ứng Di Động (Responsive Mobile & Tablet Design)

HanziVibe được căn chỉnh pixel-perfect cho 2 thiết bị tiêu chuẩn của Apple:
- **iPhone 12 Pro Max (428 x 926 px):**
  * Bố cục 1 cột cuộn mượt mà với vùng thao tác ngón cái (Thumb-friendly navigation).
  * Xử lý tai thỏ (Notch) và thanh gạt màn hình chính bằng các lớp tiện ích Safe Area Insets (`pt-safe`, `pb-safe`).
- **iPad Pro 12.9 inch (1024 x 1366 px):**
  * Bố cục Studio 2 cột đối xứng: Cột trái bảng viết HanziWriter khổ lớn, cột phải hiển thị trực quan Pitch Contour và Flashcard Hub.
  * Hỗ trợ chế độ nằm ngang (Landscape) và thẳng đứng (Portrait).

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu Cầu Môi Trường
- **Node.js:** Phiên bản 18.18 trở lên hoặc 20+ (Khuyên dùng Node 20 LTS)
- **npm:** 9.0+ hoặc **pnpm** / **yarn**

### Cài Đặt & Chạy Kiểm Thử

```powershell
# 1. Di chuyển vào thư mục dự án
cd "d:/Vibe coding/HanziVibe"

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Chạy toàn bộ 279 bài kiểm thử tự động
npm test

# 4. Biên dịch và xuất trang tĩnh (Static Export)
npm run build

# 5. Khởi động môi trường phát triển (Dev Server)
npm run dev
# Mở trình duyệt tại: http://localhost:3000
```

---

## 🌐 Triển Khai Lên Vercel & PWA

Chi tiết từng bước triển khai miễn phí 100% lên hạ tầng Vercel CDN và cài đặt biểu tượng ứng dụng PWA toàn màn hình trên iOS Safari được ghi nhận đầy đủ tại:
👉 **[Xem tài liệu VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

---

## 📂 Cấu Trúc Thư Mục Dự Án (Repository Map)

```
HanziVibe/
├── out/                           # Thư mục xuất tĩnh biên dịch hoàn chỉnh (HTML/CSS/JS)
├── public/                        # Tài nguyên tĩnh, âm thanh, icons PWA, manifest.json
│   ├── data/hanzi/                # 97+ tập tin dữ liệu nét chữ Hán vector chuẩn offline
│   └── icons/                     # Bộ biểu tượng ứng dụng chuẩn Retina và Apple Touch Icon
├── src/
│   ├── app/                       # Next.js 15 App Router (layout.tsx, page.tsx, globals.css)
│   ├── components/                # Các thành phần giao diện chính
│   │   ├── auth/                  # ProfileDrawer, AuthModal, StreakCounter
│   │   ├── canvas/                # HanziCanvas, TianZiGe, StrokeControls
│   │   ├── flashcard/             # FlipCard, LearnQuiz, MatchGame, FlashcardHub
│   │   ├── layout/                # Header, StudioLayout, TabNavigation
│   │   ├── pitch/                 # PitchVisualizer, ToneCard, AudioControls
│   │   └── vocabulary/            # WordDetailModal, HskWordSelector
│   ├── data/                      # Giáo trình HSK 1-3 chính quy 4 tầng thông tin
│   ├── services/                  # Lớp xử lý nghiệp vụ lõi
│   │   ├── audioContextManager.ts # Mở khóa an toàn Web Audio trên iOS Safari
│   │   ├── charDataLoader.ts      # Bộ nạp dữ liệu nét chữ 4 tầng (Memory -> Cache -> Local -> CDN)
│   │   ├── geminiAiService.ts     # Trí tuệ nhân tạo Gemini 1.5 Flash & Offline Fallback
│   │   ├── hanziAudioFeedback.ts  # Bộ tổng hợp âm thanh phản hồi xúc giác
│   │   ├── progressService.ts     # Quản lý chuỗi ngày, từ thuộc tính và huy hiệu
│   │   ├── speechService.ts       # Phát âm tiếng Trung chuẩn qua Web Speech API
│   │   ├── toneScorer.ts          # Mô hình thanh điệu Chao & Chấm điểm độ dốc F0
│   │   └── yinPitchDetector.ts    # Thuật toán YIN DSP thuần TypeScript (<1ms)
│   └── types/                     # Định nghĩa kiểu dữ liệu chặt chẽ (HSK, Tone, Auth, AI)
├── tests/                         # Hệ thống kiểm thử tự động toàn diện
│   ├── stress/                    # Bộ kiểm thử chịu tải, đua lệnh & tình huống biên
│   └── unit/                      # Kiểm thử đơn vị các dịch vụ và thuật toán
├── next.config.ts                 # Cấu hình Next.js (output: 'export', unoptimized images)
├── tailwind.config.ts             # Cấu hình chủ đề màu sắc Cyberpunk Zen
├── tsconfig.json                  # Cấu hình TypeScript Strict Mode
├── VERCEL_DEPLOYMENT.md           # Hướng dẫn đóng gói và triển khai Vercel
└── README.md                      # Tài liệu tổng quan dự án tiếng Việt
```

---

## 🔒 Bản Quyền & Giấy Phép (License)

Dự án phát triển phục vụ cộng đồng học tiếng Trung phi lợi nhuận. Phát hành theo giấy phép **MIT License**.
Mọi đóng góp, báo cáo lỗi và yêu cầu tính năng xin vui lòng gửi về qua [GitHub Issues](https://github.com/thanh-16/Web-h-c-ti-ng-trung-/issues).

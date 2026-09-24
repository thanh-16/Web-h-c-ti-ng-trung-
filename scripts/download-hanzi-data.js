/**
 * download-hanzi-data.js
 * Script tải và lưu trữ dữ liệu nét chữ Hán ngoại tuyến (Offline PWA Assets)
 * Quét toàn bộ các chữ Hán trong `src/data/hskCurriculum.ts` và lưu vào `public/data/hanzi/[char].json`.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CURRICULUM_PATH = path.join(__dirname, '../src/data/hskCurriculum.ts');
const OUTPUT_DIR = path.join(__dirname, '../public/data/hanzi');

// Đảm bảo thư mục lưu trữ tồn tại
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Trích xuất các chữ Hán duy nhất từ tệp giáo trình
function extractHanziCharacters(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const hanziSet = new Set();

  // 1. Quét các trường `hanzi: '...'`
  const hanziMatches = content.matchAll(/hanzi:\s*['"]([^'"]+)['"]/g);
  for (const match of hanziMatches) {
    const word = match[1];
    for (const char of word) {
      if (/[\u4E00-\u9FFF]/.test(char)) {
        hanziSet.add(char);
      }
    }
  }

  // 2. Quét thêm các bộ thủ nếu là chữ Hán CJK
  const radicalMatches = content.matchAll(/radical:\s*['"]([^'"]+)['"]/g);
  for (const match of radicalMatches) {
    const radical = match[1];
    for (const char of radical) {
      if (/[\u4E00-\u9FFF]/.test(char)) {
        hanziSet.add(char);
      }
    }
  }

  return Array.from(hanziSet).sort();
}

// Tải một URL trả về chuỗi JSON
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HanziVibe-Data-Downloader/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Xử lý chuyển hướng HTTP Redirect
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Tải dữ liệu nét của 1 chữ Hán từ CDN
async function downloadCharData(char) {
  const targetFile = path.join(OUTPUT_DIR, `${char}.json`);
  if (fs.existsSync(targetFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
      if (existing.strokes && existing.medians) {
        return { char, status: 'cached' };
      }
    } catch {
      // Tệp hỏng, tải lại
    }
  }

  const urls = [
    `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(char)}.json`,
    `https://unpkg.com/hanzi-writer-data@2.0.1/${encodeURIComponent(char)}.json`,
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      if (data && Array.isArray(data.strokes) && Array.isArray(data.medians)) {
        fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
        return { char, status: 'downloaded' };
      }
    } catch (err) {
      lastError = err;
    }
  }

  return { char, status: 'failed', error: lastError ? lastError.message : 'Unknown' };
}

// Chạy tải song song có giới hạn luồng (Pool Concurrency)
async function runDownloadPool(chars, concurrency = 5) {
  console.log(`[HanziVibe] Bắt đầu tải dữ liệu nét cho ${chars.length} chữ Hán duy nhất...`);
  console.log(`[HanziVibe] Thư mục lưu trữ: ${OUTPUT_DIR}`);

  let index = 0;
  const results = [];

  async function worker() {
    while (index < chars.length) {
      const currentIndex = index++;
      const char = chars[currentIndex];
      try {
        const res = await downloadCharData(char);
        results.push(res);
        if (res.status === 'downloaded') {
          console.log(`  ✓ [${results.length}/${chars.length}] Tải thành công '${char}' -> ${char}.json`);
        } else if (res.status === 'cached') {
          console.log(`  - [${results.length}/${chars.length}] Đã có sẵn '${char}'`);
        } else {
          console.warn(`  ✗ [${results.length}/${chars.length}] Thất bại '${char}': ${res.error}`);
        }
      } catch (err) {
        results.push({ char, status: 'failed', error: err.message });
        console.warn(`  ✗ [${results.length}/${chars.length}] Lỗi ngoại lệ '${char}': ${err.message}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, chars.length) }, () => worker());
  await Promise.all(workers);

  const downloaded = results.filter((r) => r.status === 'downloaded').length;
  const cached = results.filter((r) => r.status === 'cached').length;
  const failed = results.filter((r) => r.status === 'failed');

  console.log('\n--- TỔNG KẾT TẢI DỮ LIỆU CHỮ HÁN ---');
  console.log(`Tổng số chữ quét được: ${chars.length}`);
  console.log(`Đã tải mới: ${downloaded}`);
  console.log(`Đã có sẵn trong cache: ${cached}`);
  console.log(`Thất bại: ${failed.length}`);
  if (failed.length > 0) {
    console.warn('Các chữ thất bại:', failed.map((f) => f.char).join(', '));
  }
}

// Thực thi
async function main() {
  try {
    const characters = extractHanziCharacters(CURRICULUM_PATH);
    console.log(`[HanziVibe] Trích xuất được ${characters.length} chữ Hán:`);
    console.log(characters.join(' '));
    await runDownloadPool(characters, 6);
  } catch (err) {
    console.error('Lỗi khi chạy download-hanzi-data.js:', err);
    process.exit(1);
  }
}

main();

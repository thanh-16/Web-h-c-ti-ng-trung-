/**
 * tests/unit/pdfTextExtractor.test.ts
 * Unit tests for client-side PDF and Document text extraction engine
 */

import { describe, it, expect } from 'vitest';
import {
  decodePdfLiteralString,
  decodePdfHexString,
  parseCMap,
  extractTextFromContentStream,
  splitIntoChineseSentences,
  extractTextFromTxt,
  extractTextFromPdf,
} from '@/services/pdfTextExtractor';

describe('PdfTextExtractor Engine', () => {
  describe('1. Literal String Escape Decoding', () => {
    it('decodes standard escapes \\n, \\r, \\t, \\(, \\)', () => {
      const decoded = decodePdfLiteralString('Hello\\nWorld\\t\\(Chinese\\)');
      expect(decoded).toBe('Hello\nWorld\t(Chinese)');
    });

    it('decodes octal escape sequences \\040 and \\101', () => {
      // \040 is space (ASCII 32), \101 is 'A' (ASCII 65)
      const decoded = decodePdfLiteralString('Hello\\040\\101');
      expect(decoded).toBe('Hello A');
    });
  });

  describe('2. Hex String Decoding & CJK Unicode Support', () => {
    it('decodes UTF-16BE hex string for Chinese characters 你 (U+4F60) and 好 (U+597D)', () => {
      const decoded = decodePdfHexString('<4F60597D>');
      expect(decoded).toBe('你好');
    });

    it('handles UTF-16BE BOM marker FEFF in hex string', () => {
      const decoded = decodePdfHexString('<FEFF4F60597D>');
      expect(decoded).toBe('你好');
    });

    it('decodes standard ASCII hex string <48656C6C6F>', () => {
      const decoded = decodePdfHexString('<48656C6C6F>');
      expect(decoded).toBe('Hello');
    });

    it('uses ToUnicode CMap lookup when provided', () => {
      const cmap = new Map<string, string>();
      cmap.set('0001', '我');
      cmap.set('0002', '学');

      const decoded = decodePdfHexString('<00010002>', cmap);
      expect(decoded).toBe('我学');
    });
  });

  describe('3. CMap Table Parsing', () => {
    it('parses beginbfchar entries into code-to-character mapping', () => {
      const cmapData = `
        beginbfchar
        <0001> <4F60>
        <0002> <597D>
        endbfchar
      `;
      const map = parseCMap(cmapData);
      expect(map.get('0001')).toBe('你');
      expect(map.get('0002')).toBe('好');
    });

    it('parses beginbfrange entries into sequential range mapping', () => {
      const cmapData = `
        beginbfrange
        <0001> <0003> <4E00>
        endbfrange
      `;
      // 4E00 is 一, 4E01 is 丁, 4E02 is 丂
      const map = parseCMap(cmapData);
      expect(map.get('0001')).toBe('一');
      expect(map.get('0002')).toBe('丁');
      expect(map.get('0003')).toBe('丂');
    });
  });

  describe('4. Stream Operator Extraction (BT ... ET, Tj, TJ)', () => {
    it('extracts text from literal Tj operator inside BT...ET', () => {
      const stream = `
        BT
        /F1 12 Tf
        (Hello Chinese) Tj
        ET
      `;
      const extracted = extractTextFromContentStream(stream);
      expect(extracted).toContain('Hello Chinese');
    });

    it('extracts text from TJ array operator with spacing numbers', () => {
      const stream = `
        BT
        [ (Xin) 120 (chao) -50 (Hanzi) ] TJ
        ET
      `;
      const extracted = extractTextFromContentStream(stream);
      expect(extracted).toContain('Xin');
      expect(extracted).toContain('chao');
      expect(extracted).toContain('Hanzi');
    });

    it('extracts CJK hex strings inside BT...ET', () => {
      const stream = `
        BT
        <4F60597D> Tj
        ET
      `;
      const extracted = extractTextFromContentStream(stream);
      expect(extracted).toContain('你好');
    });
  });

  describe('5. Chinese Sentence Segmentation', () => {
    it('segments text on Chinese full-stops and exclamation marks', () => {
      const text = '你好！很高兴认识你。我是中国人？';
      const sentences = splitIntoChineseSentences(text);

      expect(sentences).toHaveLength(3);
      expect(sentences[0]).toBe('你好！');
      expect(sentences[1]).toBe('很高兴认识你。');
      expect(sentences[2]).toBe('我是中国人？');
    });
  });

  describe('6. Plain Text / Markdown Document Extraction', () => {
    it('extracts TXT document with accurate character count and metadata', () => {
      const txt = '今天天气非常好。我和朋友一起喝茶。';
      const doc = extractTextFromTxt(txt, 'daily.txt');

      expect(doc.fileName).toBe('daily.txt');
      expect(doc.totalPages).toBe(1);
      expect(doc.totalChineseChars).toBe(15);
      expect(doc.pages[0].sentences).toHaveLength(2);
    });
  });

  describe('7. End-to-End PDF Document Extraction (Synthetic PDF Buffer)', () => {
    it('parses valid synthetic PDF buffer and extracts text, pages, and counts', async () => {
      // Build a minimal synthetic uncompressed PDF document
      const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 65 >>
stream
BT
/F1 14 Tf
100 700 Td
<4F60597D> Tj
( Zhongguo ) Tj
ET
endstream
endobj
xref
0 5
trailer
<< /Root 1 0 R >>
%%EOF
`;
      const buffer = new TextEncoder().encode(pdfContent).buffer;
      const result = await extractTextFromPdf(buffer, 'test_sample.pdf');

      expect(result.fileName).toBe('test_sample.pdf');
      expect(result.totalPages).toBeGreaterThanOrEqual(1);
      expect(result.pages[0].text).toContain('你好');
      expect(result.pages[0].text).toContain('Zhongguo');
      expect(result.totalChineseChars).toBeGreaterThanOrEqual(2);
    });
  });
});

/**
 * pdfTextExtractor.ts
 * Pure TypeScript Zero-Dependency Client-Side PDF & Document Text Extraction Engine.
 *
 * Capabilities:
 * - Decompresses FlateDecode PDF streams using native Web API DecompressionStream.
 * - Parses PDF text operators: BT...ET, Tj, TJ, hex strings <...>, and literal strings (...).
 * - Decodes CJK Unicode (UTF-16BE, ToUnicode CMaps, octal escapes).
 * - Segments extracted text into structured pages, paragraphs, and Chinese sentences.
 * - Supports .pdf, .txt, and .md document formats.
 * - 100% Client-side, zero server upload, private, and compatible with iOS Safari & Android.
 */

export interface PdfPageResult {
  pageNumber: number;
  text: string;
  chineseCharCount: number;
  sentences: string[];
}

export interface PdfDocumentResult {
  fileName: string;
  totalPages: number;
  totalChineseChars: number;
  pages: PdfPageResult[];
}

/**
 * Cleanly decodes PDF literal string escape characters (e.g. \n, \r, \t, \(, \), \ddd octal)
 */
export function decodePdfLiteralString(raw: string): string {
  let result = '';
  let i = 0;
  const len = raw.length;

  while (i < len) {
    const char = raw[i];
    if (char === '\\') {
      i++;
      if (i >= len) break;
      const next = raw[i];

      if (next === 'n') {
        result += '\n';
      } else if (next === 'r') {
        result += '\r';
      } else if (next === 't') {
        result += '\t';
      } else if (next === 'b') {
        result += '\b';
      } else if (next === 'f') {
        result += '\f';
      } else if (next === '(' || next === ')' || next === '\\') {
        result += next;
      } else if (/[0-7]/.test(next)) {
        // Octal escape \ooo (1 to 3 digits)
        let octal = next;
        if (i + 1 < len && /[0-7]/.test(raw[i + 1])) {
          octal += raw[++i];
          if (i + 1 < len && /[0-7]/.test(raw[i + 1])) {
            octal += raw[++i];
          }
        }
        result += String.fromCharCode(parseInt(octal, 8));
      } else {
        result += next;
      }
    } else {
      result += char;
    }
    i++;
  }

  return result;
}

/**
 * Decodes PDF hex string <4F60597D> into Unicode characters (especially CJK UTF-16BE)
 */
export function decodePdfHexString(hex: string, cmap?: Map<string, string>): string {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  if (!cleanHex) return '';

  // If a CMap is provided, try looking up mapping
  if (cmap) {
    let mapped = '';
    for (let i = 0; i < cleanHex.length; i += 4) {
      const code = cleanHex.substring(i, i + 4).toUpperCase();
      if (cmap.has(code)) {
        mapped += cmap.get(code);
      } else {
        // Fallback to UTF-16BE character code
        const charCode = parseInt(code, 16);
        if (!isNaN(charCode) && charCode > 0) {
          mapped += String.fromCharCode(charCode);
        }
      }
    }
    if (mapped) return mapped;
  }

  // Check for UTF-16BE BOM: FEFF
  let startIndex = 0;
  if (cleanHex.toUpperCase().startsWith('FEFF')) {
    startIndex = 4;
  }

  // Hex decode 2 bytes (4 hex chars) at a time for UTF-16
  if ((cleanHex.length - startIndex) % 4 === 0) {
    let result = '';
    for (let i = startIndex; i < cleanHex.length; i += 4) {
      const code = parseInt(cleanHex.substring(i, i + 4), 16);
      if (!isNaN(code) && code > 0) {
        result += String.fromCharCode(code);
      }
    }
    // If it contains CJK characters or printable text, return it
    if (/[\u4E00-\u9FFF]/.test(result) || /[\x20-\x7E]/.test(result)) {
      return result;
    }
  }

  // Fallback: 1 byte (2 hex chars) Latin/ASCII
  let singleByteResult = '';
  for (let i = 0; i < cleanHex.length; i += 2) {
    const code = parseInt(cleanHex.substring(i, i + 2), 16);
    if (!isNaN(code) && code >= 32) {
      singleByteResult += String.fromCharCode(code);
    }
  }

  return singleByteResult;
}

/**
 * Safely decompresses a raw byte stream using native DecompressionStream API
 */
export async function decompressFlate(compressedBytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === 'undefined') {
    return null;
  }

  // 1. Try standard zlib/deflate
  try {
    const blob = new Blob([compressedBytes.buffer as ArrayBuffer]);
    const stream = blob.stream().pipeThrough(new DecompressionStream('deflate'));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    // If standard deflate header fails (e.g. raw deflate without zlib header), try deflate-raw
  }

  // 2. Try deflate-raw (strip 2 bytes zlib header if needed)
  try {
    const rawData =
      compressedBytes.length > 2 && compressedBytes[0] === 0x78
        ? compressedBytes.slice(2)
        : compressedBytes;

    const blobRaw = new Blob([rawData.buffer as ArrayBuffer]);
    const streamRaw = blobRaw.stream().pipeThrough(new DecompressionStream('deflate-raw'));
    const buffer = await new Response(streamRaw).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    // Return null if decompression fails
  }

  return null;
}

/**
 * Parses CMap /ToUnicode table mapping character codes to CJK characters
 */
export function parseCMap(cmapString: string): Map<string, string> {
  const map = new Map<string, string>();

  // 1. Isolate beginbfchar ... endbfchar blocks
  const bfCharBlockRegex = /beginbfchar([\s\S]*?)endbfchar/g;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = bfCharBlockRegex.exec(cmapString)) !== null) {
    const blockContent = blockMatch[1];
    const bfCharRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
    let match: RegExpExecArray | null;

    while ((match = bfCharRegex.exec(blockContent)) !== null) {
      const srcHex = match[1].toUpperCase();
      const dstHex = match[2];
      const charCode = parseInt(dstHex, 16);
      if (!isNaN(charCode)) {
        map.set(srcHex, String.fromCharCode(charCode));
      }
    }
  }

  // 2. Isolate beginbfrange ... endbfrange blocks
  const bfRangeBlockRegex = /beginbfrange([\s\S]*?)endbfrange/g;
  let rangeBlockMatch: RegExpExecArray | null;

  while ((rangeBlockMatch = bfRangeBlockRegex.exec(cmapString)) !== null) {
    const rangeContent = rangeBlockMatch[1];
    const bfRangeRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
    let match: RegExpExecArray | null;

    while ((match = bfRangeRegex.exec(rangeContent)) !== null) {
      const startSrc = parseInt(match[1], 16);
      const endSrc = parseInt(match[2], 16);
      let startDst = parseInt(match[3], 16);

      for (let c = startSrc; c <= endSrc; c++) {
        const hexKey = c.toString(16).padStart(match[1].length, '0').toUpperCase();
        map.set(hexKey, String.fromCharCode(startDst++));
      }
    }
  }

  return map;
}

/**
 * Extracts plain text from a decompressed stream containing PDF operators (BT...ET)
 */
export function extractTextFromContentStream(streamContent: string, cmap?: Map<string, string>): string {
  let output = '';

  // Extract all BT (Begin Text) to ET (End Text) blocks
  const btEtRegex = /BT([\s\S]*?)ET/g;
  let btMatch: RegExpExecArray | null;

  while ((btMatch = btEtRegex.exec(streamContent)) !== null) {
    const textBlock = btMatch[1];

    // Match text showing operators: Tj, TJ, ' or "
    // 1. TJ array operator: [ (str1) 120 (str2) <4F60> ] TJ
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;

    while ((arrayMatch = tjArrayRegex.exec(textBlock)) !== null) {
      const arrayContent = arrayMatch[1];

      // Extract literal strings (...) or hex strings <...>
      const itemRegex = /\(([\s\S]*?)\)|<([0-9a-fA-F\s]+)>/g;
      let itemMatch: RegExpExecArray | null;

      while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
        if (itemMatch[1] !== undefined) {
          output += decodePdfLiteralString(itemMatch[1]);
        } else if (itemMatch[2] !== undefined) {
          output += decodePdfHexString(itemMatch[2], cmap);
        }
      }
      output += ' ';
    }

    // 2. Simple Tj operator: (Literal) Tj or <Hex> Tj
    const simpleTjRegex = /\(([\s\S]*?)\)\s*Tj|<([0-9a-fA-F\s]+)>\s*Tj/g;
    let tjMatch: RegExpExecArray | null;

    while ((tjMatch = simpleTjRegex.exec(textBlock)) !== null) {
      if (tjMatch[1] !== undefined) {
        output += decodePdfLiteralString(tjMatch[1]) + ' ';
      } else if (tjMatch[2] !== undefined) {
        output += decodePdfHexString(tjMatch[2], cmap) + ' ';
      }
    }
  }

  return output;
}

/**
 * Splits extracted Chinese text into coherent sentences for language learning
 */
export function splitIntoChineseSentences(text: string): string[] {
  if (!text) return [];

  // Clean extra whitespace
  const normalized = text
    .replace(/[\t\r]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();

  // Split on Chinese and Western sentence terminators: 。！？.!?\n
  const rawSentences = normalized.split(/([。！？!?\n]+)/);
  const sentences: string[] = [];

  for (let i = 0; i < rawSentences.length; i += 2) {
    const sentenceBody = (rawSentences[i] || '').trim();
    const delimiter = rawSentences[i + 1] || '';
    const fullSentence = (sentenceBody + delimiter).trim();

    // Include if sentence has substance and at least one Chinese or alphanumeric character
    if (fullSentence.length > 0 && /[\u4E00-\u9FFF\w]/.test(fullSentence)) {
      sentences.push(fullSentence);
    }
  }

  return sentences.length > 0 ? sentences : [normalized];
}

/**
 * Main PDF Document Extraction Engine
 */
export async function extractTextFromPdf(
  buffer: ArrayBuffer,
  fileName: string = 'document.pdf'
): Promise<PdfDocumentResult> {
  const bytes = new Uint8Array(buffer);
  const rawTextDecoder = new TextDecoder('latin1');
  const pdfString = rawTextDecoder.decode(bytes);

  // 1. Check for CMaps (/ToUnicode)
  let combinedCMap = new Map<string, string>();
  const toUnicodeMatches = pdfString.matchAll(/\/ToUnicode\s+(\d+)\s+(\d+)\s+R/g);

  for (const match of toUnicodeMatches) {
    const objNum = match[1];
    const cmapObjRegex = new RegExp(`${objNum}\\s+0\\s+obj[\\s\\S]*?stream([\\s\\S]*?)endstream`, 'g');
    const cmapMatch = cmapObjRegex.exec(pdfString);
    if (cmapMatch) {
      const cmapData = parseCMap(cmapMatch[1]);
      cmapData.forEach((val, key) => combinedCMap.set(key, val));
    }
  }

  // 2. Locate all stream...endstream blocks
  const streamIndices: { start: number; end: number; filter: string }[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch: RegExpExecArray | null;

  while ((streamMatch = streamRegex.exec(pdfString)) !== null) {
    const startIndex = streamMatch.index + streamMatch[0].indexOf('\n') + 1;
    const endIndex = streamMatch.index + streamMatch[0].lastIndexOf('endstream');

    // Check object dictionary before stream for /Filter
    const objHeader = pdfString.substring(Math.max(0, streamMatch.index - 300), streamMatch.index);
    const isFlate = objHeader.includes('/FlateDecode');

    streamIndices.push({
      start: startIndex,
      end: endIndex,
      filter: isFlate ? 'FlateDecode' : 'None',
    });
  }

  const pagesExtracted: string[] = [];

  for (const streamInfo of streamIndices) {
    const rawStreamBytes = bytes.slice(streamInfo.start, streamInfo.end);
    let streamText = '';

    if (streamInfo.filter === 'FlateDecode') {
      const decompressed = await decompressFlate(rawStreamBytes);
      if (decompressed) {
        streamText = rawTextDecoder.decode(decompressed);
      }
    } else {
      streamText = rawTextDecoder.decode(rawStreamBytes);
    }

    if (streamText && (streamText.includes('BT') || streamText.includes('Tj') || streamText.includes('TJ'))) {
      const extracted = extractTextFromContentStream(streamText, combinedCMap);
      if (extracted.trim().length > 0) {
        pagesExtracted.push(extracted.trim());
      }
    }
  }

  // Fallback: If standard stream extraction yields empty (e.g. unprotected uncompressed literal text)
  if (pagesExtracted.length === 0) {
    const literalTextMatches = pdfString.match(/\(([\u4E00-\u9FFF\w\s.,!?-]{4,})\)/g);
    if (literalTextMatches) {
      const fallbackText = literalTextMatches
        .map((m) => m.slice(1, -1))
        .join(' ')
        .trim();
      if (fallbackText) {
        pagesExtracted.push(fallbackText);
      }
    }
  }

  // Build structured pages
  const pages: PdfPageResult[] = pagesExtracted.map((pageText, idx) => {
    const chineseChars = (pageText.match(/[\u4E00-\u9FFF]/g) || []).length;
    const sentences = splitIntoChineseSentences(pageText);

    return {
      pageNumber: idx + 1,
      text: pageText,
      chineseCharCount: chineseChars,
      sentences,
    };
  });

  const totalChineseChars = pages.reduce((sum, p) => sum + p.chineseCharCount, 0);

  return {
    fileName,
    totalPages: Math.max(1, pages.length),
    totalChineseChars,
    pages: pages.length > 0 ? pages : [
      {
        pageNumber: 1,
        text: 'Không trích xuất được văn bản rõ nét từ tài liệu. Có thể đây là tài liệu PDF dạng ảnh scan chưa qua OCR.',
        chineseCharCount: 0,
        sentences: ['Không tìm thấy văn bản text trong tệp PDF.'],
      },
    ],
  };
}

/**
 * Extracts text from plain text or markdown file (.txt, .md)
 */
export function extractTextFromTxt(
  text: string,
  fileName: string = 'document.txt'
): PdfDocumentResult {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const sentences = splitIntoChineseSentences(text);
  const chineseChars = (text.match(/[\u4E00-\u9FFF]/g) || []).length;

  return {
    fileName,
    totalPages: 1,
    totalChineseChars: chineseChars,
    pages: [
      {
        pageNumber: 1,
        text,
        chineseCharCount: chineseChars,
        sentences: sentences.length > 0 ? sentences : [text],
      },
    ],
  };
}

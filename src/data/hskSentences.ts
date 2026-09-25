/**
 * hskSentences.ts
 * Giáo trình Luyện viết mẫu câu HSK 1 chính quy của HanziVibe (汉字韵)
 * Kiến trúc 4 tầng: Chữ Hán - Pinyin - Âm Hán Việt - Dịch nghĩa ngữ cảnh
 * Tích hợp chi tiết từng chữ Hán để học viên luyện viết toàn bộ câu
 * 100% Authentic Data - Tuyệt đối không dùng dummy/placeholder
 */

import { HskSentence } from '@/types/sentence';

export const HSK1_SENTENCES: HskSentence[] = [
  // 1. Chào hỏi cơ bản
  {
    id: 'hsk1-sent-01',
    category: 'Chào hỏi & Làm quen',
    chinese: '你好！',
    pinyin: 'Nǐ hǎo!',
    sinoVietnamese: 'Nhĩ hảo!',
    vietnamese: 'Xin chào bạn!',
    grammarTip: 'Lời chào hỏi thông dụng nhất trong tiếng Trung, dùng cho mọi lứa tuổi và ngữ cảnh hàng ngày.',
    characters: [
      { char: '你', pinyin: 'nǐ', sinoVietnamese: 'NHĨ', meaning: 'Bạn, anh, chị (ngôi thứ 2)' },
      { char: '好', pinyin: 'hǎo', sinoVietnamese: 'HẢO', meaning: 'Tốt, khỏe mạnh, an lành' },
    ],
  },

  // 2. Chào hỏi xã giao
  {
    id: 'hsk1-sent-02',
    category: 'Chào hỏi & Làm quen',
    chinese: '很高兴认识你。',
    pinyin: 'Hěn gāoxìng rènshi nǐ.',
    sinoVietnamese: 'Hấn cao hứng nhận thức nhĩ.',
    vietnamese: 'Rất vui được làm quen với bạn.',
    grammarTip: 'Cấu trúc "很 + Tính từ (高兴 - vui vẻ) + Động từ (认识 - làm quen)" dùng khi gặp gỡ người mới.',
    characters: [
      { char: '很', pinyin: 'hěn', sinoVietnamese: 'HẨN', meaning: 'Rất, lắm (phó từ chỉ mức độ)' },
      { char: '高', pinyin: 'gāo', sinoVietnamese: 'CAO', meaning: 'Cao, đỉnh cao' },
      { char: '兴', pinyin: 'xìng', sinoVietnamese: 'HỨNG', meaning: 'Hứng khởi, vui mừng' },
      { char: '认', pinyin: 'rèn', sinoVietnamese: 'NHẬN', meaning: 'Nhận biết, nhận ra' },
      { char: '识', pinyin: 'shi', sinoVietnamese: 'THỨC', meaning: 'Hiểu biết, quen biết' },
      { char: '你', pinyin: 'nǐ', sinoVietnamese: 'NHĨ', meaning: 'Bạn' },
    ],
  },

  // 3. Cảm ơn
  {
    id: 'hsk1-sent-03',
    category: 'Cảm ơn & Xin lỗi',
    chinese: '谢谢你！',
    pinyin: 'Xièxie nǐ!',
    sinoVietnamese: 'Tạ tạ nhĩ!',
    vietnamese: 'Cảm ơn bạn nhiều!',
    grammarTip: 'Động từ "谢" lặp lại tạo thành "谢谢", chữ thứ hai đọc thanh nhẹ để biểu đạt sự thân mật, lịch sự.',
    characters: [
      { char: '谢', pinyin: 'xiè', sinoVietnamese: 'TẠ', meaning: 'Cảm ơn, tạ ơn' },
      { char: '谢', pinyin: 'xie', sinoVietnamese: 'TẠ', meaning: 'Cảm ơn (đọc thanh nhẹ)' },
      { char: '你', pinyin: 'nǐ', sinoVietnamese: 'NHĨ', meaning: 'Bạn' },
    ],
  },

  // 4. Không có chi
  {
    id: 'hsk1-sent-04',
    category: 'Cảm ơn & Xin lỗi',
    chinese: '不客气。',
    pinyin: 'Bù kèqi.',
    sinoVietnamese: 'Bất khách khí.',
    vietnamese: 'Không có chi, đừng khách sáo.',
    grammarTip: 'Quy tắc biến điệu chữ "不": Khi "不" (thanh 4) đứng trước một chữ mang thanh 4 ("客"), nó biến điệu đọc thành thanh 2 "Bú".',
    characters: [
      { char: '不', pinyin: 'bù', sinoVietnamese: 'BẤT', meaning: 'Không, chẳng (phủ định)' },
      { char: '客', pinyin: 'kè', sinoVietnamese: 'KHÁCH', meaning: 'Khách, khách khứa' },
      { char: '气', pinyin: 'qi', sinoVietnamese: 'KHÍ', meaning: 'Khí chất, thái độ' },
    ],
  },

  // 5. Giới thiệu bản thân - Quốc tịch
  {
    id: 'hsk1-sent-05',
    category: 'Giới thiệu bản thân',
    chinese: '我是中国人。',
    pinyin: 'Wǒ shì zhōngguó rén.',
    sinoVietnamese: 'Ngã thị Trung Quốc nhân.',
    vietnamese: 'Tôi là người Trung Quốc.',
    grammarTip: 'Cấu trúc phán đoán khẳng định: "Chủ ngữ + 是 (thị/là) + Tên quốc gia + 人 (người)".',
    characters: [
      { char: '我', pinyin: 'wǒ', sinoVietnamese: 'NGÃ', meaning: 'Tôi, bản thân mình' },
      { char: '是', pinyin: 'shì', sinoVietnamese: 'THỊ', meaning: 'Là, đúng thế' },
      { char: '中', pinyin: 'zhōng', sinoVietnamese: 'TRUNG', meaning: 'Ở giữa, trung tâm' },
      { char: '国', pinyin: 'guó', sinoVietnamese: 'QUỐC', meaning: 'Đất nước, quốc gia' },
      { char: '人', pinyin: 'rén', sinoVietnamese: 'NHÂN', meaning: 'Người' },
    ],
  },

  // 6. Giới thiệu bản thân - Nghề nghiệp
  {
    id: 'hsk1-sent-06',
    category: 'Giới thiệu bản thân',
    chinese: '我是学生。',
    pinyin: 'Wǒ shì xuésheng.',
    sinoVietnamese: 'Ngã thị học sinh.',
    vietnamese: 'Tôi là học sinh / sinh viên.',
    grammarTip: 'Từ ghép "学生" có âm Hán Việt tương đồng 100% là "Học sinh", chữ "生" đọc thanh nhẹ.',
    characters: [
      { char: '我', pinyin: 'wǒ', sinoVietnamese: 'NGÃ', meaning: 'Tôi' },
      { char: '是', pinyin: 'shì', sinoVietnamese: 'THỊ', meaning: 'Là' },
      { char: '学', pinyin: 'xué', sinoVietnamese: 'HỌC', meaning: 'Học tập, tiếp thu' },
      { char: '生', pinyin: 'sheng', sinoVietnamese: 'SINH', meaning: 'Sinh sống, học trò' },
    ],
  },

  // 7. Học tập ở trường
  {
    id: 'hsk1-sent-07',
    category: 'Học tập & Giao tiếp',
    chinese: '我在学校学习汉语。',
    pinyin: 'Wǒ zài xuéxiào xuéxí hànyǔ.',
    sinoVietnamese: 'Ngã tại học hiệu học tập Hán ngữ.',
    vietnamese: 'Tôi học tiếng Trung ở trường học.',
    grammarTip: 'Trật tự từ chỉ nơi chốn trong tiếng Trung: Đặt giới từ ngữ "在 + Địa điểm" TRƯỚC động từ hành động.',
    characters: [
      { char: '我', pinyin: 'wǒ', sinoVietnamese: 'NGÃ', meaning: 'Tôi' },
      { char: '在', pinyin: 'zài', sinoVietnamese: 'TẠI', meaning: 'Ở, tại' },
      { char: '学', pinyin: 'xué', sinoVietnamese: 'HỌC', meaning: 'Học' },
      { char: '校', pinyin: 'xiào', sinoVietnamese: 'HIỆU', meaning: 'Trường học' },
      { char: '学', pinyin: 'xué', sinoVietnamese: 'HỌC', meaning: 'Học' },
      { char: '习', pinyin: 'xí', sinoVietnamese: 'TẬP', meaning: 'Luyện tập, rèn luyện' },
      { char: '汉', pinyin: 'hàn', sinoVietnamese: 'HÁN', meaning: 'Sông Hán, người Hán' },
      { char: '语', pinyin: 'yǔ', sinoVietnamese: 'NGỮ', meaning: 'Ngôn ngữ, tiếng nói' },
    ],
  },

  // 8. Thời tiết
  {
    id: 'hsk1-sent-08',
    category: 'Thời gian & Địa điểm',
    chinese: '今天天气很好。',
    pinyin: 'Jīntiān tiānqì hěn hǎo.',
    sinoVietnamese: 'Kim thiên thiên khí hấn hảo.',
    vietnamese: 'Hôm nay thời tiết rất đẹp.',
    grammarTip: 'Câu vị ngữ tính từ: Không dùng động từ "是", mà dùng phó từ chỉ mức độ "很" đứng trước tính từ "好".',
    characters: [
      { char: '今', pinyin: 'jīn', sinoVietnamese: 'KIM', meaning: 'Hiện nay, thời nay' },
      { char: '天', pinyin: 'tiān', sinoVietnamese: 'THIÊN', meaning: 'Trời, ngày hôm nay' },
      { char: '天', pinyin: 'tiān', sinoVietnamese: 'THIÊN', meaning: 'Bầu trời' },
      { char: '气', pinyin: 'qì', sinoVietnamese: 'KHÍ', meaning: 'Không khí, khí hậu' },
      { char: '很', pinyin: 'hěn', sinoVietnamese: 'HẨN', meaning: 'Rất' },
      { char: '好', pinyin: 'hǎo', sinoVietnamese: 'HẢO', meaning: 'Tốt, đẹp' },
    ],
  },

  // 9. Nhu cầu ăn uống
  {
    id: 'hsk1-sent-09',
    category: 'Ăn uống & Đời sống',
    chinese: '我想吃米饭。',
    pinyin: 'Wǒ xiǎng chī mǐfàn.',
    sinoVietnamese: 'Ngã tưởng khất mễ phạn.',
    vietnamese: 'Tôi muốn ăn cơm trắng.',
    grammarTip: 'Động từ năng nguyện "想" (muốn) biểu đạt mong muốn chủ quan, đứng trước động từ chỉ hành động "吃".',
    characters: [
      { char: '我', pinyin: 'wǒ', sinoVietnamese: 'NGÃ', meaning: 'Tôi' },
      { char: '想', pinyin: 'xiǎng', sinoVietnamese: 'TƯỞNG', meaning: 'Muốn, nhớ, suy nghĩ' },
      { char: '吃', pinyin: 'chī', sinoVietnamese: 'KHẤT', meaning: 'Ăn' },
      { char: '米', pinyin: 'mǐ', sinoVietnamese: 'MỄ', meaning: 'Gạo' },
      { char: '饭', pinyin: 'fàn', sinoVietnamese: 'PHẠN', meaning: 'Cơm' },
    ],
  },

  // 10. Sở thích uống trà
  {
    id: 'hsk1-sent-10',
    category: 'Ăn uống & Đời sống',
    chinese: '他喜欢喝茶。',
    pinyin: 'Tā xǐhuan hē chá.',
    sinoVietnamese: 'Tha hỉ hoan há trà.',
    vietnamese: 'Anh ấy thích uống trà.',
    grammarTip: 'Động từ tâm lý "喜欢" (thích) có thể trực tiếp mang tân ngữ là một cụm động - tân "喝茶".',
    characters: [
      { char: '他', pinyin: 'tā', sinoVietnamese: 'THA', meaning: 'Anh ấy, cậu ấy (nam)' },
      { char: '喜', pinyin: 'xǐ', sinoVietnamese: 'HỈ', meaning: 'Vui mừng, hoan hỉ' },
      { char: '欢', pinyin: 'huan', sinoVietnamese: 'HOAN', meaning: 'Hân hoan' },
      { char: '喝', pinyin: 'hē', sinoVietnamese: 'HÁ', meaning: 'Uống' },
      { char: '茶', pinyin: 'chá', sinoVietnamese: 'TRÀ', meaning: 'Lá trà, nước chè' },
    ],
  },

  // 11. Hỏi đường, địa điểm
  {
    id: 'hsk1-sent-11',
    category: 'Thời gian & Địa điểm',
    chinese: '你去哪儿？',
    pinyin: 'Nǐ qù nǎr?',
    sinoVietnamese: 'Nhĩ khứ ná nhi?',
    vietnamese: 'Bạn đi đâu thế?',
    grammarTip: 'Đại từ nghi vấn chỉ nơi chốn "哪儿" (nǎr - ở đâu) giữ nguyên vị trí tân ngữ sau động từ "去", không đảo lên đầu câu.',
    characters: [
      { char: '你', pinyin: 'nǐ', sinoVietnamese: 'NHĨ', meaning: 'Bạn' },
      { char: '去', pinyin: 'qù', sinoVietnamese: 'KHỨ', meaning: 'Đi, rời khỏi' },
      { char: '哪', pinyin: 'nǎ', sinoVietnamese: 'NÁ', meaning: 'Nào, đâu' },
      { char: '儿', pinyin: 'r', sinoVietnamese: 'NHI', meaning: 'Âm uốn lưỡi chỉ địa điểm' },
    ],
  },

  // 12. Hỏi giờ
  {
    id: 'hsk1-sent-12',
    category: 'Thời gian & Địa điểm',
    chinese: '现在几点了？',
    pinyin: 'Xiànzài jǐ diǎn le?',
    sinoVietnamese: 'Hiện tại kỷ điểm liễu?',
    vietnamese: 'Bây giờ là mấy giờ rồi?',
    grammarTip: 'Hỏi số lượng nhỏ dưới 10 dùng đại từ nghi vấn "几" (mấy). Trợ từ ngữ khí "了" ở cuối câu biểu thị tình hình mới thay đổi.',
    characters: [
      { char: '现', pinyin: 'xiàn', sinoVietnamese: 'HIỆN', meaning: 'Hiện tại, rõ ràng' },
      { char: '在', pinyin: 'zài', sinoVietnamese: 'TẠI', meaning: 'Đang ở, tại' },
      { char: '几', pinyin: 'jǐ', sinoVietnamese: 'KỶ', meaning: 'Mấy, bao nhiêu' },
      { char: '点', pinyin: 'diǎn', sinoVietnamese: 'ĐIỂM', meaning: 'Giờ, điểm giọt' },
      { char: '了', pinyin: 'le', sinoVietnamese: 'LIỄU', meaning: 'Rồi (trợ từ ngữ khí)' },
    ],
  },

  // 13. Mua sắm & Hỏi giá tiền
  {
    id: 'hsk1-sent-13',
    category: 'Mua sắm & Giá cả',
    chinese: '这个多少钱？',
    pinyin: 'Zhège duōshao qián?',
    sinoVietnamese: 'Giá cá đa thiểu tiền?',
    vietnamese: 'Cái này bao nhiêu tiền?',
    grammarTip: 'Đại từ nghi vấn "多少" (bao nhiêu) dùng hỏi số lượng lớn hoặc tiền tệ, theo sau là danh từ "钱" (tiền).',
    characters: [
      { char: '这', pinyin: 'zhè', sinoVietnamese: 'GIÁ', meaning: 'Đây, này' },
      { char: '个', pinyin: 'ge', sinoVietnamese: 'CÁ', meaning: 'Cái, con (lượng từ chung)' },
      { char: '多', pinyin: 'duō', sinoVietnamese: 'ĐA', meaning: 'Nhiều' },
      { char: '少', pinyin: 'shǎo', sinoVietnamese: 'THIỂU', meaning: 'Ít' },
      { char: '钱', pinyin: 'qián', sinoVietnamese: 'TIỀN', meaning: 'Tiền bạc' },
    ],
  },

  // 14. Mời trà lịch sự
  {
    id: 'hsk1-sent-14',
    category: 'Ăn uống & Đời sống',
    chinese: '请坐，请喝茶。',
    pinyin: 'Qǐng zuò, qǐng hē chá.',
    sinoVietnamese: 'Thỉnh tọa, thỉnh hát trà.',
    vietnamese: 'Mời ngồi, mời uống trà.',
    grammarTip: 'Từ chỉ sự kính trọng "请" (qǐng - xin mời) đứng đầu mệnh đề để thể hiện phép lịch sự tối cao trong văn hóa Trung Hoa.',
    characters: [
      { char: '请', pinyin: 'qǐng', sinoVietnamese: 'THỈNH', meaning: 'Mời, xin thỉnh' },
      { char: '坐', pinyin: 'zuò', sinoVietnamese: 'TỌA', meaning: 'Ngồi' },
      { char: '请', pinyin: 'qǐng', sinoVietnamese: 'THỈNH', meaning: 'Mời' },
      { char: '喝', pinyin: 'hē', sinoVietnamese: 'HÁT', meaning: 'Uống' },
      { char: '茶', pinyin: 'chá', sinoVietnamese: 'TRÀ', meaning: 'Trà, chè' },
    ],
  },

  // 15. Khả năng viết chữ Hán
  {
    id: 'hsk1-sent-15',
    category: 'Học tập & Giao tiếp',
    chinese: '你会写汉字吗？',
    pinyin: 'Nǐ huì xiě hànzì ma?',
    sinoVietnamese: 'Nhĩ hội tả Hán tự ma?',
    vietnamese: 'Bạn có biết viết chữ Hán không?',
    grammarTip: 'Động từ năng nguyện "会" (huì) biểu thị kỹ năng thông qua học tập, kết hợp với trợ từ nghi vấn "吗" ở cuối câu.',
    characters: [
      { char: '你', pinyin: 'nǐ', sinoVietnamese: 'NHĨ', meaning: 'Bạn' },
      { char: '会', pinyin: 'huì', sinoVietnamese: 'HỘI', meaning: 'Biết (qua học hỏi)' },
      { char: '写', pinyin: 'xiě', sinoVietnamese: 'TẢ', meaning: 'Viết' },
      { char: '汉', pinyin: 'hàn', sinoVietnamese: 'HÁN', meaning: 'Hán, tiếng Hán' },
      { char: '字', pinyin: 'zì', sinoVietnamese: 'TỰ', meaning: 'Chữ' },
      { char: '吗', pinyin: 'ma', sinoVietnamese: 'MA', meaning: 'Không (hỏi)' },
    ],
  },

  // 16. Khen ngợi món ăn
  {
    id: 'hsk1-sent-16',
    category: 'Ăn uống & Đời sống',
    chinese: '中国菜太好吃了！',
    pinyin: 'Zhōngguó cài tài hǎochī le!',
    sinoVietnamese: 'Trung Quốc thái thái hảo cật liễu!',
    vietnamese: 'Món ăn Trung Quốc ngon quá chừng!',
    grammarTip: 'Cấu trúc cảm thán "太 + Tính từ + 了" dùng để ngợi khen nhiệt tình mức độ ngon của món ăn.',
    characters: [
      { char: '中', pinyin: 'zhōng', sinoVietnamese: 'TRUNG', meaning: 'Ở giữa, trung tâm' },
      { char: '国', pinyin: 'guó', sinoVietnamese: 'QUỐC', meaning: 'Đất nước' },
      { char: '菜', pinyin: 'cài', sinoVietnamese: 'THÁI', meaning: 'Món ăn, rau' },
      { char: '太', pinyin: 'tài', sinoVietnamese: 'THÁI', meaning: 'Quá, rất' },
      { char: '好', pinyin: 'hǎo', sinoVietnamese: 'HẢO', meaning: 'Tốt, ngon' },
      { char: '吃', pinyin: 'chī', sinoVietnamese: 'CẬT', meaning: 'Ăn' },
      { char: '了', pinyin: 'le', sinoVietnamese: 'LIỄU', meaning: 'Trợ từ cảm thán' },
    ],
  },

  // 17. Lịch trình ngày mai
  {
    id: 'hsk1-sent-17',
    category: 'Thời gian & Địa điểm',
    chinese: '我们明天去学校。',
    pinyin: 'Wǒmen míngtiān qù xuéxiào.',
    sinoVietnamese: 'Ngã môn minh thiên khứ học hiệu.',
    vietnamese: 'Ngày mai chúng tôi đi đến trường.',
    grammarTip: 'Trạng từ thời gian "明天" (ngày mai) đứng trước hoặc sau chủ ngữ "我们", luôn đứng TRƯỚC động từ "去".',
    characters: [
      { char: '我', pinyin: 'wǒ', sinoVietnamese: 'NGÃ', meaning: 'Tôi' },
      { char: '们', pinyin: 'men', sinoVietnamese: 'MÔN', meaning: 'Chúng (số nhiều)' },
      { char: '明', pinyin: 'míng', sinoVietnamese: 'MINH', meaning: 'Sáng, mai' },
      { char: '天', pinyin: 'tiān', sinoVietnamese: 'THIÊN', meaning: 'Ngày, trời' },
      { char: '去', pinyin: 'qù', sinoVietnamese: 'KHỨ', meaning: 'Đi' },
      { char: '学', pinyin: 'xué', sinoVietnamese: 'HỌC', meaning: 'Học' },
      { char: '校', pinyin: 'xiào', sinoVietnamese: 'HIỆU', meaning: 'Trường' },
    ],
  },

  // 18. Số lượng thành viên gia đình
  {
    id: 'hsk1-sent-18',
    category: 'Giới thiệu bản thân',
    chinese: '我家有四口人。',
    pinyin: 'Wǒ jiā yǒu sì kǒu rén.',
    sinoVietnamese: 'Ngã gia hữu tứ khẩu nhân.',
    vietnamese: 'Nhà tôi có bốn người.',
    grammarTip: 'Lượng từ "口" (kǒu) dùng đếm nhân khẩu gia đình, đứng giữa số từ "四" và danh từ "人".',
    characters: [
      { char: '我', pinyin: 'wǒ', sinoVietnamese: 'NGÃ', meaning: 'Tôi' },
      { char: '家', pinyin: 'jiā', sinoVietnamese: 'GIA', meaning: 'Nhà, gia đình' },
      { char: '有', pinyin: 'yǒu', sinoVietnamese: 'HỮU', meaning: 'Có' },
      { char: '四', pinyin: 'sì', sinoVietnamese: 'TỨ', meaning: 'Bốn (4)' },
      { char: '口', pinyin: 'kǒu', sinoVietnamese: 'KHẨU', meaning: 'Miệng, lượng từ người' },
      { char: '人', pinyin: 'rén', sinoVietnamese: 'NHÂN', meaning: 'Người' },
    ],
  },
];

/**
 * Danh sách toàn bộ danh mục của mẫu câu HSK 1
 */
export const HSK1_SENTENCE_CATEGORIES = [
  'Tất cả',
  'Chào hỏi & Làm quen',
  'Cảm ơn & Xin lỗi',
  'Giới thiệu bản thân',
  'Học tập & Giao tiếp',
  'Ăn uống & Đời sống',
  'Thời gian & Địa điểm',
  'Mua sắm & Giá cả',
] as const;

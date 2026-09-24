/**
 * hskCurriculum.ts
 * Kho dữ liệu giáo trình HSK 1-3 chính quy của HanziVibe (汉字韵)
 * Kiến trúc 4 tầng thông tin Hán - Việt: Chữ Hán - Pinyin - Âm Hán Việt - Nghĩa tiếng Việt
 * Tích hợp đầy đủ: Bộ thủ, Số nét, Chiết tự, Mẹo nhớ đòn bẩy, Mẫu câu ngữ cảnh thực tế, Phân tích thanh điệu
 * 100% Authentic Data - Tuyệt đối không dùng dummy/placeholder
 */

import { HskWord } from '@/types/hsk';

export const HSK_CURRICULUM: HskWord[] = [
  // 1. 你 (nǐ) - Thanh 3
  {
    id: 'hsk1-01-ni',
    hanzi: '你',
    pinyin: 'nǐ',
    pinyinNumbered: 'ni3',
    tone: 3,
    tones: [3],
    sinoVietnamese: 'NHĨ',
    vietnameseMeaning: 'Bạn, anh, chị, em (đại từ nhân xưng ngôi thứ hai)',
    hskLevel: 1,
    radical: '亻',
    radicalMeaning: 'Bộ Nhân đứng (người), biểu thị đối tượng xưng hô là con người',
    strokeCount: 7,
    decomposition: 'Bên trái là bộ Nhân đứng (亻), bên phải là chữ Nhĩ (尔) mang ý nghĩa người đối diện',
    mnemonic: 'Người (亻) đang đứng trò chuyện đối diện chính là Bạn (NHĨ - 你)',
    toneAnalysis: 'Thanh 3 (214): Khởi đầu ở bậc 2, hạ thấp xuống đáy thanh quản bậc 1 rồi uốn nhẹ lên bậc 4. Trầm ấm, có độ trũng.',
    exampleSentence: {
      chinese: '你好，很高兴认识你。',
      pinyin: 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.',
      vietnamese: 'Xin chào, rất vui được làm quen với bạn.',
      sinoVietnamese: 'Nhĩ hảo, hấn cao hứng nhận thức nhĩ.',
    },
    relatedWords: [
      { hanzi: '你们', pinyin: 'nǐmen', sinoVietnamese: 'NHĨ MÔN', vietnamese: 'Các bạn' },
      { hanzi: '你的', pinyin: 'nǐ de', sinoVietnamese: 'NHĨ ĐÍCH', vietnamese: 'Của bạn' },
    ],
  },

  // 2. 好 (hǎo) - Thanh 3
  {
    id: 'hsk1-02-hao',
    hanzi: '好',
    pinyin: 'hǎo',
    pinyinNumbered: 'hao3',
    tone: 3,
    tones: [3],
    sinoVietnamese: 'HẢO',
    vietnameseMeaning: 'Tốt, đẹp, hay, khỏe mạnh',
    hskLevel: 1,
    radical: '女',
    radicalMeaning: 'Bộ Nữ (phụ nữ, người mẹ)',
    strokeCount: 6,
    decomposition: 'Bên trái là bộ Nữ (女), bên phải là bộ Tử (子 - con cái)',
    mnemonic: 'Người mẹ (女) ẵm đứa con (子) trên tay là điều Tốt Đẹp, Hạnh Phúc nhất (HẢO - 好)',
    toneAnalysis: 'Thanh 3 (214): Độ dốc rơi từ trung bình xuống sâu rồi vút nhẹ cuối âm. Khi đi trước thanh 3 khác sẽ biến điệu thành thanh 2.',
    exampleSentence: {
      chinese: '今天天气非常好。',
      pinyin: 'Jīntiān tiānqì fēicháng hǎo.',
      vietnamese: 'Hôm nay thời tiết vô cùng tốt đẹp.',
      sinoVietnamese: 'Kim thiên thiên khí phi thường hảo.',
    },
    relatedWords: [
      { hanzi: '好人', pinyin: 'hǎorén', sinoVietnamese: 'HẢO NHÂN', vietnamese: 'Người tốt' },
      { hanzi: '好吃', pinyin: 'hǎochī', sinoVietnamese: 'HẢO KHẤT', vietnamese: 'Ngon miệng' },
      { hanzi: '友好', pinyin: 'yǒuhǎo', sinoVietnamese: 'HỮU HẢO', vietnamese: 'Thân thiện, hữu hảo' },
    ],
  },

  // 3. 你好 (nǐ hǎo) - Thanh 3 + 3 (Biến điệu)
  {
    id: 'hsk1-03-nihao',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    pinyinNumbered: 'ni3 hao3',
    tone: 3,
    tones: [3, 3],
    sinoVietnamese: 'NHĨ HẢO',
    vietnameseMeaning: 'Xin chào, chúc bạn an lành',
    hskLevel: 1,
    radical: '亻',
    radicalMeaning: 'Bộ Nhân đứng đại diện cho nhân vị đối thoại',
    strokeCount: 13,
    decomposition: 'Ghép từ chữ 你 (Nhĩ: bạn) và chữ 好 (Hảo: tốt đẹp)',
    mnemonic: 'Chúc bạn (NHĨ) luôn luôn gặp điều tốt lành (HẢO) -> Lời chào chân thành NHĨ HẢO (你好)',
    toneAnalysis: 'Biến điệu hai Thanh 3 liên tiếp: Chữ "你" biến âm đọc thành Thanh 2 (ní), chữ "好" giữ nguyên Thanh 3 (hǎo).',
    exampleSentence: {
      chinese: '王老师，您好！',
      pinyin: 'Wáng lǎoshī, nín hǎo!',
      vietnamese: 'Thưa thầy Vương, kính chào thầy!',
      sinoVietnamese: 'Vương lão sư, nâm hảo!',
    },
    relatedWords: [
      { hanzi: '您好', pinyin: 'nín hǎo', sinoVietnamese: 'NÂM HẢO', vietnamese: 'Kính chào ngài' },
    ],
  },

  // 4. 学 (xué) - Thanh 2
  {
    id: 'hsk1-04-xue',
    hanzi: '学',
    pinyin: 'xué',
    pinyinNumbered: 'xue2',
    tone: 2,
    tones: [2],
    sinoVietnamese: 'HỌC',
    vietnameseMeaning: 'Học hỏi, nghiên cứu, thu nhận tri thức',
    hskLevel: 1,
    radical: '子',
    radicalMeaning: 'Bộ Tử (đứa trẻ, con cái, mầm non)',
    strokeCount: 8,
    decomposition: 'Phía trên là mái che tri thức (冖 biến thể với 3 nét chấm phẩy), phía dưới là đứa trẻ (子)',
    mnemonic: 'Dưới mái trường, đứa trẻ (子) mở rộng tầm mắt để Học (学)',
    toneAnalysis: 'Thanh 2 (35 - Dương Bình): Khởi phát từ cao độ trung bình (bậc 3), vút thẳng dứt khoát lên đỉnh (bậc 5), mang năng lượng hướng thượng.',
    exampleSentence: {
      chinese: '我想在大学学汉语。',
      pinyin: 'Wǒ xiǎng zài dàxué xué hànyǔ.',
      vietnamese: 'Tôi muốn học tiếng Trung ở trường đại học.',
      sinoVietnamese: 'Ngã tưởng tại đại học học Hán ngữ.',
    },
    relatedWords: [
      { hanzi: '学生', pinyin: 'xuésheng', sinoVietnamese: 'HỌC SINH', vietnamese: 'Học sinh, sinh viên' },
      { hanzi: '学校', pinyin: 'xuéxiào', sinoVietnamese: 'HỌC HIỆU', vietnamese: 'Trường học' },
      { hanzi: '大学', pinyin: 'dàxué', sinoVietnamese: 'ĐẠI HỌC', vietnamese: 'Trường đại học' },
    ],
  },

  // 5. 习 (xí) - Thanh 2
  {
    id: 'hsk1-05-xi',
    hanzi: '习',
    pinyin: 'xí',
    pinyinNumbered: 'xi2',
    tone: 2,
    tones: [2],
    sinoVietnamese: 'TẬP',
    vietnameseMeaning: 'Rèn luyện, làm đi làm lại, thói quen',
    hskLevel: 1,
    radical: '乙',
    radicalMeaning: 'Bộ Ất (uốn lượn)',
    strokeCount: 3,
    decomposition: 'Hình tượng cánh chim non (chữ Vũ giản lược) đang đập cánh tập bay',
    mnemonic: 'Chim non đập cánh nhiều lần tạo thành thói quen Luyện Tập (TẬP - 习)',
    toneAnalysis: 'Thanh 2 (35): Độ dốc dương đi lên đều đặn từ bậc 3 lên bậc 5.',
    exampleSentence: {
      chinese: '学而时习之，不亦说乎。',
      pinyin: 'Xué ér shí xí zhī, bù yì yuè hū.',
      vietnamese: 'Học mà thường xuyên ôn tập rèn luyện, chẳng phải vui lắm sao.',
      sinoVietnamese: 'Học nhi thời tập chi, bất diệc duyệt hồ.',
    },
    relatedWords: [
      { hanzi: '练习', pinyin: 'liànxí', sinoVietnamese: 'LUYỆN TẬP', vietnamese: 'Bài tập, luyện tập' },
      { hanzi: '习惯', pinyin: 'xíguàn', sinoVietnamese: 'TẬP QUÁN', vietnamese: 'Thói quen, phong tục' },
    ],
  },

  // 6. 学习 (xué xí) - Thanh 2 + 2
  {
    id: 'hsk1-06-xuexi',
    hanzi: '学习',
    pinyin: 'xué xí',
    pinyinNumbered: 'xue2 xi2',
    tone: 2,
    tones: [2, 2],
    sinoVietnamese: 'HỌC TẬP',
    vietnameseMeaning: 'Học tập, tiếp thu kiến thức và trau dồi kỹ năng',
    hskLevel: 1,
    radical: '子',
    radicalMeaning: 'Bộ Tử (con người học hỏi từ thơ bé)',
    strokeCount: 11,
    decomposition: 'Ghép từ Học (学: thu nhận kiến thức) và Tập (习: rèn luyện thực hành)',
    mnemonic: 'Vừa Học lý thuyết vừa Thực Tập rèn luyện mới tạo nên sự tinh thông -> HỌC TẬP (学习)',
    toneAnalysis: 'Chuỗi Thanh 2 kép (35 + 35): Cả hai âm tiết đều vút lên nhịp nhàng, tạo âm hưởng phấn chấn.',
    exampleSentence: {
      chinese: '我们每天一起努力学习。',
      pinyin: 'Wǒmen měitiān yìqǐ nǔlì xuéxí.',
      vietnamese: 'Chúng tôi mỗi ngày cùng nhau nỗ lực học tập.',
      sinoVietnamese: 'Ngã môn mỗi thiên nhất khởi nỗ lực học tập.',
    },
    relatedWords: [
      { hanzi: '复习', pinyin: 'fùxí', sinoVietnamese: 'PHỤC TẬP', vietnamese: 'Ôn tập' },
      { hanzi: '自学', pinyin: 'zìxué', sinoVietnamese: 'TỰ HỌC', vietnamese: 'Tự học' },
    ],
  },

  // 7. 汉 (hàn) - Thanh 4
  {
    id: 'hsk1-07-han',
    hanzi: '汉',
    pinyin: 'hàn',
    pinyinNumbered: 'han4',
    tone: 4,
    tones: [4],
    sinoVietnamese: 'HÁN',
    vietnameseMeaning: 'Dân tộc Hán, sông Hán Thủy, văn hóa Hán',
    hskLevel: 1,
    radical: '氵',
    radicalMeaning: 'Bộ Ba chấm thủy (nước, dòng sông)',
    strokeCount: 5,
    decomposition: 'Bên trái là Ba chấm thủy (氵), bên phải là chữ Hựu (又 - lại, bàn tay)',
    mnemonic: 'Dòng sông Hán Thủy (氵) nghìn năm nuôi dưỡng con người bền bỉ (又) lập nên Hán triều (HÁN - 汉)',
    toneAnalysis: 'Thanh 4 (51 - Khứ Thanh): Rơi nhanh và dứt khoát từ đỉnh cao nhất (bậc 5) xuống đáy (bậc 1). Phát âm mạnh, dứt khoát, không kéo dài.',
    exampleSentence: {
      chinese: '中国有五十六个民族，汉族人口最多。',
      pinyin: 'Zhōngguó yǒu wǔshíliù gè mínzú, Hànzú rénkǒu zuì duō.',
      vietnamese: 'Trung Quốc có 56 dân tộc, trong đó người Hán đông dân nhất.',
      sinoVietnamese: 'Trung Quốc hữu ngũ thập lục cá dân tộc, Hán tộc nhân khẩu tối đa.',
    },
    relatedWords: [
      { hanzi: '汉字', pinyin: 'hànzì', sinoVietnamese: 'HÁN TỰ', vietnamese: 'Chữ Hán' },
      { hanzi: '汉学', pinyin: 'hànxué', sinoVietnamese: 'HÁN HỌC', vietnamese: 'Hán học' },
    ],
  },

  // 8. 语 (yǔ) - Thanh 3
  {
    id: 'hsk1-08-yu',
    hanzi: '语',
    pinyin: 'yǔ',
    pinyinNumbered: 'yu3',
    tone: 3,
    tones: [3],
    sinoVietnamese: 'NGỮ',
    vietnameseMeaning: 'Ngôn ngữ, lời nói, tiếng nói',
    hskLevel: 1,
    radical: '讠',
    radicalMeaning: 'Bộ Ngôn (lời nói, đàm thoại)',
    strokeCount: 9,
    decomposition: 'Bên trái là bộ Ngôn (讠), bên phải gồm số Năm (五) và cái Miệng (口)',
    mnemonic: 'Dùng lời Ngôn (讠) của Năm (五) cái Miệng (口) hòa chung tiếng nói tạo thành NGÔN NGỮ (语)',
    toneAnalysis: 'Thanh 3 (214): Độ trũng sâu, giọng hạ thấp rồi ngân nhẹ.',
    exampleSentence: {
      chinese: '语言是文化交流的桥梁。',
      pinyin: 'Yǔyán shì wénhuà jiāoliú de qiáoliáng.',
      vietnamese: 'Ngôn ngữ là cây cầu kết nối giao lưu văn hóa.',
      sinoVietnamese: 'Ngữ ngôn thị văn hóa giao lưu đích kiều lương.',
    },
    relatedWords: [
      { hanzi: '语言', pinyin: 'yǔyán', sinoVietnamese: 'NGỮ NGÔN', vietnamese: 'Ngôn ngữ' },
      { hanzi: '口语', pinyin: 'kǒuyǔ', sinoVietnamese: 'KHẨU NGỮ', vietnamese: 'Khẩu ngữ, văn nói' },
      { hanzi: '成语', pinyin: 'chéngyǔ', sinoVietnamese: 'THÀNH NGỮ', vietnamese: 'Thành ngữ' },
    ],
  },

  // 9. 汉语 (hàn yǔ) - Thanh 4 + 3
  {
    id: 'hsk1-09-hanyu',
    hanzi: '汉语',
    pinyin: 'hàn yǔ',
    pinyinNumbered: 'han4 yu3',
    tone: 4,
    tones: [4, 3],
    sinoVietnamese: 'HÁN NGỮ',
    vietnameseMeaning: 'Tiếng Hán, tiếng Trung Quốc phổ thông',
    hskLevel: 1,
    radical: '氵',
    radicalMeaning: 'Bộ Thủy đại diện cho cội nguồn Hán',
    strokeCount: 14,
    decomposition: 'Ghép từ chữ 汉 (Hán) và chữ 语 (Ngữ)',
    mnemonic: 'Tiếng nói của người Hán chính là HÁN NGỮ (汉语)',
    toneAnalysis: 'Tương phản cao độ: Thanh 4 dốc thẳng dứt khoát kết hợp với Thanh 3 uốn trũng sâu sắc nét.',
    exampleSentence: {
      chinese: '学习汉语可以帮我们看懂很多汉越词。',
      pinyin: 'Xuéxí hànyǔ kěyǐ bāng wǒmen kàndǒng hěn duō hànyuè cí.',
      vietnamese: 'Học tiếng Trung giúp chúng ta hiểu sâu sắc rất nhiều từ Hán - Việt.',
      sinoVietnamese: 'Học tập Hán ngữ khả dĩ bang ngã môn khán đổng hấn đa Hán Việt từ.',
    },
    relatedWords: [
      { hanzi: '普通话', pinyin: 'pǔtōnghuà', sinoVietnamese: 'PHỔ THÔNG THOẠI', vietnamese: 'Tiếng Phổ thông' },
      { hanzi: '外语', pinyin: 'wàiyǔ', sinoVietnamese: 'NGOẠI NGỮ', vietnamese: 'Ngoại ngữ' },
    ],
  },

  // 10. 家 (jiā) - Thanh 1
  {
    id: 'hsk1-10-jia',
    hanzi: '家',
    pinyin: 'jiā',
    pinyinNumbered: 'jia1',
    tone: 1,
    tones: [1],
    sinoVietnamese: 'GIA',
    vietnameseMeaning: 'Nhà, gia đình, nơi chốn sum vầy',
    hskLevel: 1,
    radical: '宀',
    radicalMeaning: 'Bộ Miên (mái nhà che chở)',
    strokeCount: 10,
    decomposition: 'Phía trên là mái nhà (宀), phía dưới là con heo (豕 - Thỉ)',
    mnemonic: 'Thời cổ, dưới Mái Nhà (宀) có nuôi gia súc ấm no (豕) chính là Tổ Ấm GIA ĐÌNH (GIA - 家)',
    toneAnalysis: 'Thanh 1 (55 - Âm Bình): Giữ cao độ ổn định trên tầng cao nhất (bậc 5), ngân đều và trong trẻo, không rơi không lên.',
    exampleSentence: {
      chinese: '我爱我的家。',
      pinyin: 'Wǒ ài wǒ de jiā.',
      vietnamese: 'Tôi yêu gia đình của tôi.',
      sinoVietnamese: 'Ngã ái ngã đích gia.',
    },
    relatedWords: [
      { hanzi: '家庭', pinyin: 'jiātíng', sinoVietnamese: 'GIA ĐÌNH', vietnamese: 'Gia đình' },
      { hanzi: '家人', pinyin: 'jiārén', sinoVietnamese: 'GIA NHÂN', vietnamese: 'Người nhà' },
      { hanzi: '大家', pinyin: 'dàjiā', sinoVietnamese: 'ĐẠI GIA', vietnamese: 'Mọi người' },
    ],
  },

  // 11. 国 (guó) - Thanh 2
  {
    id: 'hsk2-11-guo',
    hanzi: '国',
    pinyin: 'guó',
    pinyinNumbered: 'guo2',
    tone: 2,
    tones: [2],
    sinoVietnamese: 'QUỐC',
    vietnameseMeaning: 'Đất nước, xứ sở, quốc gia',
    hskLevel: 2,
    radical: '囗',
    radicalMeaning: 'Bộ Vi (vây quanh, biên giới khép kín)',
    strokeCount: 8,
    decomposition: 'Bên ngoài là bộ Vi (囗 - biên cương), bên trong là viên ngọc quý (玉)',
    mnemonic: 'Bên trong biên giới non sông (囗) gìn giữ ngọc quý bờ cõi (玉) là QUỐC GIA (QUỐC - 国)',
    toneAnalysis: 'Thanh 2 (35): Âm thanh bay bổng từ bậc 3 vút lên bậc 5.',
    exampleSentence: {
      chinese: '爱国是每个公民的责任。',
      pinyin: 'Àiguó shì měi gè gōngmín de zérèn.',
      vietnamese: 'Yêu nước là trách nhiệm của mỗi công dân.',
      sinoVietnamese: 'Ái quốc thị mỗi cá công dân đích trách nhiệm.',
    },
    relatedWords: [
      { hanzi: '中国', pinyin: 'zhōngguó', sinoVietnamese: 'TRUNG QUỐC', vietnamese: 'Nước Trung Quốc' },
      { hanzi: '国际', pinyin: 'guójì', sinoVietnamese: 'QUỐC TẾ', vietnamese: 'Quốc tế' },
      { hanzi: '外国人', pinyin: 'wàiguórén', sinoVietnamese: 'NGOẠI QUỐC NHÂN', vietnamese: 'Người nước ngoài' },
    ],
  },

  // 12. 国家 (guó jiā) - Thanh 2 + 1
  {
    id: 'hsk2-12-guojia',
    hanzi: '国家',
    pinyin: 'guó jiā',
    pinyinNumbered: 'guo2 jia1',
    tone: 2,
    tones: [2, 1],
    sinoVietnamese: 'QUỐC GIA',
    vietnameseMeaning: 'Đất nước, quốc gia dân tộc',
    hskLevel: 2,
    radical: '囗',
    radicalMeaning: 'Bộ Vi bao bọc toàn vẹn',
    strokeCount: 18,
    decomposition: 'Kết hợp giữa Đất Nước (国) và Gia Đình (家)',
    mnemonic: 'Nước (QUỐC) là mái ấm lớn chở che cho muôn ngàn gia đình nhỏ (GIA) -> QUỐC GIA (国家)',
    toneAnalysis: 'Thanh 2 (35) vút lên nối tiếp Thanh 1 (55) ngân cao: Giai điệu trầm hùng và trang nghiêm.',
    exampleSentence: {
      chinese: '越南和中国是有深厚友谊的国家。',
      pinyin: 'Yuènán hé Zhōngguó shì yǒu shēnhòu yǒuyì de guójiā.',
      vietnamese: 'Việt Nam và Trung Quốc là những quốc gia có tình hữu nghị sâu sắc.',
      sinoVietnamese: 'Việt Nam hòa Trung Quốc thị hữu thâm hậu hữu nghị đích quốc gia.',
    },
    relatedWords: [
      { hanzi: '国歌', pinyin: 'guógē', sinoVietnamese: 'QUỐC CA', vietnamese: 'Bài hát quốc ca' },
      { hanzi: '国家主席', pinyin: 'guójiā zhǔxí', sinoVietnamese: 'QUỐC GIA CHỦ TỊCH', vietnamese: 'Chủ tịch nước' },
    ],
  },

  // 13. 爱 (ài) - Thanh 4
  {
    id: 'hsk1-13-ai',
    hanzi: '爱',
    pinyin: 'ài',
    pinyinNumbered: 'ai4',
    tone: 4,
    tones: [4],
    sinoVietnamese: 'ÁI',
    vietnameseMeaning: 'Yêu thương, yêu mến, thích thú',
    hskLevel: 1,
    radical: '爫',
    radicalMeaning: 'Bộ Trảo (bàn tay che chở từ phía trên)',
    strokeCount: 10,
    decomposition: 'Phía trên là bàn tay vuốt ve (爫), ở giữa là mái che (冖), bên dưới là tình bạn chân thành (友)',
    mnemonic: 'Dang tay che chở và trao trọn tình bạn chân thành chính là Tình Yêu (ÁI - 爱)',
    toneAnalysis: 'Thanh 4 (51): Điểm bắt đầu cực cao (5) lao dốc thẳng xuống (1), chứa chan cảm xúc dứt khoát.',
    exampleSentence: {
      chinese: '父母非常关爱孩子。',
      pinyin: 'Fùmǔ fēicháng guān\'ài háizi.',
      vietnamese: 'Cha mẹ vô cùng yêu thương và chăm sóc con cái.',
      sinoVietnamese: 'Phụ mẫu phi thường quan ái hài tử.',
    },
    relatedWords: [
      { hanzi: '爱情', pinyin: 'àiqíng', sinoVietnamese: 'ÁI TÌNH', vietnamese: 'Tình yêu đôi lứa' },
      { hanzi: '爱好', pinyin: 'àihào', sinoVietnamese: 'ÁI HẢO', vietnamese: 'Sở thích' },
      { hanzi: '可爱', pinyin: 'kě\'ài', sinoVietnamese: 'KHẢ ÁI', vietnamese: 'Đáng yêu' },
    ],
  },

  // 14. 天 (tiān) - Thanh 1
  {
    id: 'hsk1-14-tian',
    hanzi: '天',
    pinyin: 'tiān',
    pinyinNumbered: 'tian1',
    tone: 1,
    tones: [1],
    sinoVietnamese: 'THIÊN',
    vietnameseMeaning: 'Trời, bầu trời, ngày, thời gian',
    hskLevel: 1,
    radical: '大',
    radicalMeaning: 'Bộ Đại (người dang rộng hai tay)',
    strokeCount: 4,
    decomposition: 'Bên dưới là chữ Đại (大 - người vĩ đại), phía trên là một nét ngang tượng trưng cho vòm trời',
    mnemonic: 'Trên đỉnh đầu của con người vĩ đại (大) chính là Bầu Trời bao la (THIÊN - 天)',
    toneAnalysis: 'Thanh 1 (55): Cao bằng, trong vắt như vòm trời xanh lơ.',
    exampleSentence: {
      chinese: '今天蓝天白云，景色优美。',
      pinyin: 'Jīntiān lántiān báiyún, jǐngsè yōuměi.',
      vietnamese: 'Hôm nay trời xanh mây trắng, phong cảnh tươi đẹp.',
      sinoVietnamese: 'Kim thiên lam thiên bạch vân, cảnh sắc ưu mỹ.',
    },
    relatedWords: [
      { hanzi: '天天', pinyin: 'tiāntiān', sinoVietnamese: 'THIÊN THIÊN', vietnamese: 'Ngày ngày, mỗi ngày' },
      { hanzi: '天下', pinyin: 'tiānxià', sinoVietnamese: 'THIÊN HẠ', vietnamese: 'Thiên hạ, dưới bầu trời' },
    ],
  },

  // 15. 明 (míng) - Thanh 2
  {
    id: 'hsk1-15-ming',
    hanzi: '明',
    pinyin: 'míng',
    pinyinNumbered: 'ming2',
    tone: 2,
    tones: [2],
    sinoVietnamese: 'MINH',
    vietnameseMeaning: 'Sáng tỏ, rõ ràng, thông thái, ngày mai',
    hskLevel: 1,
    radical: '日',
    radicalMeaning: 'Bộ Nhật (mặt trời, ánh sáng rực rỡ)',
    strokeCount: 8,
    decomposition: 'Bên trái là Mặt Trời (日 - Nhật), bên phải là Mặt Trăng (月 - Nguyệt)',
    mnemonic: 'Ánh sáng của Mặt Trời (日) hội tụ cùng Mặt Trăng (月) tạo nên sự Sáng Tỏ huy hoàng (MINH - 明)',
    toneAnalysis: 'Thanh 2 (35): Hướng lên, sáng bừng âm điệu.',
    exampleSentence: {
      chinese: '他的解释非常明确。',
      pinyin: 'Tā de jiěshì fēicháng míngquè.',
      vietnamese: 'Lời giải thích của anh ấy vô cùng sáng tỏ rõ ràng.',
      sinoVietnamese: 'Tha đích giải thích phi thường minh xác.',
    },
    relatedWords: [
      { hanzi: '明白', pinyin: 'míngbai', sinoVietnamese: 'MINH BẠCH', vietnamese: 'Hiểu rõ, rõ ràng' },
      { hanzi: '光明', pinyin: 'guāngmíng', sinoVietnamese: 'QUANG MINH', vietnamese: 'Ánh sáng, tương lai sáng lạn' },
      { hanzi: '明星', pinyin: 'míngxīng', sinoVietnamese: 'MINH TINH', vietnamese: 'Ngôi sao, người nổi tiếng' },
    ],
  },

  // 16. 明天 (míng tiān) - Thanh 2 + 1
  {
    id: 'hsk1-16-mingtian',
    hanzi: '明天',
    pinyin: 'míng tiān',
    pinyinNumbered: 'ming2 tian1',
    tone: 2,
    tones: [2, 1],
    sinoVietnamese: 'MINH THIÊN',
    vietnameseMeaning: 'Ngày mai, tương lai phía trước',
    hskLevel: 1,
    radical: '日',
    radicalMeaning: 'Bộ Nhật tượng trưng cho vòng quay ngày tháng',
    strokeCount: 12,
    decomposition: 'Ghép từ Minh (明: sáng tỏ) và Thiên (天: ngày)',
    mnemonic: 'Khi bình minh tỏa sáng ngày mới (MINH) bắt đầu một ngày (THIÊN) -> NGÀY MAI (明天)',
    toneAnalysis: 'Thanh 2 (35) vút nhẹ tiếp nối Thanh 1 (55) bay bổng.',
    exampleSentence: {
      chinese: '明天早上我们八点出发。',
      pinyin: 'Míngtiān zǎoshang wǒmen bā diǎn chūfā.',
      vietnamese: 'Sáng mai tám giờ chúng ta xuất phát.',
      sinoVietnamese: 'Minh thiên tảo thượng ngã môn bát điểm xuất phát.',
    },
    relatedWords: [
      { hanzi: '明年', pinyin: 'míngnián', sinoVietnamese: 'MINH NIÊN', vietnamese: 'Năm sau' },
    ],
  },

  // 17. 人 (rén) - Thanh 2
  {
    id: 'hsk1-17-ren',
    hanzi: '人',
    pinyin: 'rén',
    pinyinNumbered: 'ren2',
    tone: 2,
    tones: [2],
    sinoVietnamese: 'NHÂN',
    vietnameseMeaning: 'Con người, nhân loại, người khác',
    hskLevel: 1,
    radical: '人',
    radicalMeaning: 'Bộ Nhân (hình bóng người bước đi hai chân vững vàng)',
    strokeCount: 2,
    decomposition: 'Hai nét bút: Nét phẩy (撇) vươn sang trái, nét mác (捺) nâng đỡ sang phải',
    mnemonic: 'Con người biết nương tựa nhau để đứng vững giữa đất trời (NHÂN - 人)',
    toneAnalysis: 'Thanh 2 (35): Âm vang bay bổng, kéo từ bậc 3 lên đỉnh bậc 5.',
    exampleSentence: {
      chinese: '做人要有爱心和责任感。',
      pinyin: 'Zuòrén yào yǒu àixīn hé zérèngǎn.',
      vietnamese: 'Làm người phải có lòng nhân ái và tinh thần trách nhiệm.',
      sinoVietnamese: 'Tố nhân yếu hữu ái tâm hòa trách nhiệm cảm.',
    },
    relatedWords: [
      { hanzi: '人民', pinyin: 'rénmín', sinoVietnamese: 'NHÂN DÂN', vietnamese: 'Nhân dân' },
      { hanzi: '人类', pinyin: 'rénlèi', sinoVietnamese: 'NHÂN LOẠI', vietnamese: 'Nhân loại' },
      { hanzi: '好人', pinyin: 'hǎorén', sinoVietnamese: 'HẢO NHÂN', vietnamese: 'Người tốt' },
    ],
  },

  // 18. 大 (dà) - Thanh 4
  {
    id: 'hsk1-18-da',
    hanzi: '大',
    pinyin: 'dà',
    pinyinNumbered: 'da4',
    tone: 4,
    tones: [4],
    sinoVietnamese: 'ĐẠI',
    vietnameseMeaning: 'To lớn, rộng lớn, vĩ đại',
    hskLevel: 1,
    radical: '大',
    radicalMeaning: 'Bộ Đại chính thể',
    strokeCount: 3,
    decomposition: 'Hình dáng một con người dang rộng hai cánh tay hết cỡ biểu thị sự bao la',
    mnemonic: 'Người vươn thẳng hai cánh tay đón gió biểu hiện sự To Lớn Vĩ Đại (ĐẠI - 大)',
    toneAnalysis: 'Thanh 4 (51): Giọng dứt khoát, uy lực, phát âm từ bậc 5 hạ xuống bậc 1.',
    exampleSentence: {
      chinese: '这个世界非常博大精彩。',
      pinyin: 'Zhège shìjiè fēicháng bódà jīngcǎi.',
      vietnamese: 'Thế giới này vô cùng rộng lớn và kỳ diệu.',
      sinoVietnamese: 'Giá cá thế giới phi thường bác đại tinh thái.',
    },
    relatedWords: [
      { hanzi: '大人', pinyin: 'dàren', sinoVietnamese: 'ĐẠI NHÂN', vietnamese: 'Người lớn' },
      { hanzi: '大家', pinyin: 'dàjiā', sinoVietnamese: 'ĐẠI GIA', vietnamese: 'Mọi người' },
      { hanzi: '大门', pinyin: 'dàmén', sinoVietnamese: 'ĐẠI MÔN', vietnamese: 'Cổng lớn' },
    ],
  },

  // 19. 大人 (dà rén) - Thanh 4 + 2
  {
    id: 'hsk1-19-daren',
    hanzi: '大人',
    pinyin: 'dà rén',
    pinyinNumbered: 'da4 ren2',
    tone: 4,
    tones: [4, 2],
    sinoVietnamese: 'ĐẠI NHÂN',
    vietnameseMeaning: 'Người lớn, người trưởng thành, quan lớn (thời xưa)',
    hskLevel: 1,
    radical: '大',
    radicalMeaning: 'Bộ Đại',
    strokeCount: 5,
    decomposition: 'Ghép từ chữ Đại (大) và chữ Nhân (人)',
    mnemonic: 'Người (人) có tầm vóc và suy nghĩ chín chắn to lớn (大) là NGƯỜI LỚN (大人)',
    toneAnalysis: 'Thanh 4 (51) đập xuống nhanh rồi Thanh 2 (35) hất ngược lên: Nhịp điệu tương phản sinh động.',
    exampleSentence: {
      chinese: '大人应该给孩子树立好榜样。',
      pinyin: 'Dàren yīnggāi gěi háizi shùlì hǎo bǎngyàng.',
      vietnamese: 'Người lớn nên nêu gương tốt cho trẻ nhỏ.',
      sinoVietnamese: 'Đại nhân ưng cai cấp hài tử thụ lập hảo bảng dạng.',
    },
    relatedWords: [
      { hanzi: '成人', pinyin: 'chéngrén', sinoVietnamese: 'THÀNH NHÂN', vietnamese: 'Người thành niên' },
    ],
  },

  // 20. 水 (shuǐ) - Thanh 3
  {
    id: 'hsk1-20-shui',
    hanzi: '水',
    pinyin: 'shuǐ',
    pinyinNumbered: 'shui3',
    tone: 3,
    tones: [3],
    sinoVietnamese: 'THỦY',
    vietnameseMeaning: 'Nước, chất lỏng, sông suối',
    hskLevel: 1,
    radical: '水',
    radicalMeaning: 'Bộ Thủy (hình dòng nước uốn lượn đôi bờ có sóng nước vỗ)',
    strokeCount: 4,
    decomposition: 'Ở giữa là nét sổ móc đứng (dòng chảy chính), hai bên là các nét sóng nước phụ vỗ bờ',
    mnemonic: 'Dòng nước tuôn trào mềm mại nhu hòa nguồn sống của vạn vật (THỦY - 水)',
    toneAnalysis: 'Thanh 3 (214): Độ lượn sóng sâu sắc, mô phỏng như giọt nước chìm xuống lòng sông rồi dâng sóng.',
    exampleSentence: {
      chinese: '多喝水对身体健康很有好处。',
      pinyin: 'Duō hē shuǐ duì shēntǐ jiànkāng hěn yǒu hǎochu.',
      vietnamese: 'Uống nhiều nước rất có lợi cho sức khỏe.',
      sinoVietnamese: 'Đa hạt thủy đối thân thể kiện khang hấn hữu hảo xứ.',
    },
    relatedWords: [
      { hanzi: '水果', pinyin: 'shuǐguǒ', sinoVietnamese: 'THỦY QUẢ', vietnamese: 'Trái cây, hoa quả' },
      { hanzi: '开水', pinyin: 'kāishuǐ', sinoVietnamese: 'KHAI THỦY', vietnamese: 'Nước sôi' },
      { hanzi: '山水', pinyin: 'shānshuǐ', sinoVietnamese: 'SƠN THỦY', vietnamese: 'Non nước, phong cảnh sơn thủy' },
    ],
  },

  // 21. 心 (xīn) - Thanh 1
  {
    id: 'hsk2-21-xin',
    hanzi: '心',
    pinyin: 'xīn',
    pinyinNumbered: 'xin1',
    tone: 1,
    tones: [1],
    sinoVietnamese: 'TÂM',
    vietnameseMeaning: 'Trái tim, tâm hồn, tấm lòng, trung tâm',
    hskLevel: 2,
    radical: '心',
    radicalMeaning: 'Bộ Tâm (hình quả tim với cuống tim và các giọt máu)',
    strokeCount: 4,
    decomposition: 'Hình quả tim với 4 nét: một nét chấm trái, một nét nằm cong móc, hai nét chấm giữa và phải',
    mnemonic: 'Trái tim chân thành là nguồn cội của tình cảm và đạo lý con người (TÂM - 心)',
    toneAnalysis: 'Thanh 1 (55): Giữ cao độ thảnh thơi, trong sáng và tĩnh lặng như hồ nước phẳng lặng.',
    exampleSentence: {
      chinese: '做事只要用心，就一定能成功。',
      pinyin: 'Zuòshì zhǐyào yòngxīn, jiù yídìng néng chénggōng.',
      vietnamese: 'Làm việc chỉ cần để tâm, nhất định sẽ thành công.',
      sinoVietnamese: 'Tố sự chỉ yếu dụng tâm, tựu nhất định năng thành công.',
    },
    relatedWords: [
      { hanzi: '爱心', pinyin: 'àixīn', sinoVietnamese: 'ÁI TÂM', vietnamese: 'Lòng nhân ái' },
      { hanzi: '心情', pinyin: 'xīnqíng', sinoVietnamese: 'TÂM TÌNH', vietnamese: 'Tâm trạng' },
      { hanzi: '小心', pinyin: 'xiǎoxīn', sinoVietnamese: 'TIỂU TÂM', vietnamese: 'Cẩn thận' },
    ],
  },

  // 22. 安心 (ān xīn) - Thanh 1 + 1
  {
    id: 'hsk2-22-anxin',
    hanzi: '安心',
    pinyin: 'ān xīn',
    pinyinNumbered: 'an1 xin1',
    tone: 1,
    tones: [1, 1],
    sinoVietnamese: 'AN TÂM',
    vietnameseMeaning: 'Yên tâm, thanh thản, an lòng',
    hskLevel: 2,
    radical: '宀',
    radicalMeaning: 'Bộ Miên (mái ấm an bình)',
    strokeCount: 10,
    decomposition: 'Ghép từ chữ An (安: dưới mái nhà có người phụ nữ bình yên) và Tâm (心: cõi lòng)',
    mnemonic: 'Tâm hồn tĩnh tại dưới mái ấm bình an chính là AN TÂM (安心)',
    toneAnalysis: 'Hai Thanh 1 liền kề (55 + 55): Ngân dài phẳng lặng tuyệt đối, mang lại cảm giác bình an.',
    exampleSentence: {
      chinese: '你放心，有大家在一起你可以安心工作。',
      pinyin: 'Nǐ fàngxīn, yǒu dàjiā zài yìqǐ nǐ kěyǐ ānxīn gōngzuò.',
      vietnamese: 'Bạn hãy yên tâm, có mọi người ở bên bạn có thể an tâm công tác.',
      sinoVietnamese: 'Nhĩ phóng tâm, hữu đại gia tại nhất khởi nhĩ khả dĩ an tâm công tác.',
    },
    relatedWords: [
      { hanzi: '安全', pinyin: 'ānquán', sinoVietnamese: 'AN TOÀN', vietnamese: 'An toàn' },
      { hanzi: '平安', pinyin: 'píng\'ān', sinoVietnamese: 'BÌNH AN', vietnamese: 'Bình an' },
    ],
  },

  // 23. 话 (huà) - Thanh 4
  {
    id: 'hsk1-23-hua',
    hanzi: '话',
    pinyin: 'huà',
    pinyinNumbered: 'hua4',
    tone: 4,
    tones: [4],
    sinoVietnamese: 'THOẠI',
    vietnameseMeaning: 'Lời nói, câu chuyện, đàm thoại',
    hskLevel: 1,
    radical: '讠',
    radicalMeaning: 'Bộ Ngôn (lời nói phát ra từ miệng)',
    strokeCount: 8,
    decomposition: 'Bên trái là bộ Ngôn (讠), bên phải là chữ Thiệt (舌 - cái lưỡi uốn lượn)',
    mnemonic: 'Lời nói (讠) uốn lượn qua chiếc lưỡi (舌) thốt ra thành lời đàm THOẠI (话)',
    toneAnalysis: 'Thanh 4 (51): Điểm cao dốc mạnh xuống đáy nhanh gọn.',
    exampleSentence: {
      chinese: '他说的话非常有道理。',
      pinyin: 'Tā shuō de huà fēicháng yǒu dàolǐ.',
      vietnamese: 'Lời nói của anh ấy vô cùng có lý.',
      sinoVietnamese: 'Tha thuyết đích thoại phi thường hữu đạo lý.',
    },
    relatedWords: [
      { hanzi: '说话', pinyin: 'shuōhuà', sinoVietnamese: 'THUYẾT THOẠI', vietnamese: 'Nói chuyện' },
      { hanzi: '电话', pinyin: 'diànhuà', sinoVietnamese: 'ĐIỆN THOẠI', vietnamese: 'Điện thoại' },
      { hanzi: '笑话', pinyin: 'xiàohuà', sinoVietnamese: 'TIẾU THOẠI', vietnamese: 'Chuyện cười' },
    ],
  },

  // 24. 电话 (diàn huà) - Thanh 4 + 4
  {
    id: 'hsk1-24-dianhua',
    hanzi: '电话',
    pinyin: 'diàn huà',
    pinyinNumbered: 'dian4 hua4',
    tone: 4,
    tones: [4, 4],
    sinoVietnamese: 'ĐIỆN THOẠI',
    vietnameseMeaning: 'Máy điện thoại, cuộc gọi điện thoại',
    hskLevel: 1,
    radical: '田',
    radicalMeaning: 'Bộ Điền trong chữ Điện (diện tích tia chớp đánh qua cánh đồng)',
    strokeCount: 13,
    decomposition: 'Ghép từ Điện (电: dòng điện, tia chớp) và Thoại (话: lời nói)',
    mnemonic: 'Truyền lời nói (THOẠI) qua sóng dòng điện (ĐIỆN) là thiết bị ĐIỆN THOẠI (电话)',
    toneAnalysis: 'Hai Thanh 4 liền kề (51 + 51): Mỗi âm tiết đều rơi dứt khoát, âm vực mạnh mẽ dứt điểm.',
    exampleSentence: {
      chinese: '请给我打个电话。',
      pinyin: 'Qǐng gěi wǒ dǎ gè diànhuà.',
      vietnamese: 'Xin hãy gọi cho tôi một cuộc điện thoại.',
      sinoVietnamese: 'Thỉnh cấp ngã đả cá điện thoại.',
    },
    relatedWords: [
      { hanzi: '手机', pinyin: 'shǒujī', sinoVietnamese: 'THỦ CƠ', vietnamese: 'Điện thoại di động' },
      { hanzi: '电脑', pinyin: 'diànnǎo', sinoVietnamese: 'ĐIỆN NÃO', vietnamese: 'Máy tính' },
    ],
  },

  // 25. 书 (shū) - Thanh 1
  {
    id: 'hsk1-25-shu',
    hanzi: '书',
    pinyin: 'shū',
    pinyinNumbered: 'shu1',
    tone: 1,
    tones: [1],
    sinoVietnamese: 'THƯ',
    vietnameseMeaning: 'Sách, văn thư, viết chữ',
    hskLevel: 1,
    radical: '乛',
    radicalMeaning: 'Nét gấp móc biểu thị tập sách cuốn lại',
    strokeCount: 4,
    decomposition: 'Chữ giản thể của chữ Thư (書 - tay cầm bút ghi chép lên thẻ tre)',
    mnemonic: 'Bàn tay nắn nót ghi lại tri thức vạn đời vào tập SÁCH (THƯ - 书)',
    toneAnalysis: 'Thanh 1 (55): Âm vực cao và dài, thanh thoát tao nhã.',
    exampleSentence: {
      chinese: '多读书可以开阔我们的眼界。',
      pinyin: 'Duō dú shū kěyǐ kāikuò wǒmen de yǎnjiè.',
      vietnamese: 'Đọc nhiều sách có thể mở rộng tầm mắt của chúng ta.',
      sinoVietnamese: 'Đa độc thư khả dĩ khai khoát ngã môn đích nhãn giới.',
    },
    relatedWords: [
      { hanzi: '看书', pinyin: 'kànshū', sinoVietnamese: 'KHÁN THƯ', vietnamese: 'Đọc sách' },
      { hanzi: '书法', pinyin: 'shūfǎ', sinoVietnamese: 'THƯ PHÁP', vietnamese: 'Nghệ thuật thư pháp' },
      { hanzi: '图书馆', pinyin: 'túshūguǎn', sinoVietnamese: 'ĐỒ THƯ QUÁN', vietnamese: 'Thư viện' },
    ],
  },

  // 26. 友 (yǒu) - Thanh 3
  {
    id: 'hsk1-26-you',
    hanzi: '友',
    pinyin: 'yǒu',
    pinyinNumbered: 'you3',
    tone: 3,
    tones: [3],
    sinoVietnamese: 'HỮU',
    vietnameseMeaning: 'Bạn bè, thân thiết, kết bạn',
    hskLevel: 1,
    radical: '又',
    radicalMeaning: 'Bộ Hựu (bàn tay phải bắt chặt lấy nhau)',
    strokeCount: 4,
    decomposition: 'Hình ảnh hai bàn tay nắm chặt tương trợ lẫn nhau giữa đường đời',
    mnemonic: 'Hai bàn tay cùng nắm chặt nâng đỡ nhau chính là Tình BẠN (HỮU - 友)',
    toneAnalysis: 'Thanh 3 (214): Âm thanh uốn cong trầm bổng thể hiện chiều sâu gắn bó.',
    exampleSentence: {
      chinese: '海内存知己，天涯若比邻。',
      pinyin: 'Hǎi nèi cún zhījǐ, tiānyá ruò bǐlín.',
      vietnamese: 'Trong bốn bể có bạn tri kỷ, chân trời xa cũng hóa cận kề.',
      sinoVietnamese: 'Hải nội tồn tri kỷ, thiên nhai nhược bỉ lân.',
    },
    relatedWords: [
      { hanzi: '友情', pinyin: 'yǒuqíng', sinoVietnamese: 'HỮU TÌNH', vietnamese: 'Tình bạn' },
      { hanzi: '战友', pinyin: 'zhànyǒu', sinoVietnamese: 'CHIẾN HỮU', vietnamese: 'Đồng đội' },
    ],
  },

  // 27. 朋友 (péng you) - Thanh 2 + 5 (Khinh thanh)
  {
    id: 'hsk1-27-pengyou',
    hanzi: '朋友',
    pinyin: 'péng you',
    pinyinNumbered: 'peng2 you5',
    tone: 2,
    tones: [2, 5],
    sinoVietnamese: 'BẰNG HỮU',
    vietnameseMeaning: 'Bạn bè, chiến hữu thân thiết',
    hskLevel: 1,
    radical: '月',
    radicalMeaning: 'Bộ Nguyệt trong chữ Bằng (hai chuỗi ngọc sáng song hành)',
    strokeCount: 12,
    decomposition: 'Ghép từ chữ Bằng (朋: hai chuỗi sò ngọc quý giá) và Hữu (友: bàn tay bè bạn)',
    mnemonic: 'Bạn bè quý báu như hai chuỗi ngọc sáng (BẰNG) cùng nắm tay nhau (HỮU) -> BẰNG HỮU (朋友)',
    toneAnalysis: 'Âm tiết thứ hai đọc thành Khinh thanh (neutral tone): Ngắn gọn, nhẹ nhàng nương theo thanh 2 phía trước.',
    exampleSentence: {
      chinese: '有朋自远方来，不亦乐乎。',
      pinyin: 'Yǒu péng zì yuǎnfāng lái, bù yì lè hū.',
      vietnamese: 'Có bạn hiền từ nơi xa xôi tới thăm, chẳng phải vui lắm sao.',
      sinoVietnamese: 'Hữu bằng tự viễn phương lai, bất diệc lạc hồ.',
    },
    relatedWords: [
      { hanzi: '老朋友', pinyin: 'lǎopéngyou', sinoVietnamese: 'LÃO BẰNG HỮU', vietnamese: 'Bạn cũ' },
      { hanzi: '好朋友', pinyin: 'hǎopéngyou', sinoVietnamese: 'HẢO BẰNG HỮU', vietnamese: 'Bạn tốt' },
    ],
  },

  // 28. 气 (qì) - Thanh 4
  {
    id: 'hsk1-28-qi',
    hanzi: '气',
    pinyin: 'qì',
    pinyinNumbered: 'qi4',
    tone: 4,
    tones: [4],
    sinoVietnamese: 'KHÍ',
    vietnameseMeaning: 'Không khí, khí phách, thời tiết, hơi thở',
    hskLevel: 1,
    radical: '气',
    radicalMeaning: 'Bộ Khí (hình luồng hơi nước bốc lên cuồn cuộn)',
    strokeCount: 4,
    decomposition: 'Các nét phẩy ngang uốn lượn biểu trưng cho làn khói, mây và dưỡng khí bay lên',
    mnemonic: 'Làn sương khói bay lên mang nguồn năng lượng vũ trụ gọi là KHÍ (气)',
    toneAnalysis: 'Thanh 4 (51): Dứt khoát, âm vực phóng ra như một luồng khí nén thoát ra ngoài.',
    exampleSentence: {
      chinese: '清晨的空气非常清新。',
      pinyin: 'Qīngchén de kōngqì fēicháng qīngxīn.',
      vietnamese: 'Không khí buổi sáng sớm vô cùng trong lành.',
      sinoVietnamese: 'Thanh thần đích không khí phi thường thanh tân.',
    },
    relatedWords: [
      { hanzi: '空气', pinyin: 'kōngqì', sinoVietnamese: 'KHÔNG KHÍ', vietnamese: 'Không khí' },
      { hanzi: '客气', pinyin: 'kèqi', sinoVietnamese: 'KHÁCH KHÍ', vietnamese: 'Khách sáo, lịch thiệp' },
      { hanzi: '勇气', pinyin: 'yǒngqì', sinoVietnamese: 'DŨNG KHÍ', vietnamese: 'Lòng dũng cảm' },
    ],
  },

  // 29. 天气 (tiān qì) - Thanh 1 + 4
  {
    id: 'hsk1-29-tianqi',
    hanzi: '天气',
    pinyin: 'tiān qì',
    pinyinNumbered: 'tian1 qi4',
    tone: 1,
    tones: [1, 4],
    sinoVietnamese: 'THIÊN KHÍ',
    vietnameseMeaning: 'Thời tiết, khí hậu trong ngày',
    hskLevel: 1,
    radical: '大',
    radicalMeaning: 'Bộ Đại trong chữ Thiên',
    strokeCount: 8,
    decomposition: 'Ghép từ Trời (天 - Thiên) và Khí trời (气 - Khí)',
    mnemonic: 'Trời (THIÊN) và Luồng không khí biến chuyển (KHÍ) tạo nên THỜI TIẾT (天气)',
    toneAnalysis: 'Thanh 1 (55) bay bổng cao vút tiếp ngay Thanh 4 (51) rơi dốc dứt khoát: Nhịp độ uyển chuyển.',
    exampleSentence: {
      chinese: '今天天气晴朗，非常适合外出散步。',
      pinyin: 'Jīntiān tiānqì qínglǎng, fēicháng shìhé wàichū sànbù.',
      vietnamese: 'Hôm nay thời tiết nắng ráo, rất thích hợp đi dạo ngoài trời.',
      sinoVietnamese: 'Kim thiên thiên khí tình lãng, phi thường thích hợp ngoại xuất tản bộ.',
    },
    relatedWords: [
      { hanzi: '天气预报', pinyin: 'tiānqì yùbào', sinoVietnamese: 'THIÊN KHÍ DỰ BÁO', vietnamese: 'Dự báo thời tiết' },
      { hanzi: '气候', pinyin: 'qìhòu', sinoVietnamese: 'KHÍ HẬU', vietnamese: 'Khí hậu' },
    ],
  },

  // 30. 韵律 (yùn lǜ) - Thanh 4 + 4 (Từ đại diện thương hiệu HanziVibe - 汉字韵)
  {
    id: 'hsk3-30-yunlv',
    hanzi: '韵律',
    pinyin: 'yùn lǜ',
    pinyinNumbered: 'yun4 lv4',
    tone: 4,
    tones: [4, 4],
    sinoVietnamese: 'VẬN LUẬT',
    vietnameseMeaning: 'Vần điệu, giai điệu, tiết tấu âm hưởng (cội nguồn HanziVibe - 汉字韵)',
    hskLevel: 3,
    radical: '音',
    radicalMeaning: 'Bộ Âm (âm thanh, giai điệu, tiếng đàn ngân nga)',
    strokeCount: 22,
    decomposition: 'Chữ Vận (韵 gồm bộ Âm 音 và chữ Quân 匀) kết hợp chữ Luật (律 gồm bộ Xích 彳 và chữ Duật 聿)',
    mnemonic: 'Sự cân bằng đều đặn (匀) của Âm thanh (音) hòa trong Tiết nhịp (律) tạo nên VẬN LUẬT (韵律)',
    toneAnalysis: 'Hai Thanh 4 liền kề (51 + 51): Mạnh mẽ, sắc sảo, tượng trưng cho sự dứt khoát của công nghệ âm học hiện đại.',
    exampleSentence: {
      chinese: '汉语的四个声调充满了独特的音乐韵律。',
      pinyin: 'Hànyǔ de sì gè shēngdiào chōngmǎn le dútè de yīnyuè yùnlǜ.',
      vietnamese: 'Bốn thanh điệu của tiếng Trung tràn đầy giai điệu và vận luật âm nhạc độc đáo.',
      sinoVietnamese: 'Hán ngữ đích tứ cá thanh điệu sung mãn liễu độc đặc đích âm nhạc vận luật.',
    },
    relatedWords: [
      { hanzi: '韵味', pinyin: 'yùnwèi', sinoVietnamese: 'VẬN VỊ', vietnamese: 'Ý vị sâu sắc, phong vị tao nhã' },
      { hanzi: '音律', pinyin: 'yīnlǜ', sinoVietnamese: 'ÂM LUẬT', vietnamese: 'Âm luật âm nhạc' },
      { hanzi: '规律', pinyin: 'guīlǜ', sinoVietnamese: 'QUY LUẬT', vietnamese: 'Quy luật tự nhiên' },
    ],
  },
];

/**
 * Chuẩn hóa Pinyin loại bỏ dấu thanh để hỗ trợ tìm kiếm không dấu
 * Thay thế biến thể umlaut [üǖǘǚǜ] thành 'v' TRƯỚC khi gọi normalize('NFD')
 * để không bị tách dấu diaeresis thành 'u' thường
 */
export function normalizePinyin(pinyin: string): string {
  if (!pinyin) return '';
  return pinyin
    .replace(/[üǖǘǚǜ]/gi, 'v')
    .replace(/u\u0308/gi, 'v')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Chuẩn hóa chuỗi tiếng Việt: loại bỏ dấu thanh, chuyển đ/Đ thành d và chuyển thành chữ thường
 */
export function normalizeVietnamese(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}

/**
 * Các hàm tiện ích tra cứu kho dữ liệu HSK
 */
export function getHskWordById(id: string): HskWord | undefined {
  return HSK_CURRICULUM.find((w) => w.id === id);
}

export function getHskWordsByTone(tone: 1 | 2 | 3 | 4 | 5): HskWord[] {
  return HSK_CURRICULUM.filter((w) => w.tone === tone || w.tones.includes(tone));
}

export function getHskWordsByLevel(level: 1 | 2 | 3): HskWord[] {
  return HSK_CURRICULUM.filter((w) => w.hskLevel === level);
}

export function searchHskWords(keyword: string): HskWord[] {
  if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
    return HSK_CURRICULUM;
  }
  const kw = keyword.toLowerCase().trim();
  const kwNoSpace = kw.replace(/\s+/g, '');
  const kwNormalized = normalizePinyin(kw);
  const kwNormNoSpace = kwNormalized.replace(/\s+/g, '');
  const kwVi = normalizeVietnamese(kw);
  const kwViNoSpace = kwVi.replace(/\s+/g, '');

  // Kiểm tra xem từ khóa người dùng nhập có chứa dấu tiếng Việt hay không
  // Nếu normalizeVietnamese(kw) === kw thì người dùng đang tìm kiếm không dấu (ví dụ: 'hoc', 'ban')
  // Nếu có dấu (ví dụ: 'học' hoặc 'hóc'), chỉ so khớp chính xác có dấu để tránh tìm nhầm 'hóc' thành 'học'
  const isUnaccentedVi = kwVi === kw;

  return HSK_CURRICULUM.filter((w) => {
    const rawPinyin = w.pinyin.toLowerCase();
    const rawPinyinNoSpace = rawPinyin.replace(/\s+/g, '');
    const cleanPinyin = normalizePinyin(w.pinyin);
    const cleanPinyinNoSpace = cleanPinyin.replace(/\s+/g, '');
    const numbered = w.pinyinNumbered.toLowerCase();
    const numberedNoSpace = numbered.replace(/\s+/g, '');

    const svRaw = w.sinoVietnamese.toLowerCase();
    const svRawNoSpace = svRaw.replace(/\s+/g, '');
    const svNorm = normalizeVietnamese(w.sinoVietnamese);
    const svNormNoSpace = svNorm.replace(/\s+/g, '');

    const viRaw = w.vietnameseMeaning.toLowerCase();
    const viRawNoSpace = viRaw.replace(/\s+/g, '');
    const viNorm = normalizeVietnamese(w.vietnameseMeaning);
    const viNormNoSpace = viNorm.replace(/\s+/g, '');

    // Khớp theo chữ Hán
    if (w.hanzi.includes(kw) || w.hanzi.includes(kwNoSpace)) {
      return true;
    }

    // Khớp theo Pinyin (có dấu, không dấu, hoặc số thứ tự thanh điệu, có hoặc không có khoảng trắng)
    if (
      rawPinyin.includes(kw) ||
      rawPinyinNoSpace.includes(kwNoSpace) ||
      cleanPinyin.includes(kwNormalized) ||
      cleanPinyinNoSpace.includes(kwNormNoSpace) ||
      numbered.includes(kw) ||
      numberedNoSpace.includes(kwNoSpace)
    ) {
      return true;
    }

    // Khớp theo âm Hán - Việt và Nghĩa tiếng Việt
    if (isUnaccentedVi) {
      if (
        svNorm.includes(kwVi) ||
        svNormNoSpace.includes(kwViNoSpace) ||
        viNorm.includes(kwVi) ||
        viNormNoSpace.includes(kwViNoSpace)
      ) {
        return true;
      }
    } else {
      if (
        svRaw.includes(kw) ||
        svRawNoSpace.includes(kwNoSpace) ||
        viRaw.includes(kw) ||
        viRawNoSpace.includes(kwNoSpace)
      ) {
        return true;
      }
    }

    return false;
  });
}


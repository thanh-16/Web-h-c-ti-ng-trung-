/**
 * hskLessons.ts
 * Kho giáo trình 8 Bài Học Đa Chủ Đề HSK 1-2 chính quy của HanziVibe (汉字韵)
 * Tích hợp đầy đủ:
 * - Ngữ cảnh giao tiếp thực tế
 * - Đoạn đối thoại 2 chiều (Dialogue A - B)
 * - Bài đọc hiểu văn bản ngắn (Graded Reading Story)
 * - Điểm ngữ pháp then chốt kèm công thức & ví dụ
 * - Từ vựng trọng tâm liên kết với kho 4 tầng Hán - Việt
 * 100% Authentic Data - Chuẩn mực sư phạm quốc tế
 */

import { HskLesson } from '@/types/lesson';

export const HSK_LESSONS: HskLesson[] = [
  // ==========================================
  // BÀI 1: CHÀO HỎI & LÀM QUEN
  // ==========================================
  {
    id: 'lesson-01-greeting',
    title: 'Bài 1: Chào Hỏi & Làm Quen Bạn Mới',
    chineseTitle: '第一课：问候与相识',
    level: 'HSK 1',
    category: 'Chào hỏi & Xã giao',
    icon: '👋',
    description: 'Học cách chào hỏi lịch sự, hỏi tên tuổi, quốc tịch và bày tỏ niềm vui khi kết bạn mới.',
    dialogue: [
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '你好！请问你叫什么名字？',
        pinyin: 'Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?',
        sinoVietnamese: 'Nhĩ hảo! Thỉnh vấn nhĩ khiếu thập ma danh tự?',
        vietnamese: 'Xin chào! Xin hỏi bạn tên là gì?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '你好！我叫小明。你是哪国人？',
        pinyin: 'Nǐ hǎo! Wǒ jiào Xiǎomíng. Nǐ shì nǎ guó rén?',
        sinoVietnamese: 'Nhĩ hảo! Ngã khiếu Tiểu Minh. Nhĩ thị nã quốc nhân?',
        vietnamese: 'Chào bạn! Mình tên là Tiểu Minh. Bạn là người nước nào?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我是美国人，我在大学学习汉语。你呢？',
        pinyin: 'Wǒ shì Měiguó rén, wǒ zài dàxué xuéxí Hànyǔ. Nǐ ne?',
        sinoVietnamese: 'Ngã thị Mỹ Quốc nhân, ngã tại đại học học tập Hán ngữ. Nhĩ ni?',
        vietnamese: 'Mình là người Mỹ, mình học tiếng Trung ở trường đại học. Còn bạn?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '我是中国人。很高兴认识你！',
        pinyin: 'Wǒ shì Zhōngguó rén. Hěn gāoxìng rènshi nǐ!',
        sinoVietnamese: 'Ngã thị Trung Quốc nhân. Hấn cao hứng nhận thức nhĩ!',
        vietnamese: 'Mình là người Trung Quốc. Rất vui được làm quen với bạn!',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '认识你我也很高兴！',
        pinyin: 'Rènshi nǐ wǒ yě hěn gāoxìng!',
        sinoVietnamese: 'Nhận thức nhĩ ngã dã hấn cao hứng!',
        vietnamese: 'Quen biết bạn mình cũng rất vui!',
      },
    ],
    readingStory: {
      title: 'Bạn Mới Ở Đại Học (大学里的新朋友)',
      content:
        '我叫大卫，我是美国人。我在北京的大学学习汉语。我的汉语老师是中国人，她叫王老师。王老师非常好，常常帮助我们。今天我认识了一个新朋友，他叫小明。很高兴认识他！',
      pinyin:
        'Wǒ jiào Dàwèi, wǒ shì Měiguó rén. Wǒ zài Běijīng de dàxué xuéxí Hànyǔ. Wǒ de Hànyǔ lǎoshī shì Zhōngguó rén, tā jiào Wáng lǎoshī. Wáng lǎoshī fēicháng hǎo, chángcháng bāngzhù wǒmen. Jīntiān wǒ rènshi le yí gè xīn péngyou, tā jiào Xiǎomíng. Hěn gāoxìng rènshi tā!',
      vietnamese:
        'Tôi tên là Đại Vệ, tôi là người Mỹ. Tôi học tiếng Trung tại một trường đại học ở Bắc Kinh. Cô giáo dạy tiếng Trung của tôi là người Trung Quốc, cô tên là cô Vương. Cô Vương rất tốt, thường xuyên giúp đỡ chúng tôi. Hôm nay tôi đã làm quen được một người bạn mới tên là Tiểu Minh. Rất vui được quen biết cậu ấy!',
    },
    grammarPoints: [
      {
        title: 'Câu phán đoán với chữ 是 (shì - là)',
        structure: 'Chủ ngữ + 是 + Danh từ/Cụm danh từ',
        explanation: 'Dùng để khẳng định thân phận, nghề nghiệp hoặc quốc tịch, tương đương với động từ "to be" trong tiếng Anh hoặc "là" trong tiếng Việt.',
        examples: [
          { chinese: '我是中国人。', pinyin: 'Wǒ shì Zhōngguó rén.', vietnamese: 'Tôi là người Trung Quốc.' },
          { chinese: '她是我的老师。', pinyin: 'Tā shì wǒ de lǎoshī.', vietnamese: 'Cô ấy là giáo viên của tôi.' },
        ],
      },
      {
        title: 'Câu hỏi đại từ nghi vấn 什么 (shénme - cái gì)',
        structure: 'Chủ ngữ + Động từ + 什么 (+ Danh từ)?',
        explanation: 'Dùng để hỏi thông tin về sự vật, tên gọi. Trật tự từ giữ nguyên như câu trần thuật.',
        examples: [
          { chinese: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', vietnamese: 'Bạn tên là gì?' },
          { chinese: '这是什么书？', pinyin: 'Zhè shì shénme shū?', vietnamese: 'Đây là sách gì?' },
        ],
      },
    ],
    vocabulary: [
      { hanzi: '你好', pinyin: 'nǐ hǎo', sinoVietnamese: 'NHĨ HẢO', vietnamese: 'Xin chào' },
      { hanzi: '名字', pinyin: 'míngzi', sinoVietnamese: 'DANH TỰ', vietnamese: 'Tên, họ tên' },
      { hanzi: '哪', pinyin: 'nǎ', sinoVietnamese: 'NÃ', vietnamese: 'Nào, đâu' },
      { hanzi: '国', pinyin: 'guó', sinoVietnamese: 'QUỐC', vietnamese: 'Đất nước, quốc gia' },
      { hanzi: '人', pinyin: 'rén', sinoVietnamese: 'NHÂN', vietnamese: 'Người' },
      { hanzi: '认识', pinyin: 'rènshi', sinoVietnamese: 'NHẬN THỨC', vietnamese: 'Làm quen, nhận biết' },
      { hanzi: '高兴', pinyin: 'gāoxìng', sinoVietnamese: 'CAO HỨNG', vietnamese: 'Vui vẻ, phấn khởi' },
    ],
  },

  // ==========================================
  // BÀI 2: GIA ĐÌNH & NGƯỜI THÂN
  // ==========================================
  {
    id: 'lesson-02-family',
    title: 'Bài 2: Gia Đình & Người Thân',
    chineseTitle: '第二课：家庭与亲人',
    level: 'HSK 1',
    category: 'Gia đình & Đời sống',
    icon: '👨‍👩‍👦',
    description: 'Học cách giới thiệu về các thành viên trong gia đình, đếm số lượng người và nói về nghề nghiệp.',
    dialogue: [
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '大卫，你家有几口人？',
        pinyin: 'Dàwèi, nǐ jiā yǒu jǐ kǒu rén?',
        sinoVietnamese: 'Đại Vệ, nhĩ gia hữu kỷ khẩu nhân?',
        vietnamese: 'Đại Vệ, nhà bạn có mấy người?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我家有四口人：爸爸、妈妈、一个妹妹和我。你家呢？',
        pinyin: 'Wǒ jiā yǒu sì kǒu rén: bàba, māma, yí gè mèimei hé wǒ. Nǐ jiā ne?',
        sinoVietnamese: 'Ngã gia hữu tứ khẩu nhân: ba ba, ma ma, nhất cá muội muội hòa ngã. Nhĩ gia ni?',
        vietnamese: 'Nhà mình có 4 người: bố, mẹ, một em gái và mình. Còn nhà bạn?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '我家有三口人。我爸爸是医生，我妈妈是老师。',
        pinyin: 'Wǒ jiā yǒu sān kǒu rén. Wǒ bàba shì yīshēng, wǒ māma shì lǎoshī.',
        sinoVietnamese: 'Ngã gia hữu tam khẩu nhân. Ngã ba ba thị y sinh, ngã ma ma thị lão sư.',
        vietnamese: 'Nhà mình có 3 người. Bố mình là bác sĩ, mẹ mình là giáo viên.',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '你妹妹多大了？',
        pinyin: 'Nǐ mèimei duō dà le?',
        sinoVietnamese: 'Nhĩ muội muội đa đại liễu?',
        vietnamese: 'Em gái bạn bao nhiêu tuổi rồi?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '她今年十岁，是一个小学生。',
        pinyin: 'Tā jīnnián shí suì, shì yí gè xiǎoxuéshēng.',
        sinoVietnamese: 'Tha kim niên thập tuế, thị nhất cá tiểu học sinh.',
        vietnamese: 'Em ấy năm nay 10 tuổi, là học sinh tiểu học.',
      },
    ],
    readingStory: {
      title: 'Gia Đình Ấm Áp Của Tôi (我的幸福家庭)',
      content:
        '我有一个幸福的家。我家有四口人。爸爸工作很忙，但他常常带我们去公园。妈妈做饭非常好吃。我有一个可爱的妹妹，她今年十岁，喜欢看书和画画。我很爱我的家人。',
      pinyin:
        'Wǒ yǒu yí gè xìngfú de jiā. Wǒ jiā yǒu sì kǒu rén. Bàba gōngzuò hěn máng, dàn tā chángcháng dài wǒmen qù gōngyuán. Māma zuòfàn fēicháng hǎochī. Wǒ yǒu yí gè kě\'ài de mèimei, tā jīnnián shí suì, xǐhuan kànshū hé huàhuà. Wǒ hěn ài wǒ de jiārén.',
      vietnamese:
        'Tôi có một gia đình hạnh phúc. Nhà tôi có 4 người. Bố tôi công việc rất bận nhưng thường xuyên dẫn chúng tôi đi công viên. Mẹ tôi nấu ăn rất ngon. Tôi có một cô em gái đáng yêu, em 10 tuổi, thích đọc sách và vẽ tranh. Tôi rất yêu gia đình của mình.',
    },
    grammarPoints: [
      {
        title: 'Động từ sở hữu 有 (yǒu - có) & Phủ định 没有 (méiyǒu)',
        structure: 'Chủ ngữ + 有 / 没有 + Danh từ',
        explanation: 'Biểu thị sự sở hữu hoặc tồn tại. Chú ý: Phủ định của "有" bắt buộc dùng "没", TUYỆT ĐỐI không dùng "不".',
        examples: [
          { chinese: '我家有四口人。', pinyin: 'Wǒ jiā yǒu sì kǒu rén.', vietnamese: 'Nhà tôi có 4 người.' },
          { chinese: '我没有哥哥。', pinyin: 'Wǒ méiyǒu gēge.', vietnamese: 'Tôi không có anh trai.' },
        ],
      },
      {
        title: 'Lượng từ khẩu 口 (kǒu) dùng cho nhân khẩu gia đình',
        structure: 'Số từ + 口 + 人',
        explanation: 'Dùng chuyên biệt để đếm số lượng thành viên trong một gia đình (khẩu = miệng ăn).',
        examples: [
          { chinese: '你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', vietnamese: 'Nhà bạn có mấy người?' },
          { chinese: '三口人', pinyin: 'sān kǒu rén', vietnamese: 'Ba người' },
        ],
      },
    ],
    vocabulary: [
      { hanzi: '家', pinyin: 'jiā', sinoVietnamese: 'GIA', vietnamese: 'Nhà, gia đình' },
      { hanzi: '有', pinyin: 'yǒu', sinoVietnamese: 'HỮU', vietnamese: 'Có' },
      { hanzi: '几', pinyin: 'jǐ', sinoVietnamese: 'KỶ', vietnamese: 'Mấy (dưới 10)' },
      { hanzi: '爸爸', pinyin: 'bàba', sinoVietnamese: 'BA BA', vietnamese: 'Bố, cha' },
      { hanzi: '妈妈', pinyin: 'māma', sinoVietnamese: 'MA MA', vietnamese: 'Mẹ' },
      { hanzi: '爱', pinyin: 'ài', sinoVietnamese: 'ÁI', vietnamese: 'Yêu, yêu thương' },
    ],
  },

  // ==========================================
  // BÀI 3: ẨM THỰC & GỌI MÓN TẠI NHÀ HÀNG
  // ==========================================
  {
    id: 'lesson-03-food',
    title: 'Bài 3: Ẩm Thực & Gọi Món Tại Nhà Hàng',
    chineseTitle: '第三课：美食与餐厅点餐',
    level: 'HSK 1',
    category: 'Ẩm thực & Nhà hàng',
    icon: '🍜',
    description: 'Học cách gọi món, gọi đồ uống, bày tỏ sở thích ăn uống và khen món ăn ngon.',
    dialogue: [
      {
        speaker: 'Phục vụ (服务员)',
        chinese: '下午好！请问二位想吃什么？',
        pinyin: 'Xiàwǔ hǎo! Qǐngwèn èr wèi xiǎng chī shénme?',
        sinoVietnamese: 'Hạ ngọ hảo! Thỉnh vấn nhị vị tưởng cật thập ma?',
        vietnamese: 'Chào buổi chiều! Xin hỏi hai vị muốn dùng món gì?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我想吃中国菜。小明，你想吃什么？',
        pinyin: 'Wǒ xiǎng chī Zhōngguó cài. Xiǎomíng, nǐ xiǎng chī shénme?',
        sinoVietnamese: 'Ngã tưởng cật Trung Quốc thái. Tiểu Minh, nhĩ tưởng cật thập ma?',
        vietnamese: 'Mình muốn ăn món Trung Quốc. Tiểu Minh, bạn muốn ăn gì?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '我们吃米饭和牛肉吧。服务员，请给我们两碗米饭。',
        pinyin: 'Wǒmen chī mǐfàn hé niúròu ba. Fúwùyuán, qǐng gěi wǒmen liǎng wǎn mǐfàn.',
        sinoVietnamese: 'Ngã môn cật mễ phạn hòa ngưu nhục ba. Phục vụ viên, thỉnh cấp ngã môn lưỡng oản mễ phạn.',
        vietnamese: 'Chúng mình ăn cơm và thịt bò nhé. Phục vụ ơi, cho chúng tôi hai bát cơm.',
      },
      {
        speaker: 'Phục vụ (服务员)',
        chinese: '好的。二位想喝什么饮料？',
        pinyin: 'Hǎo de. Èr wèi xiǎng hē shénme yǐnliào?',
        sinoVietnamese: 'Hảo đích. Nhị vị tưởng hát thập ma ẩm liệu?',
        vietnamese: 'Vâng ạ. Hai vị muốn uống nước gì?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我想喝一杯中国绿茶。小明，你喝水还是喝茶？',
        pinyin: 'Wǒ xiǎng hē yì bēi Zhōngguó lǜchá. Xiǎomíng, nǐ hē shuǐ háishì hē chá?',
        sinoVietnamese: 'Ngã tưởng hát nhất bôi Trung Quốc lục trà. Tiểu Minh, nhĩ hát thủy hoàn thị hát trà?',
        vietnamese: 'Tôi muốn uống một cốc trà xanh Trung Quốc. Tiểu Minh, bạn uống nước hay uống trà?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '我也喝茶。这里的茶太好喝了！',
        pinyin: 'Wǒ yě hē chá. Zhèlǐ de chá tài hǎohē le!',
        sinoVietnamese: 'Ngã dã hát trà. Giá lý đích trà thái hảo hát liễu!',
        vietnamese: 'Mình cũng uống trà. Trà ở đây ngon quá chừng!',
      },
    ],
    readingStory: {
      title: 'Bữa Tối Trung Hoa Đầu Tiên (第一顿中国晚餐)',
      content:
        '今天晚上，小明带我去一家很有名的中国餐厅吃饭。餐厅里人很多，非常热闹。我们点了米饭、牛肉、鱼和青菜。中国菜色香味俱全，太好吃了！我们还喝了热绿茶。我很喜欢中国的美食。',
      pinyin:
        'Jīntiān wǎnshang, Xiǎomíng dài wǒ qù yì jiā hěn yǒumíng de Zhōngguó cāntīng chīfàn. Cāntīng lǐ rén hěn duō, fēicháng rènào. Wǒmen diǎn le mǐfàn, niúròu, yú hé qīngcài. Zhōngguó cài sè xiāng wèi jù quán, tài hǎochī le! Wǒmen hái hē le rè lǜchá. Wǒ hěn xǐhuan Zhōngguó de měishí.',
      vietnamese:
        'Tối nay, Tiểu Minh đưa tôi đến một nhà hàng Trung Hoa rất nổi tiếng để dùng bữa. Trong nhà hàng có rất đông người, vô cùng náo nhiệt. Chúng tôi gọi cơm, thịt bò, cá và rau xanh. Món ăn Trung Quốc màu sắc, hương thơm và vị ngon đều tuyệt đỉnh, ngon quá chừng! Chúng tôi còn uống trà xanh nóng. Tôi rất yêu thích ẩm thực Trung Hoa.',
    },
    grammarPoints: [
      {
        title: 'Động từ năng nguyện 想 (xiǎng - muốn, dự định)',
        structure: 'Chủ ngữ + 想 + Động từ + Tân ngữ',
        explanation: 'Diễn đạt nguyện vọng, mong muốn chủ quan của người nói.',
        examples: [
          { chinese: '我想吃中国菜。', pinyin: 'Wǒ xiǎng chī Zhōngguó cài.', vietnamese: 'Tôi muốn ăn món Trung Quốc.' },
          { chinese: '你想喝什么？', pinyin: 'Nǐ xiǎng hē shénme?', vietnamese: 'Bạn muốn uống gì?' },
        ],
      },
      {
        title: 'Cấu trúc cảm thán 太……了 (tài... le - ...quá)',
        structure: '太 + Tính từ + 了！',
        explanation: 'Biểu thị sự ngợi khen, thán phục hoặc mức độ vượt bậc.',
        examples: [
          { chinese: '太好吃了！', pinyin: 'Tài hǎochī le!', vietnamese: 'Ngon quá chừng!' },
          { chinese: '太好了！', pinyin: 'Tài hǎo le!', vietnamese: 'Tốt quá rồi!' },
        ],
      },
    ],
    vocabulary: [
      { hanzi: '吃', pinyin: 'chī', sinoVietnamese: 'CẬT', vietnamese: 'Ăn' },
      { hanzi: '喝', pinyin: 'hē', sinoVietnamese: 'HÁT', vietnamese: 'Uống' },
      { hanzi: '茶', pinyin: 'chá', sinoVietnamese: 'TRÀ', vietnamese: 'Trà' },
      { hanzi: '水', pinyin: 'shuǐ', sinoVietnamese: 'THỦY', vietnamese: 'Nước' },
      { hanzi: '米饭', pinyin: 'mǐfàn', sinoVietnamese: 'MỄ PHẠN', vietnamese: 'Cơm' },
      { hanzi: '菜', pinyin: 'cài', sinoVietnamese: 'THÁI', vietnamese: 'Món ăn, rau' },
    ],
  },

  // ==========================================
  // BÀI 4: MUA SẮM & HỎI GIÁ TIỀN
  // ==========================================
  {
    id: 'lesson-04-shopping',
    title: 'Bài 4: Mua Sắm & Hỏi Giá Tiền',
    chineseTitle: '第四课：商店购物与问价',
    level: 'HSK 1',
    category: 'Mua sắm & Tiền tệ',
    icon: '🛍️',
    description: 'Học cách hỏi giá cả hàng hóa, mặc cả, đếm số tiền bằng đồng Nhân Dân Tệ (RMB/Tệ).',
    dialogue: [
      {
        speaker: 'Người bán (售货员)',
        chinese: '你好！你想买什么？',
        pinyin: 'Nǐ hǎo! Nǐ xiǎng mǎi shénme?',
        sinoVietnamese: 'Nhĩ hảo! Nhĩ tưởng mãi thập ma?',
        vietnamese: 'Xin chào! Bạn muốn mua gì?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我想买苹果。这个苹果多少钱一斤？',
        pinyin: 'Wǒ xiǎng mǎi píngguǒ. Zhège píngguǒ duōshao qián yì jīn?',
        sinoVietnamese: 'Ngã tưởng mãi bình quả. Giá cá bình quả đa thiểu tiền nhất cân?',
        vietnamese: 'Tôi muốn mua táo. Táo này bao nhiêu tiền một cân (500g)?',
      },
      {
        speaker: 'Người bán (售货员)',
        chinese: '三块钱一斤。',
        pinyin: 'Sān kuài qián yì jīn.',
        sinoVietnamese: 'Tam khối tiền nhất cân.',
        vietnamese: 'Ba tệ một cân.',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '太贵了！便宜一点儿吧。两块钱行吗？',
        pinyin: 'Tài guì le! Piányi yìdiǎnr ba. Liǎng kuài qián xíng ma?',
        sinoVietnamese: 'Thái quý liễu! Tiện nghi nhất điểm nhi ba. Lưỡng khối tiền hành ma?',
        vietnamese: 'Đắt quá! Bớt một chút đi. Hai tệ được không?',
      },
      {
        speaker: 'Người bán (售货员)',
        chinese: '两块五吧。你要多少斤？',
        pinyin: 'Liǎng kuài wǔ ba. Nǐ yào duōshao jīn?',
        sinoVietnamese: 'Lưỡng khối ngũ ba. Nhĩ yếu đa thiểu cân?',
        vietnamese: 'Hai tệ rưỡi nhé. Bạn muốn lấy bao nhiêu cân?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我要三斤，给你十块钱。',
        pinyin: 'Wǒ yào sān jīn, gěi nǐ shí kuài qián.',
        sinoVietnamese: 'Ngã yếu tam cân, cấp nhĩ thập khối tiền.',
        vietnamese: 'Tôi lấy ba cân, gửi bạn mười tệ.',
      },
      {
        speaker: 'Người bán (售货员)',
        chinese: '找你两块五。谢谢！',
        pinyin: 'Zhǎo nǐ liǎng kuài wǔ. Xièxie!',
        sinoVietnamese: 'Thao nhĩ lưỡng khối ngũ. Tạ tạ!',
        vietnamese: 'Thối lại bạn hai tệ rưỡi. Cảm ơn nhé!',
      },
    ],
    readingStory: {
      title: 'Đi Chợ Trái Cây (去水果市场)',
      content:
        '今天下午我和小明去学校附近的水果店买东西。那里的水果很多，有苹果、西瓜和香蕉。西瓜很甜，也很便宜，两块钱一斤。我们买了一个大西瓜，一共二十块钱。我们都很高兴。',
      pinyin:
        'Jīntiān xiàwǔ wǒ hé Xiǎomíng qù xuéxiào fùjìn de shuǐguǒdiàn mǎi dōngxi. Nàlǐ de shuǐguǒ hěn duō, yǒu píngguǒ, xīguā hé xiāngjiāo. Xīguā hěn tián, yě hěn piányi, liǎng kuài qián yì jīn. Wǒmen mǎi le yí gè dà xīguā, yígòng èrshí kuài qián. Wǒmen dōu hěn gāoxìng.',
      vietnamese:
        'Chiều nay tôi và Tiểu Minh đi đến tiệm trái cây gần trường để mua đồ. Hoa quả ở đó rất nhiều, có táo, dưa hấu và chuối. Dưa hấu rất ngọt mà cũng rất rẻ, chỉ hai tệ một cân. Chúng tôi đã mua một quả dưa hấu to, tổng cộng hết hai mươi tệ. Chúng tôi đều rất vui mừng.',
    },
    grammarPoints: [
      {
        title: 'Câu hỏi giá tiền với 多少钱 (duōshao qián - bao nhiêu tiền)',
        structure: 'Danh từ / Cái này (这个) + 多少钱？',
        explanation: 'Mẫu câu thiết yếu nhất khi đi mua sắm ở Trung Quốc.',
        examples: [
          { chinese: '这个多少钱？', pinyin: 'Zhège duōshao qián?', vietnamese: 'Cái này bao nhiêu tiền?' },
          { chinese: '一斤苹果多少钱？', pinyin: 'Yì jīn píngguǒ duōshao qián?', vietnamese: 'Một cân táo bao nhiêu tiền?' },
        ],
      },
      {
        title: 'Đơn vị tiền tệ khẩu ngữ 块 (kuài - đồng, tệ)',
        structure: 'Số từ + 块 (+ tiền 钱)',
        explanation: 'Trong văn nói hàng ngày, người Trung Quốc dùng chữ "块 (kuài)" thay cho chữ "元 (yuán)" trên văn bản chính thức.',
        examples: [
          { chinese: '十块钱', pinyin: 'shí kuài qián', vietnamese: 'Mười tệ (10 RMB)' },
          { chinese: '两块五', pinyin: 'liǎng kuài wǔ', vietnamese: 'Hai tệ rưỡi (2.5 RMB)' },
        ],
      },
    ],
    vocabulary: [
      { hanzi: '买', pinyin: 'mǎi', sinoVietnamese: 'MÃI', vietnamese: 'Mua' },
      { hanzi: '钱', pinyin: 'qián', sinoVietnamese: 'TIỀN', vietnamese: 'Tiền' },
      { hanzi: '多少', pinyin: 'duōshao', sinoVietnamese: 'ĐA THIỂU', vietnamese: 'Bao nhiêu' },
      { hanzi: '大', pinyin: 'dà', sinoVietnamese: 'ĐẠI', vietnamese: 'To, lớn' },
      { hanzi: '小', pinyin: 'xiǎo', sinoVietnamese: 'TIỂU', vietnamese: 'Nhỏ, bé' },
      { hanzi: '块', pinyin: 'kuài', sinoVietnamese: 'KHỐI', vietnamese: 'Tệ, đồng (tiền)' },
    ],
  },

  // ==========================================
  // BÀI 5: THỜI GIAN & LỊCH TRÌNH
  // ==========================================
  {
    id: 'lesson-05-time',
    title: 'Bài 5: Thời Gian & Lịch Trình Sinh Hoạt',
    chineseTitle: '第五课：时间与日程安排',
    level: 'HSK 1',
    category: 'Thời gian & Lịch biểu',
    icon: '⏰',
    description: 'Học cách xem giờ, hỏi ngày tháng năm, các thứ trong tuần và sắp xếp lịch hẹn.',
    dialogue: [
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '小明，请问现在几点？',
        pinyin: 'Xiǎomíng, qǐngwèn xiànzài jǐ diǎn?',
        sinoVietnamese: 'Tiểu Minh, thỉnh vấn hiện tại kỷ điểm?',
        vietnamese: 'Tiểu Minh ơi, xin hỏi bây giờ là mấy giờ rồi?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '现在八点半。你今天有什么安排？',
        pinyin: 'Xiànzài bā diǎn bàn. Nǐ jīntiān yǒu shénme ānpái?',
        sinoVietnamese: 'Hiện tại bát điểm bán. Nhĩ kim niên hữu thập ma an bài?',
        vietnamese: 'Bây giờ là 8 rưỡi. Hôm nay bạn có kế hoạch gì không?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我上午九点去教室上课，下午去图书馆看书。今天星期几？',
        pinyin: 'Wǒ shàngwǔ jiǔ diǎn qù jiàoshì shàngkè, xiàwǔ qù túshūguǎn kànshū. Jīntiān xīngqī jǐ?',
        sinoVietnamese: 'Ngã thượng ngọ cửu điểm khứ giáo thất thượng khóa, hạ ngọ khứ đồ thư quán khán thư. Kim thiên tinh kỳ kỷ?',
        vietnamese: '9 giờ sáng mình đến lớp học, buổi chiều đến thư viện đọc sách. Hôm nay là thứ mấy nhỉ?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '今天星期五。明天是星期六，我们不用上课。',
        pinyin: 'Jīntiān xīngqī wǔ. Míngtiān shì xīngqī liù, wǒmen bú yòng shàngkè.',
        sinoVietnamese: 'Kim thiên tinh kỳ ngũ. Minh thiên thị tinh kỳ lục, ngã môn bất dụng thượng khóa.',
        vietnamese: 'Hôm nay là thứ Sáu. Ngày mai là thứ Bảy, chúng mình không phải đi học.',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '太好了！明天晚上我们一起看电影，怎么样？',
        pinyin: 'Tài hǎo le! Míngtiān wǎnshang wǒmen yìqǐ kàn diànyǐng, zěnmeyàng?',
        sinoVietnamese: 'Thái hảo liễu! Minh thiên vãn thượng ngã môn nhất khởi khán điện ảnh, chẩm ma dạng?',
        vietnamese: 'Tuyệt quá! Tối mai chúng mình cùng đi xem phim nhé, thấy thế nào?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '好啊，明天晚上七点见！',
        pinyin: 'Hǎo a, míngtiān wǎnshang qī diǎn jiàn!',
        sinoVietnamese: 'Hảo a, minh thiên vãn thượng thất điểm kiến!',
        vietnamese: 'Được chứ, hẹn tối mai 7 giờ gặp nhau nhé!',
      },
    ],
    readingStory: {
      title: 'Một Ngày Của Tôi (我的一天)',
      content:
        '我每天早上七点起床，七点半吃早饭。八点我去学校，上午有四节汉语课。中午十二点我和同学在学校餐厅吃午饭。下午两点我去图书馆读中国文学书。晚上我做作业，十点半睡觉。我的一天很充实。',
      pinyin:
        'Wǒ měitiān zǎoshang qī diǎn qǐchuáng, qī diǎn bàn chī zǎofàn. Bā diǎn wǒ qù xuéxiào, shàngwǔ yǒu sì jié Hànyǔ kè. Zhōngwǔ shí\'èr diǎn wǒ hé tóngxué zài xuéxiào cāntīng chī wǔfàn. Xiàwǔ liǎng diǎn wǒ qù túshūguǎn dú Zhōngguó wénxué shū. Wǎnshang wǒ zuò zuòyè, shí diǎn bàn shuìjiào. Wǒ de yì tiān hěn chōngshí.',
      vietnamese:
        'Mỗi ngày tôi thức dậy lúc 7 giờ sáng, 7 giờ rưỡi ăn sáng. 8 giờ tôi đến trường, buổi sáng có bốn tiết học tiếng Trung. 12 giờ trưa tôi cùng bạn học ăn trưa tại căng tin của trường. 2 giờ chiều tôi đến thư viện đọc sách văn học Trung Quốc. Buổi tối tôi làm bài tập, 10 giờ rưỡi đi ngủ. Một ngày của tôi trôi qua rất ý nghĩa và trọn vẹn.',
    },
    grammarPoints: [
      {
        title: 'Quy tắc diễn đạt thời gian trong tiếng Trung (Từ lớn đến bé)',
        structure: 'Năm (年) $\\to$ Tháng (月) $\\to$ Ngày (日/号) $\\to$ Buổi $\\to$ Giờ (点) $\\to$ Phút (分)',
        explanation: 'Ngược lại với tiếng Việt (từ bé đến lớn), tiếng Trung luôn đặt đơn vị thời gian lớn lên trước.',
        examples: [
          { chinese: '今天星期五上午九点', pinyin: 'jīntiān xīngqī wǔ shàngwǔ jiǔ diǎn', vietnamese: '9 giờ sáng thứ Sáu hôm nay' },
          { chinese: '明天晚上七点半', pinyin: 'míngtiān wǎnshang qī diǎn bàn', vietnamese: '7 rưỡi tối ngày mai' },
        ],
      },
      {
        title: 'Hỏi giờ giấc với 现在几点 (xiànzài jǐ diǎn)',
        structure: '现在几点？ $\\to$ 现在 + Số từ + 点 (+ 分 / 半)',
        explanation: 'Chữ "点 (diǎn)" là giờ, "半 (bàn)" là rưỡi (30 phút).',
        examples: [
          { chinese: '现在八点半。', pinyin: 'Xiànzài bā diǎn bàn.', vietnamese: 'Bây giờ là 8 rưỡi.' },
          { chinese: '十点十分', pinyin: 'shí diǎn shí fēn', vietnamese: '10 giờ 10 phút' },
        ],
      },
    ],
    vocabulary: [
      { hanzi: '年', pinyin: 'nián', sinoVietnamese: 'NIÊN', vietnamese: 'Năm' },
      { hanzi: '月', pinyin: 'yuè', sinoVietnamese: 'NGUYỆT', vietnamese: 'Tháng, trăng' },
      { hanzi: '日', pinyin: 'rì', sinoVietnamese: 'NHẬT', vietnamese: 'Ngày, mặt trời' },
      { hanzi: '星期', pinyin: 'xīngqī', sinoVietnamese: 'TINH KỲ', vietnamese: 'Tuần, thứ' },
      { hanzi: '点', pinyin: 'diǎn', sinoVietnamese: 'ĐIỂM', vietnamese: 'Giờ, điểm' },
      { hanzi: '看', pinyin: 'kàn', sinoVietnamese: 'KHÁN', vietnamese: 'Xem, nhìn, đọc' },
    ],
  },

  // ==========================================
  // BÀI 6: VỊ TRÍ & PHƯƠNG HƯỚNG
  // ==========================================
  {
    id: 'lesson-06-direction',
    title: 'Bài 6: Vị Trí & Hỏi Đường',
    chineseTitle: '第六课：问路与寻找方位',
    level: 'HSK 1',
    category: 'Giao thông & Phương hướng',
    icon: '🧭',
    description: 'Học cách hỏi đường, tìm các địa điểm công cộng như trường học, thư viện, bệnh viện.',
    dialogue: [
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '请问，图书馆在哪儿？',
        pinyin: 'Qǐngwèn, túshūguǎn zài nǎr?',
        sinoVietnamese: 'Thỉnh vấn, đồ thư quán tại nã nhi?',
        vietnamese: 'Xin hỏi, thư viện ở đâu ạ?',
      },
      {
        speaker: 'Học sinh qua đường (同学)',
        chinese: '图书馆在教学楼的前面，离这儿不远。',
        pinyin: 'Túshūguǎn zài jiàoxuélóu de qiánmian, lí zhèr bù yuǎn.',
        sinoVietnamese: 'Đồ thư quán tại giáo học lâu đích tiền diện, ly giá nhi bất viễn.',
        vietnamese: 'Thư viện ở phía trước tòa nhà học, cách đây không xa.',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '走着去要几分钟？',
        pinyin: 'Zǒu zhe qù yào jǐ fēnzhōng?',
        sinoVietnamese: 'Tẩu trước khứ yếu kỷ phân chung?',
        vietnamese: 'Đi bộ đến đó mất mấy phút ạ?',
      },
      {
        speaker: 'Học sinh qua đường (同学)',
        chinese: '走三分钟就到了。你看，前面那个白色的楼就是。',
        pinyin: 'Zǒu sān fēnzhōng jiù dào le. Nǐ kàn, qiánmian nà ge báisè de lóu jiù shì.',
        sinoVietnamese: 'Tẩu tam phân chung tựu đáo liễu. Nhĩ khán, tiền diện na cá bạch sắc đích lâu tựu thị.',
        vietnamese: 'Đi bộ ba phút là tới rồi. Bạn nhìn xem, tòa nhà màu trắng phía trước kia chính là nó.',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '太感谢你了！',
        pinyin: 'Tài gǎnxiè nǐ le!',
        sinoVietnamese: 'Thái cảm tạ nhĩ liễu!',
        vietnamese: 'Cảm ơn bạn nhiều lắm!',
      },
    ],
    readingStory: {
      title: 'Khuôn Viên Trường Học Của Tôi (我的美丽校园)',
      content:
        '我的大学很大，也非常漂亮。学校里有很多绿树和花草。教学楼在学校中间，图书馆在教学楼前面。学校后面有一个大操场，很多学生下午在那里打篮球。我非常喜欢我的学校。',
      pinyin:
        'Wǒ de dàxué hěn dà, yě fēicháng piàoliang. Xuéxiào lǐ yǒu hěn duō lǜshù hé huācǎo. Jiàoxuélóu zài xuéxiào zhōngjiān, túshūguǎn zài jiàoxuélóu qiánmian. Xuéxiào hòumian yǒu yí gè dà cāochǎng, hěn duō xuésheng xiàwǔ zài nàlǐ dǎ lánqiú. Wǒ fēicháng xǐhuan wǒ de xuéxiào.',
      vietnamese:
        'Trường đại học của tôi rất rộng và cũng rất đẹp. Trong trường có nhiều cây xanh và hoa cỏ. Tòa nhà học nằm ở giữa trường, thư viện ở phía trước tòa nhà học. Phía sau trường có một sân vận động lớn, nhiều học sinh buổi chiều chơi bóng rổ ở đó. Tôi vô cùng yêu quý ngôi trường của mình.',
    },
    grammarPoints: [
      {
        title: 'Giới từ chỉ vị trí 在 (zài - ở, tại)',
        structure: 'Chủ ngữ + 在 + Địa điểm / Vị trí',
        explanation: 'Dùng để xác định vị trí của người hoặc đồ vật.',
        examples: [
          { chinese: '图书馆在哪儿？', pinyin: 'Túshūguǎn zài nǎr?', vietnamese: 'Thư viện ở đâu?' },
          { chinese: '他在学校。', pinyin: 'Tā zài xuéxiào.', vietnamese: 'Anh ấy ở trường.' },
        ],
      },
      {
        title: 'Phương vị từ 前面 (qiánmian - phía trước) & 后面 (hòumian - phía sau)',
        structure: 'Địa điểm + 的 + 前面 / 后面',
        explanation: 'Xác định phương hướng tương đối so với một vật chuẩn.',
        examples: [
          { chinese: '教学楼前面', pinyin: 'jiàoxuélóu qiánmian', vietnamese: 'Phía trước tòa nhà học' },
          { chinese: '学校后面', pinyin: 'xuéxiào hòumian', vietnamese: 'Phía sau trường học' },
        ],
      },
    ],
    vocabulary: [
      { hanzi: '在哪儿', pinyin: 'zài nǎr', sinoVietnamese: 'TẠI NÃ NHI', vietnamese: 'Ở đâu' },
      { hanzi: '前', pinyin: 'qián', sinoVietnamese: 'TIỀN', vietnamese: 'Trước' },
      { hanzi: '后', pinyin: 'hòu', sinoVietnamese: 'HẬU', vietnamese: 'Sau' },
      { hanzi: '学校', pinyin: 'xuéxiào', sinoVietnamese: 'HỌC HIỆU', vietnamese: 'Trường học' },
      { hanzi: '白', pinyin: 'bái', sinoVietnamese: 'BẠCH', vietnamese: 'Trắng' },
    ],
  },

  // ==========================================
  // BÀI 7: THỜI TIẾT & BỐN MÙA
  // ==========================================
  {
    id: 'lesson-07-weather',
    title: 'Bài 7: Thời Tiết & Bốn Mùa',
    chineseTitle: '第七课：天气与四季冷热',
    level: 'HSK 1',
    category: 'Thiên nhiên & Đời sống',
    icon: '☀️',
    description: 'Học cách miêu tả thời tiết nắng, mưa, nóng, lạnh và dự báo thời tiết trong ngày.',
    dialogue: [
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '今天天气怎么样？冷不冷？',
        pinyin: 'Jīntiān tiānqì zěnmeyàng? Lěng bù lěng?',
        sinoVietnamese: 'Kim thiên thiên khí chẩm ma dạng? Lãnh bất lãnh?',
        vietnamese: 'Hôm nay thời tiết thế nào? Có lạnh không?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '今天天气非常好，不冷也不热，阳光很温暖。',
        pinyin: 'Jīntiān tiānqì fēicháng hǎo, bù lěng yě bú rè, yángguāng hěn wēnnuǎn.',
        sinoVietnamese: 'Kim thiên thiên khí phi thường hảo, bất lãnh dã bất nhiệt, dương quang hấn ôn noãn.',
        vietnamese: 'Thời tiết hôm nay rất tuyệt, không lạnh cũng không nóng, ánh nắng rất ấm áp.',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '明天会下雨吗？我想去爬山。',
        pinyin: 'Míngtiān huì xiàyǔ ma? Wǒ xiǎng qù páshān.',
        sinoVietnamese: 'Minh thiên hội hạ vũ ma? Ngã tưởng khứ ba sơn.',
        vietnamese: 'Ngày mai trời có mưa không nhỉ? Mình muốn đi leo núi.',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '我看天气预报了，明天晴天，不会下雨。你可以放心去！',
        pinyin: 'Wǒ kàn tiānqì yùbào le, míngtiān qíngtiān, bú huì xiàyǔ. Nǐ kěyǐ fàngxīn qù!',
        sinoVietnamese: 'Ngã khán thiên khí dự báo liễu, minh thiên tình thiên, bất hội hạ vũ. Nhĩ khả dĩ phóng tâm khứ!',
        vietnamese: 'Mình xem dự báo thời tiết rồi, ngày mai trời nắng ráo, sẽ không mưa đâu. Bạn có thể yên tâm đi!',
      },
    ],
    readingStory: {
      title: 'Mùa Thu Ở Bắc Kinh (北京的秋天)',
      content:
        '北京的一年有四个季节：春、夏、秋、冬。我最喜欢北京的秋天。秋天的天气不冷也不热，天很蓝，空气很新鲜。很多游人去香山看红叶。秋天是一年中最美的季节。',
      pinyin:
        'Běijīng de yì nián yǒu sì gè jìjié: chūn, xià, qiū, dōng. Wǒ zuì xǐhuan Běijīng de qiūtiān. Qiūtiān de tiānqì bù lěng yě bú rè, tiān hěn lán, kōngqì hěn xīnxiān. Hěn duō yóurén qù Xiāngshān kàn hóngyè. Qiūtiān shì yì nián zhōng zuì měi de jìjié.',
      vietnamese:
        'Một năm ở Bắc Kinh có bốn mùa: xuân, hạ, thu, đông. Tôi thích nhất là mùa thu Bắc Kinh. Thời tiết mùa thu không lạnh cũng không nóng, trời rất trong xanh, không khí trong lành. Rất nhiều du khách đến núi Hương Sơn ngắm lá đỏ. Mùa thu là mùa đẹp nhất trong năm.',
    },
    grammarPoints: [
      {
        title: 'Động từ năng nguyện 会 (huì - sẽ, có khả năng xảy ra)',
        structure: 'Chủ ngữ + 会 / 不会 + Động từ',
        explanation: 'Dùng để dự đoán một sự việc có khả năng diễn ra trong tương lai.',
        examples: [
          { chinese: '明天会下雨吗？', pinyin: 'Míngtiān huì xiàyǔ ma?', vietnamese: 'Ngày mai trời có mưa không?' },
          { chinese: '明天不会下雨。', pinyin: 'Míngtiān bú huì xiàyǔ.', vietnamese: 'Ngày mai sẽ không mưa.' },
        ],
      },
      {
        title: 'Cấu trúc hỏi thăm 怎么样 (zěnmeyàng - thế nào, ra sao)',
        structure: 'Chủ ngữ + 怎么样？',
        explanation: 'Dùng để hỏi về tình hình, tính chất, thời tiết hoặc thăm dò ý kiến.',
        examples: [
          { chinese: '今天天气怎么样？', pinyin: 'Jīntiān tiānqì zěnmeyàng?', vietnamese: 'Hôm nay thời tiết thế nào?' },
          { chinese: '你觉得这本书怎么样？', pinyin: 'Nǐ juéde zhè běn shū zěnmeyàng?', vietnamese: 'Bạn thấy cuốn sách này thế nào?' },
        ],
      },
    ],
    vocabulary: [
      { hanzi: '天气', pinyin: 'tiānqì', sinoVietnamese: 'THIÊN KHÍ', vietnamese: 'Thời tiết' },
      { hanzi: '天', pinyin: 'tiān', sinoVietnamese: 'THIÊN', vietnamese: 'Trời, ngày' },
      { hanzi: '气', pinyin: 'qì', sinoVietnamese: 'KHÍ', vietnamese: 'Khí, hơi' },
      { hanzi: '冷', pinyin: 'lěng', sinoVietnamese: 'LÃNH', vietnamese: 'Lạnh' },
      { hanzi: '热', pinyin: 'rè', sinoVietnamese: 'NHIỆT', vietnamese: 'Nóng' },
      { hanzi: '下雨', pinyin: 'xià yǔ', sinoVietnamese: 'HẠ VŨ', vietnamese: 'Mưa, đổ mưa' },
    ],
  },

  // ==========================================
  // BÀI 8: SỞ THÍCH & KỸ NĂNG
  // ==========================================
  {
    id: 'lesson-08-hobbies',
    title: 'Bài 8: Sở Thích & Kỹ Năng',
    chineseTitle: '第八课：爱好与语言能力',
    level: 'HSK 1',
    category: 'Sở thích & Kỹ năng',
    icon: '🎨',
    description: 'Học cách nói về sở thích cá nhân, khả năng biết làm việc gì qua học tập (nghe, nói, đọc, viết).',
    dialogue: [
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '大卫，你有什么爱好？',
        pinyin: 'Dàwèi, nǐ yǒu shénme àihào?',
        sinoVietnamese: 'Đại Vệ, nhĩ hữu thập ma ái hảo?',
        vietnamese: 'Đại Vệ ơi, bạn có sở thích gì?',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我喜欢听音乐和写中国汉字。你会写汉字吗？',
        pinyin: 'Wǒ xǐhuan tīng yīnyuè hé xiě Zhōngguó hànzì. Nǐ huì xiě hànzì ma?',
        sinoVietnamese: 'Ngã hỉ hoan thính âm nhạc hòa tả Trung Quốc Hán tự. Nhĩ hội tả Hán tự ma?',
        vietnamese: 'Mình thích nghe nhạc và luyện viết chữ Hán. Bạn có biết viết chữ Hán không?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '我是中国人，当然会写！不过现在大家都用电脑打字了。',
        pinyin: 'Wǒ shì Zhōngguó rén, dāngrán huì xiě! Búguò xiànzài dàjiā dōu yòng diànnǎo dǎzì le.',
        sinoVietnamese: 'Ngã thị Trung Quốc nhân, đương nhiên hội tả! Bất quá hiện tại đại gia đô dụng điện não đả tự liễu.',
        vietnamese: 'Mình là người Trung Quốc mà, đương nhiên là biết viết chứ! Nhưng bây giờ mọi người đều dùng máy tính gõ chữ cả rồi.',
      },
      {
        speaker: 'Đại Vệ (大卫)',
        chinese: '我觉得用毛笔写汉字特别美，像艺术一样。你能教我吗？',
        pinyin: 'Wǒ juéde yòng máobǐ xiě hànzì tèbié měi, xiàng yìshù yíyàng. Nǐ néng jiāo wǒ ma?',
        sinoVietnamese: 'Ngã giác đắc dụng mao bút tả Hán tự đặc biệt mỹ, tượng nghệ thuật nhất dạng. Nhĩ năng giáo ngã ma?',
        vietnamese: 'Mình thấy dùng bút lông viết chữ Hán đẹp tuyệt vời, y như một môn nghệ thuật vậy. Bạn có thể dạy mình không?',
      },
      {
        speaker: 'Tiểu Minh (小明)',
        chinese: '没问题！我们周末一起练习写汉字吧！',
        pinyin: 'Méi wèntí! Wǒmen zhōumò yìqǐ liànxí xiě hànzì ba!',
        sinoVietnamese: 'Một vấn đề! Ngã môn chu mạt nhất khởi luyện tập tả Hán tự ba!',
        vietnamese: 'Không thành vấn đề! Cuối tuần này chúng mình cùng nhau luyện viết chữ Hán nhé!',
      },
    ],
    readingStory: {
      title: 'Tình Yêu Với Thư Pháp Chữ Hán (我对汉字书法的热爱)',
      content:
        '汉字是世界上最古老的文字之一。每一个汉字都有它的历史和故事。学习写汉字虽然有点难，但非常有意思。我每天都用半个小时练习写毛笔字。当我写好一个字的时候，我心里非常快乐。汉字真有魅力！',
      pinyin:
        'Hànzì shì shìjiè shang zuì gǔlǎo de wénzì zhī yī. Měi yí gè hànzì dōu yǒu tā de lìshǐ hé gùshi. Xuéxí xiě hànzì suīrán yǒudiǎnr nán, dàn fēicháng yǒu yìsi. Wǒ měitiān dōu yòng bàn gè xiǎoshí liànxí xiě máobǐzì. Dāng wǒ xiě hǎo yí gè zì de shíhou, wǒ xīnlǐ fēicháng kuàilè. Hànzì zhēn yǒu mèilì!',
      vietnamese:
        'Chữ Hán là một trong những hệ thống văn tự cổ xưa nhất trên thế giới. Mỗi một chữ Hán đều có lịch sử và câu chuyện riêng của nó. Học viết chữ Hán tuy có chút khó khăn nhưng lại vô cùng thú vị. Mỗi ngày tôi đều dành nửa tiếng để luyện viết thư pháp bút lông. Khi viết xong một chữ thật đẹp, trong lòng tôi cảm thấy vô cùng hạnh phúc. Chữ Hán thật là kỳ diệu!',
    },
    grammarPoints: [
      {
        title: 'Động từ năng nguyện 会 (huì - biết làm gì qua rèn luyện/học tập)',
        structure: 'Chủ ngữ + 会 + Động từ',
        explanation: 'Khác với "知道 (biết thông tin)", chữ "会" chỉ kỹ năng đạt được thông qua sự học hỏi, rèn luyện.',
        examples: [
          { chinese: '你会写汉字吗？', pinyin: 'Nǐ huì xiě hànzì ma?', vietnamese: 'Bạn có biết viết chữ Hán không?' },
          { chinese: '我会说汉语。', pinyin: 'Wǒ huì shuō Hànyǔ.', vietnamese: 'Tôi biết nói tiếng Trung.' },
        ],
      },
      {
        title: 'Động từ tâm lý 喜欢 (xǐhuan - thích)',
        structure: 'Chủ ngữ + 喜欢 + Danh từ / Động từ',
        explanation: 'Dùng để biểu thị sở thích hoặc sự yêu thích đối với hành động, sự vật.',
        examples: [
          { chinese: '我喜欢听音乐。', pinyin: 'Wǒ xǐhuan tīng yīnyuè.', vietnamese: 'Tôi thích nghe nhạc.' },
          { chinese: '你喜欢喝茶吗？', pinyin: 'Nǐ xǐhuan hē chá ma?', vietnamese: 'Bạn có thích uống trà không?' },
        ],
      },
    ],
    vocabulary: [
      { hanzi: '喜欢', pinyin: 'xǐhuan', sinoVietnamese: 'HỈ HOAN', vietnamese: 'Thích' },
      { hanzi: '写', pinyin: 'xiě', sinoVietnamese: 'TẢ', vietnamese: 'Viết' },
      { hanzi: '听', pinyin: 'tīng', sinoVietnamese: 'THÍNH', vietnamese: 'Nghe' },
      { hanzi: '说', pinyin: 'shuō', sinoVietnamese: 'THUYẾT', vietnamese: 'Nói' },
      { hanzi: '读', pinyin: 'dú', sinoVietnamese: 'ĐỘC', vietnamese: 'Đọc' },
      { hanzi: '字', pinyin: 'zì', sinoVietnamese: 'TỰ', vietnamese: 'Chữ' },
    ],
  },
];

/**
 * Helper to retrieve lesson by ID
 */
export function getLessonById(id: string): HskLesson | undefined {
  return HSK_LESSONS.find((l) => l.id === id);
}

/**
 * Helper to get all categories
 */
export function getAllLessonCategories(): string[] {
  const categories = new Set(HSK_LESSONS.map((l) => l.category));
  return Array.from(categories);
}

import { Project, ExperienceItem, EducationItem, AwardItem, FloatingItem } from '../types';

export const PROJECTS: Project[] = [
  {
    id: 'photo-exhibition',
    cardNumber: 'A♠',
    suit: 'spade',
    title: '關於麻賽的攝影展 主視覺',
    subtitle: 'a PHOTOGRAPHIC EXHIBITION',
    category: 'exhibition',
    categoryLabel: 'EXHIBITION / ART',
    year: '2026',
    index: '01/16',
    client: 'Masai Photography Art Foundation',
    coverImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '黑白光影与网格排版的视觉叙事，呈现摄影作品中微观纹理与空间张力。',
    description: [
      '本主视觉设计围绕“光影的颗粒感与纪实张力”展开。通过强对比黑白影像与错落有致的网格字体排版，重新建立观众与摄影作品之间的对话视角。',
      '在海报与衍生物料中，采用了特种艺术纸压印与局部高光油墨，使单色视觉展现出丰富的层次感与触觉触感。'
    ],
    tags: ['主视觉设计', '展陈排版', '黑白摄影', '海报设计'],
    colorPalette: ['#121212', '#2A2A2A', '#8C8C8C', '#EAEAEA', '#FFFFFF'],
    featured: true,
    likes: 1280
  },
  {
    id: 'tiger-ceramic',
    cardNumber: '2♦',
    suit: 'diamond',
    title: '《虎瓷》書籍裝幀設計',
    subtitle: '"TIGER CERAMIC" EDITORIAL DESIGN',
    category: 'type',
    categoryLabel: 'TYPE / EDITORIAL',
    year: '2025',
    index: '02/16',
    client: '景德镇当代陶瓷艺术馆',
    coverImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '结合泥土烧制质感与现代封套结构，呈现传统陶瓷艺术的当代装帧呈现。',
    description: [
      '《虎瓷》专著装帧采用了泥质灰粗糙特种纸作为书衣，封面以烫压不规则黑箔与凸字工艺模拟陶瓷釉面的窑变开片纹路。',
      '内页运用双重网格系统，左页聚焦器物局部纹理细节，右页保留大量留白，营造出静谧如博物馆展厅般的阅读节奏。'
    ],
    tags: ['书籍装帧', '排版艺术', '特种纸', '陶瓷文化'],
    colorPalette: ['#3A322C', '#6E5D4F', '#A39382', '#D1C8BD', '#F7F4EF'],
    featured: true,
    likes: 1150
  },
  {
    id: 'lin-fengmian-grad',
    cardNumber: '3♣',
    suit: 'club',
    title: '林風眠美術學院畢業展 主視覺',
    subtitle: 'LIN FENGMIAN GRADUATION EXHIBITION',
    category: 'exhibition',
    categoryLabel: 'EXHIBITION / ART',
    year: '2025',
    index: '03/16',
    client: '林风眠美术学院',
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '色彩斑斓的艺术气球与前卫排版，象征青年艺术家破壳而出的多维碰撞。',
    description: [
      '以“漂浮与交融”为核心意象，采用高饱和度的色彩微粒与三维充气结构，象征毕业学子多元思想的汇聚。',
      '导视系统打破传统的平面框架，结合动态投影与镜面反光不锈钢，为观众带来沉浸式的观展引导。'
    ],
    tags: ['毕业展主视觉', '导视系统', '动态海报', '视觉传达'],
    colorPalette: ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#0F172A'],
    featured: true,
    likes: 980
  },
  {
    id: 'power-herbal-tea',
    cardNumber: '4♥',
    suit: 'heart',
    title: '強力涼茶 品牌形象設計',
    subtitle: 'POWER-UP HERBAL DRINK',
    category: 'branding',
    categoryLabel: 'BRANDING / TYPE',
    year: '2025',
    index: '04/16',
    client: '强力草本健康科技',
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '传统东方草本结合工业朋克黑体，塑造年轻一代的新型能效凉茶品牌。',
    description: [
      '强力凉茶旨在打破传统凉茶的古板印象，提取“强力”二字的书法筋骨并以具现代几何感的粗重字体进行再造。',
      '包装运用哑光黑与高亮萤光黄（Power Green/Yellow）对比，搭配工业风提袋与铝罐结构，极具终端辨识度。'
    ],
    tags: ['品牌识别', '字体设计', '饮料包装', 'IP衍生'],
    colorPalette: ['#1A1A1A', '#C6F432', '#333333', '#E5E5E5', '#FFFFFF'],
    featured: true,
    likes: 890
  },
  {
    id: 'or-studio',
    cardNumber: '5♠',
    suit: 'spade',
    title: '或工作室 品牌形象設計',
    subtitle: 'OR STUDIO BRAND DESIGN',
    category: 'branding',
    categoryLabel: 'BRANDING / TYPE',
    year: '2024',
    index: '05/16',
    client: 'OR Architecture & Design',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '极简建筑感构架与青绿公文包衍生物料，探索“或”字的无限空间可能性。',
    description: [
      '“或”代表开放、探索与可能性。我们为 OR STUDIO 设计了一套具有弹性构架的视觉标识，标志可根据应用媒介的比例自由拉伸变体。',
      '配套办公用品设计包含定制高质感青绿公文箱、黑箔压印名片以及纯素皮革工具袋。'
    ],
    tags: ['建筑工作室', 'VI视觉识别', '办公物料', '极简主义'],
    colorPalette: ['#008080', '#1B3B36', '#E2ECE9', '#2C3531', '#FFFFFF'],
    featured: true,
    likes: 820
  },
  {
    id: 'cof2e2-coffee',
    cardNumber: '6♦',
    suit: 'diamond',
    title: 'COF2E2 咖啡品牌形象設計',
    subtitle: 'COF2E2 COFFEE BRAND',
    category: 'branding',
    categoryLabel: 'BRANDING / PACKAGING',
    year: '2024',
    index: '06/16',
    client: 'COF2E2 Roastery',
    coverImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '化学式命名的精品烘焙咖啡，从滤纸切边与实验图表中提取印记符号。',
    description: [
      'COF2E2 将咖啡萃取视作一场精准的化学实验。品牌视觉以黑白实验报告图表为灵感，结合网版印刷错位效果。',
      '包装袋使用可降解牛皮纸结合定制金属夹扣，散发出质朴而严谨的精品咖啡美学。'
    ],
    tags: ['精品咖啡', '包装设计', '印花图案', '实验室风格'],
    colorPalette: ['#222222', '#555555', '#999999', '#DDDDDD', '#F8F8F8'],
    featured: true,
    likes: 760
  },
  {
    id: 'cny-2025-card',
    cardNumber: '7♣',
    suit: 'club',
    title: '祝您新春快樂 賀卡與禮盒',
    subtitle: '2025 HAPPY CHINESE NEW YEAR',
    category: 'packaging',
    categoryLabel: 'PACKAGING / TYPE',
    year: '2025',
    index: '07/16',
    client: 'YUTOO Creative Lab',
    coverImage: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '朱红金箔与当代篆刻字型的岁朝清供，表达具有当代温度的东方祝福。',
    description: [
      '2025蛇年新春特别企划。设计运用传统朱红艺术纸作为基底，通过重打凹烫金工艺呈现“祝您新春快乐”的特别再造字体。',
      '内含定制年历、吉语对联与烫金扑克卡牌套盒，传达热忱而沉稳的节日仪式感。'
    ],
    tags: ['新春礼盒', '烫金工艺', '字体设计', '东方美学'],
    colorPalette: ['#B91C1C', '#D97706', '#78350F', '#FEF3C7', '#1C1917'],
    featured: false,
    likes: 380
  },
  {
    id: 'year-of-snake',
    cardNumber: '8♥',
    suit: 'heart',
    title: '2025 蛇年新年特輯視覺',
    subtitle: 'YEAR OF SNAKE VISUAL',
    category: 'type',
    categoryLabel: 'TYPE / EDITORIAL',
    year: '2025',
    index: '08/16',
    client: 'Design Monthly China',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '流畅如灵蛇缠绕的曲线字体造型，表达时间流转与无限循环意象。',
    description: [
      '以蛇的优雅缠绕姿态为解构起点，创作了一组专属的定制西文字体与中文标题字，并结合微距摄影与金属反光质感。'
    ],
    tags: ['字体设计', '实验造型', '金属质感', '海报艺术'],
    colorPalette: ['#171717', '#404040', '#A3A3A3', '#E5E5E5', '#FFFFFF'],
    featured: true,
    likes: 540
  },
  {
    id: 'typography-signage',
    cardNumber: '9♠',
    suit: 'spade',
    title: '字體實驗與告示牌系統',
    subtitle: 'TYPOGRAPHY EXPERIMENT & SIGNAGE',
    category: 'type',
    categoryLabel: 'TYPE / EDITORIAL',
    year: '2024',
    index: '09/16',
    client: 'Urban Space Lab',
    coverImage: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '探索公共空间中文字的实体化呈现与金属腐蚀刻字实验。',
    description: [
      '探讨文字从屏幕与纸张走向建筑实体的过程。采用不锈钢板腐蚀、激光切割与凹凸冲印，形成独具工业硬朗感的告示指示牌。'
    ],
    tags: ['告示牌设计', '空间导视', '实体字体', '不锈钢工艺'],
    colorPalette: ['#525252', '#737373', '#A3A3A3', '#D4D4D4', '#F5F5F5'],
    featured: false,
    likes: 450
  },
  {
    id: 'chafan-wood-book',
    cardNumber: '10♦',
    suit: 'diamond',
    title: '茶飯草木領 簡繁字體與詩集',
    subtitle: 'WORD & TYPOGRAPHY BOOK',
    category: 'type',
    categoryLabel: 'TYPE / EDITORIAL',
    year: '2024',
    index: '10/16',
    client: '草木言出版工作室',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '“一茶一饭，我们都能尝到真味。”——生活美学诗集的温情排版。',
    description: [
      '“一茶一饭，草木领趣；举目皆甜，我们都能尝到真味。”整本书以宋体字为主干，搭配极其轻盈的横排间距与软格纸底纹，带来如午后茶香般的阅读感受。'
    ],
    tags: ['诗集排版', '宋体美学', '网格设计', '生活美学'],
    colorPalette: ['#1F2937', '#4B5563', '#9CA3AF', '#E5E7EB', '#F9FAFB'],
    featured: true,
    likes: 710
  },
  {
    id: 'fil-5th-anniversary',
    cardNumber: 'J♣',
    suit: 'club',
    title: 'FIL 5th Anniversary 视觉',
    subtitle: 'FIL 5th ANNIVERSARY VISUAL',
    category: 'branding',
    categoryLabel: 'BRANDING / TYPE',
    year: '2024',
    index: '11/16',
    client: 'FIL Design Collective',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '晶体折射与光雕海报，庆祝设计团队五周年的光芒汇聚。',
    description: [
      '以五周年钻石折射为抽象概念，将几何折线与强光影雕刻结合，展现 FIL 团队五年间的蜕变与成长。'
    ],
    tags: ['周年庆主视觉', '三维设计', '折光特效', '品牌纪念'],
    colorPalette: ['#09090B', '#27272A', '#71717A', '#E4E4E7', '#FFFFFF'],
    featured: false,
    likes: 310
  },
  {
    id: 'red-launch-bazaar',
    cardNumber: 'Q♥',
    suit: 'heart',
    title: 'RED LAUNCH Bloom Bazaar 品牌',
    subtitle: 'RED LAUNCH BLOOM BAZAAR',
    category: 'branding',
    categoryLabel: 'BRANDING / PACKAGING',
    year: '2024',
    index: '12/16',
    client: 'RED Launch 集市',
    coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '炽热红色立体礼盒与市集视觉，传递热烈时尚的时尚市集氛围。',
    description: [
      '针对年轻设计师集市打造的极具张力的色彩系统，以饱和朱红与天蓝交织，创造出强烈的空间吸引力。'
    ],
    tags: ['集市视觉', '包装盒设计', '色彩构成', '时尚潮流'],
    colorPalette: ['#DC2626', '#2563EB', '#FEE2E2', '#DBEAFE', '#0F172A'],
    featured: true,
    likes: 680
  },
  {
    id: 'poster-archive-2023',
    cardNumber: '3♠',
    suit: 'spade',
    title: '齐思 海报创作档案 2020-2026',
    subtitle: 'QISI POSTER ARCHIVE',
    category: 'exhibition',
    categoryLabel: 'EXHIBITION / TYPE',
    year: '2026',
    index: '13/13',
    client: 'QSi Personal Archive',
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'
    ],
    summary: '6年间120+张实验海报的精选整理，记录视觉语言的演进轨道。',
    description: [
      '梳理了作者从初入视觉传达领域至今的120多张海报作品。包含排版练习、艺术剧场主视觉、实验音符视觉化等。'
    ],
    tags: ['海报档案', '排版演进', '视觉实验', '个人作品集'],
    colorPalette: ['#18181B', '#3F3F46', '#71717A', '#D4D4D8', '#FAFAFA'],
    featured: true,
    likes: 620
  }
];

export const ABOUT_DATA = {
  name: '齐思 QSi',
  englishName: 'QSi DESIGN',
  title: '平面设计师 / 艺术指导 / 品牌视觉总监',
  englishTitle: 'Graphic Designer & Art Director',
  location: 'Shanghai / Hangzhou / Remote',
  email: 'qsi.design@gmail.com',
  phone: '+86 188 8888 8888',
  wechat: 'QSi_Studio',
  qq: '120923',
  social: {
    xiaohongshu: '齐思QSi (小红书)',
    behance: 'behance.net/qsi-design',
    dribbble: 'dribbble.com/qsi_design',
    instagram: '@qsi.design'
  },
  manifesto: [
    '如切如磋，如琢如磨。',
    'As if cut, as if filed; as if chiselled, as if polished.',
    '我们相信字体与视觉语言是思想的微观建筑。从纸张边缘的裁切到屏幕颗粒的微调，每一个几何留白都承载着情绪的克制与力量。'
  ],
  bio: '专注品牌视觉识别（VI）、字体排版艺术（Typography）、书籍装帧（Editorial Design）与空间导视系统。擅长将东方人文哲思与现代前卫解构相结合，为品牌与艺术机构构建深具辨识度的视觉资产。',
  skillTags: [
    { name: 'PS', category: 'software' },
    { name: 'AI', category: 'software' },
    { name: 'AIGC', category: 'tech' },
    { name: '品牌设计', category: 'domain' },
    { name: '标志设计', category: 'domain' },
    { name: '字体设计', category: 'domain' },
    { name: '插画设计', category: 'domain' },
    { name: '平面视觉设计', category: 'domain' },
    { name: '书籍装帧', category: 'domain' },
    { name: '包装结构', category: 'domain' },
    { name: 'C4D', category: 'software' },
    { name: 'UI设计', category: 'domain' },
    { name: '展陈视觉', category: 'domain' },
    { name: '动态视觉', category: 'domain' }
  ],
  skills: [
    { category: '视觉与排版', items: ['品牌识别 VI / CI', '字体造型与解构', '书籍装帧与网格系统', '海报与展陈视觉'] },
    { category: '媒介与工艺', items: ['孔版/丝网印刷', '特种纸与工艺压印', '包装结构与材质', '导视与实体空间'] },
    { category: '数字与动态', items: ['动态字体 (Motion Type)', 'UI / Web Design', '3D 渲染与 C4D', '交互视觉体验'] }
  ],
  education: [
    {
      year: '2016 - 2020',
      degree: '视觉传达设计 学士 (BFA in Visual Communication)',
      school: '中国美术学院 (China Academy of Art)',
      location: 'Hangzhou, China',
      description: '主修网格字体排版、书籍设计与品牌视觉识别，毕业创作获优秀毕业设计金奖。'
    },
    {
      year: '2021 - 2022',
      degree: '艺术与设计 进修研究 (Visual Arts & Design Research)',
      school: '东京艺术大学 交流项目 (Tokyo University of the Arts Exchange)',
      location: 'Tokyo, Japan',
      description: '深入研究现代东方字体排版艺术与日本包装工艺逻辑。'
    }
  ] as EducationItem[],
  experience: [
    {
      year: '2023 - Present',
      role: '主理人 / 艺术指导 (Founder & Art Director)',
      company: 'QSi Design Studio (齐思设计)',
      location: 'Shanghai',
      description: '负责独立视觉项目、品牌识别重塑与文化艺术展览的主视觉指导。',
      highlights: ['服务 30+ 品牌与文化机构', '作品入选 Tokyo TDC 与 Hiiibrand', '指导多个毕业展与书籍装帧大奖']
    },
    {
      year: '2021 - 2023',
      role: '资深平面设计师 (Senior Graphic Designer)',
      company: 'OR Studio & Architecture',
      location: 'Hangzhou',
      description: '主导建筑与设计类客户的品牌 VI、实体导视系统与展陈视觉。',
      highlights: ['设计《OR STUDIO》全新VI与衍生品', '负责上海建筑双年展部分展区导视']
    },
    {
      year: '2019 - 2021',
      role: '视觉设计师 (Visual Designer)',
      company: 'Minimal Culture Press',
      location: 'Beijing',
      description: '专注于文化出版物、诗集与艺术 ZINE 的装帧与网格排版。',
      highlights: ['装帧出版《草木言》系列书籍', '获得中国最美的书入围提名']
    }
  ] as ExperienceItem[],
  awards: [
    { year: '2025', title: 'Tokyo TDC Annual Awards', organization: 'Tokyo Type Directors Club', category: 'Nominated - Book Design' },
    { year: '2024', title: 'Hiiibrand Typography Award', organization: 'Hiii Typography Competition', category: 'Gold Award - Poster' },
    { year: '2024', title: '中国最美的书 (Beauty of Books in China)', organization: 'Shanghai Press & Publication', category: 'Selected Award - 《虎瓷》' },
    { year: '2023', title: 'GDC Award (Graphic Design in China)', organization: 'SGDA', category: 'Merit Award - Brand Identity' }
  ] as AwardItem[]
};

export const FLOATING_ITEMS: FloatingItem[] = [
  {
    id: 'f1',
    type: 'card',
    title: '關於麻賽的攝影展',
    subtitle: 'A PHOTOGRAPHIC EXHIBITION',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=500&q=80',
    x: 12,
    y: 18,
    rotation: -12,
    scale: 0.95,
    zIndex: 3,
    projectId: 'photo-exhibition'
  },
  {
    id: 'f2',
    type: 'sketch',
    title: '《虎瓷》装帧手稿',
    subtitle: 'Editorial Sketch No. 4',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=80',
    x: 26,
    y: 12,
    rotation: 8,
    scale: 0.9,
    zIndex: 2,
    projectId: 'tiger-ceramic'
  },
  {
    id: 'f3',
    type: 'card',
    title: '林风眠毕业展',
    subtitle: 'GRADUATION 2025',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=500&q=80',
    x: 42,
    y: 8,
    rotation: -4,
    scale: 0.85,
    zIndex: 4,
    projectId: 'lin-fengmian-grad'
  },
  {
    id: 'f4',
    type: 'photo',
    title: '强力凉茶VI概念',
    subtitle: 'POWER-UP HERBAL DRINK',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
    x: 58,
    y: 14,
    rotation: 15,
    scale: 1,
    zIndex: 5,
    projectId: 'power-herbal-tea'
  },
  {
    id: 'f5',
    type: 'vinyl',
    title: 'COF2E2 Vinyl Record',
    subtitle: 'Special Sound Mix',
    image: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?auto=format&fit=crop&w=500&q=80',
    x: 75,
    y: 20,
    rotation: -18,
    scale: 1.05,
    zIndex: 6,
    projectId: 'cof2e2-coffee'
  },
  {
    id: 'f6',
    type: 'card',
    title: '或工作室 OR STUDIO',
    subtitle: 'Branding Project',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80',
    x: 88,
    y: 16,
    rotation: 10,
    scale: 0.88,
    zIndex: 2,
    projectId: 'or-studio'
  },
  {
    id: 'f7',
    type: 'sketch',
    title: '茶饭草木领 排版网格',
    subtitle: 'Grid Layout Draft',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=500&q=80',
    x: 18,
    y: 42,
    rotation: 6,
    scale: 0.9,
    zIndex: 4,
    projectId: 'chafan-wood-book'
  },
  {
    id: 'f8',
    type: 'badge',
    title: '3D DICE TOY',
    subtitle: 'Roll to find inspiration',
    x: 32,
    y: 48,
    rotation: -15,
    scale: 1.1,
    zIndex: 8
  },
  {
    id: 'f9',
    type: 'photo',
    title: 'RED LAUNCH Bloom Bazaar',
    subtitle: 'RED Launch 2024',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80',
    x: 64,
    y: 52,
    rotation: 12,
    scale: 1,
    zIndex: 7,
    projectId: 'red-launch-bazaar'
  },
  {
    id: 'f10',
    type: 'tag',
    title: 'everyday!',
    subtitle: 'Design Note Tag',
    x: 78,
    y: 38,
    rotation: -25,
    scale: 0.95,
    zIndex: 5
  },
  {
    id: 'f11',
    type: 'card',
    title: '2025 蛇年特輯',
    subtitle: 'YEAR OF SNAKE VISUAL',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
    x: 22,
    y: 70,
    rotation: -8,
    scale: 0.92,
    zIndex: 3,
    projectId: 'year-of-snake'
  },
  {
    id: 'f12',
    type: 'card',
    title: '齐思 创作手稿 2026',
    subtitle: 'VISUAL MANIFESTO',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=500&q=80',
    x: 48,
    y: 84,
    rotation: -2,
    scale: 1.05,
    zIndex: 9,
    projectId: 'poster-archive-2023'
  },
  {
    id: 'f13',
    type: 'card',
    title: '祝您新春快樂',
    subtitle: 'HAPPY CHINESE NEW YEAR',
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=500&q=80',
    x: 72,
    y: 72,
    rotation: 16,
    scale: 0.88,
    zIndex: 4,
    projectId: 'cny-2025-card'
  }
];

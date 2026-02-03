import type { AcademicDiscipline, Law } from '@/types';

/**
 * 二级专业类学科目录
 * 基于《普通高等学校本科专业目录》(2020版)
 *
 * 共覆盖13个学科门类的主要二级专业类
 */
export const ACADEMIC_DISCIPLINES: AcademicDiscipline[] = [
  // ========== 01 哲学门类 ==========
  {
    code: '0101',
    name: '哲学类',
    level: 2,
    parent_code: '01',
    related_laws: ['Cognition' as Law, 'Metaphysics' as Law],
    keywords: ['本体', '认识', '存在', '意识', '伦理', '逻辑', '真理', '价值'],
  },

  // ========== 02 经济学门类 ==========
  {
    code: '0201',
    name: '经济学类',
    level: 2,
    parent_code: '02',
    related_laws: ['Scarcity' as Law, 'Power' as Law],
    keywords: ['资源', '价值', '交换', '市场', '需求', '供给', '竞争', '效率'],
  },
  {
    code: '0202',
    name: '财政学类',
    level: 2,
    parent_code: '02',
    related_laws: ['Scarcity' as Law, 'Power' as Law],
    keywords: ['税收', '财政', '预算', '公共', '支出', '收入'],
  },
  {
    code: '0203',
    name: '金融学类',
    level: 2,
    parent_code: '02',
    related_laws: ['Scarcity' as Law, 'Time' as Law],
    keywords: ['货币', '金融', '信用', '利率', '风险', '投资', '银行'],
  },
  {
    code: '0204',
    name: '经济与贸易类',
    level: 2,
    parent_code: '02',
    related_laws: ['Scarcity' as Law, 'Space' as Law],
    keywords: ['贸易', '国际', '进出口', '关税', '全球化', '商品'],
  },

  // ========== 03 法学门类 ==========
  {
    code: '0301',
    name: '法学类',
    level: 2,
    parent_code: '03',
    related_laws: ['Power' as Law, 'Cognition' as Law],
    keywords: ['法律', '规范', '权利', '义务', '正义', '司法', '法规', '制度'],
  },
  {
    code: '0302',
    name: '政治学类',
    level: 2,
    parent_code: '03',
    related_laws: ['Power' as Law, 'Scarcity' as Law],
    keywords: ['政治', '权力', '治理', '国家', '政权', '政策', '政府'],
  },
  {
    code: '0303',
    name: '社会学类',
    level: 2,
    parent_code: '03',
    related_laws: ['Cognition' as Law, 'Power' as Law],
    keywords: ['社会', '群体', '阶层', '组织', '互动', '结构', '关系'],
  },
  {
    code: '0304',
    name: '民族学类',
    level: 2,
    parent_code: '03',
    related_laws: ['Cognition' as Law, 'Time' as Law],
    keywords: ['民族', '族群', '文化', '习俗', '传统', '认同'],
  },
  {
    code: '0305',
    name: '马克思主义理论类',
    level: 2,
    parent_code: '03',
    related_laws: ['Power' as Law, 'Time' as Law],
    keywords: ['阶级', '生产', '意识形态', '革命', '劳动', '剥削'],
  },
  {
    code: '0306',
    name: '公安学类',
    level: 2,
    parent_code: '03',
    related_laws: ['Power' as Law, 'Space' as Law],
    keywords: ['治安', '安全', '犯罪', '执法', '秩序', '警察'],
  },

  // ========== 04 教育学门类 ==========
  {
    code: '0401',
    name: '教育学类',
    level: 2,
    parent_code: '04',
    related_laws: ['Cognition' as Law, 'Time' as Law],
    keywords: ['教育', '学习', '教学', '发展', '知识', '培养'],
  },
  {
    code: '0402',
    name: '体育学类',
    level: 2,
    parent_code: '04',
    related_laws: ['Survival' as Law, 'Space' as Law],
    keywords: ['体育', '运动', '身体', '竞技', '健康', '训练'],
  },

  // ========== 05 文学门类 ==========
  {
    code: '0501',
    name: '中国语言文学类',
    level: 2,
    parent_code: '05',
    related_laws: ['Cognition' as Law, 'Time' as Law],
    keywords: ['语言', '文学', '汉语', '文字', '诗歌', '小说', '表达'],
  },
  {
    code: '0502',
    name: '外国语言文学类',
    level: 2,
    parent_code: '05',
    related_laws: ['Cognition' as Law, 'Space' as Law],
    keywords: ['外语', '翻译', '跨文化', '交流', '语言'],
  },
  {
    code: '0503',
    name: '新闻传播学类',
    level: 2,
    parent_code: '05',
    related_laws: ['Cognition' as Law, 'Power' as Law],
    keywords: ['新闻', '传播', '媒体', '信息', '舆论', '报道'],
  },

  // ========== 06 历史学门类 ==========
  {
    code: '0601',
    name: '历史学类',
    level: 2,
    parent_code: '06',
    related_laws: ['Time' as Law, 'Cognition' as Law],
    keywords: ['历史', '过去', '演变', '记录', '文明', '事件', '年代'],
  },

  // ========== 07 理学门类 ==========
  {
    code: '0701',
    name: '数学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Cognition' as Law, 'Metaphysics' as Law],
    keywords: ['数学', '数量', '逻辑', '抽象', '结构', '计算', '公式'],
  },
  {
    code: '0702',
    name: '物理学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Space' as Law, 'Metaphysics' as Law],
    keywords: ['物理', '力', '能量', '物质', '运动', '时空', '引力', '电磁'],
  },
  {
    code: '0703',
    name: '化学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Space' as Law, 'Survival' as Law],
    keywords: ['化学', '物质', '反应', '元素', '分子', '原子', '合成'],
  },
  {
    code: '0704',
    name: '天文学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Space' as Law, 'Time' as Law],
    keywords: ['天文', '宇宙', '星体', '天体', '行星', '恒星', '银河'],
  },
  {
    code: '0705',
    name: '地理科学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Space' as Law, 'Survival' as Law],
    keywords: ['地理', '地球', '环境', '空间', '区域', '地貌', '地形'],
  },
  {
    code: '0706',
    name: '大气科学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Space' as Law, 'Survival' as Law],
    keywords: ['气候', '天气', '大气', '气象', '风', '雨', '温度'],
  },
  {
    code: '0707',
    name: '海洋科学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Space' as Law, 'Survival' as Law],
    keywords: ['海洋', '海水', '海洋生物', '潮汐', '洋流'],
  },
  {
    code: '0708',
    name: '地球物理学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Space' as Law, 'Metaphysics' as Law],
    keywords: ['地球', '地质', '地震', '磁场', '重力'],
  },
  {
    code: '0709',
    name: '地质学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Space' as Law, 'Time' as Law],
    keywords: ['地质', '岩石', '矿物', '地层', '化石', '地壳'],
  },
  {
    code: '0710',
    name: '生物科学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Survival' as Law, 'Time' as Law],
    keywords: ['生物', '生命', '进化', '基因', '生态', '物种', '细胞'],
  },
  {
    code: '0711',
    name: '心理学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Cognition' as Law, 'Survival' as Law],
    keywords: ['心理', '意识', '认知', '行为', '情绪', '思维', '感知'],
  },
  {
    code: '0712',
    name: '统计学类',
    level: 2,
    parent_code: '07',
    related_laws: ['Cognition' as Law, 'Scarcity' as Law],
    keywords: ['统计', '数据', '概率', '分析', '推断', '样本'],
  },

  // ========== 08 工学门类 (精选主要专业类) ==========
  {
    code: '0801',
    name: '力学类',
    level: 2,
    parent_code: '08',
    related_laws: ['Space' as Law, 'Metaphysics' as Law],
    keywords: ['力学', '机械', '运动', '结构', '应力', '动力'],
  },
  {
    code: '0802',
    name: '机械类',
    level: 2,
    parent_code: '08',
    related_laws: ['Space' as Law, 'Scarcity' as Law],
    keywords: ['机械', '制造', '工具', '技术', '机器', '设备', '工程'],
  },
  {
    code: '0807',
    name: '电子信息类',
    level: 2,
    parent_code: '08',
    related_laws: ['Cognition' as Law, 'Space' as Law],
    keywords: ['电子', '信息', '通信', '信号', '传输', '网络'],
  },
  {
    code: '0809',
    name: '计算机类',
    level: 2,
    parent_code: '08',
    related_laws: ['Cognition' as Law, 'Metaphysics' as Law],
    keywords: ['计算', '程序', '算法', '信息', '网络', '软件', '数据'],
  },
  {
    code: '0814',
    name: '土木类',
    level: 2,
    parent_code: '08',
    related_laws: ['Space' as Law, 'Survival' as Law],
    keywords: ['建筑', '工程', '结构', '桥梁', '道路', '施工'],
  },
  {
    code: '0828',
    name: '建筑类',
    level: 2,
    parent_code: '08',
    related_laws: ['Space' as Law, 'Power' as Law],
    keywords: ['建筑', '结构', '空间', '设计', '城市', '规划'],
  },
  {
    code: '0830',
    name: '环境科学与工程类',
    level: 2,
    parent_code: '08',
    related_laws: ['Survival' as Law, 'Space' as Law],
    keywords: ['环境', '污染', '生态', '保护', '治理', '资源'],
  },

  // ========== 09 农学门类 ==========
  {
    code: '0901',
    name: '植物生产类',
    level: 2,
    parent_code: '09',
    related_laws: ['Survival' as Law, 'Time' as Law],
    keywords: ['农业', '种植', '作物', '植物', '耕作', '收获'],
  },
  {
    code: '0902',
    name: '动物生产类',
    level: 2,
    parent_code: '09',
    related_laws: ['Survival' as Law, 'Scarcity' as Law],
    keywords: ['畜牧', '养殖', '动物', '家畜', '饲养'],
  },
  {
    code: '0903',
    name: '林学类',
    level: 2,
    parent_code: '09',
    related_laws: ['Survival' as Law, 'Space' as Law],
    keywords: ['森林', '林业', '树木', '植被', '生态'],
  },

  // ========== 10 医学门类 ==========
  {
    code: '1001',
    name: '基础医学类',
    level: 2,
    parent_code: '10',
    related_laws: ['Survival' as Law, 'Cognition' as Law],
    keywords: ['医学', '生理', '病理', '解剖', '人体', '疾病'],
  },
  {
    code: '1002',
    name: '临床医学类',
    level: 2,
    parent_code: '10',
    related_laws: ['Survival' as Law, 'Time' as Law],
    keywords: ['临床', '疾病', '治疗', '诊断', '患者', '医疗'],
  },
  {
    code: '1003',
    name: '口腔医学类',
    level: 2,
    parent_code: '10',
    related_laws: ['Survival' as Law, 'Space' as Law],
    keywords: ['口腔', '牙齿', '口腔疾病', '治疗'],
  },
  {
    code: '1004',
    name: '公共卫生与预防医学类',
    level: 2,
    parent_code: '10',
    related_laws: ['Survival' as Law, 'Power' as Law],
    keywords: ['公共卫生', '预防', '流行病', '健康', '疫情'],
  },
  {
    code: '1007',
    name: '药学类',
    level: 2,
    parent_code: '10',
    related_laws: ['Survival' as Law, 'Scarcity' as Law],
    keywords: ['药物', '药品', '制药', '药理', '治疗'],
  },

  // ========== 12 管理学门类 ==========
  {
    code: '1201',
    name: '管理科学与工程类',
    level: 2,
    parent_code: '12',
    related_laws: ['Power' as Law, 'Scarcity' as Law],
    keywords: ['管理', '决策', '优化', '系统', '工程', '项目'],
  },
  {
    code: '1202',
    name: '工商管理类',
    level: 2,
    parent_code: '12',
    related_laws: ['Power' as Law, 'Scarcity' as Law],
    keywords: ['企业', '管理', '市场', '组织', '经营', '商业'],
  },
  {
    code: '1203',
    name: '农业经济管理类',
    level: 2,
    parent_code: '12',
    related_laws: ['Scarcity' as Law, 'Survival' as Law],
    keywords: ['农业', '经济', '管理', '农村', '资源'],
  },
  {
    code: '1204',
    name: '公共管理类',
    level: 2,
    parent_code: '12',
    related_laws: ['Power' as Law, 'Cognition' as Law],
    keywords: ['公共', '行政', '管理', '政府', '政策', '服务'],
  },

  // ========== 13 艺术学门类 ==========
  {
    code: '1301',
    name: '艺术学理论类',
    level: 2,
    parent_code: '13',
    related_laws: ['Cognition' as Law, 'Metaphysics' as Law],
    keywords: ['艺术', '美学', '审美', '创作', '理论', '批评'],
  },
  {
    code: '1302',
    name: '音乐与舞蹈学类',
    level: 2,
    parent_code: '13',
    related_laws: ['Cognition' as Law, 'Time' as Law],
    keywords: ['音乐', '舞蹈', '节奏', '表演', '旋律', '编舞'],
  },
  {
    code: '1303',
    name: '戏剧与影视学类',
    level: 2,
    parent_code: '13',
    related_laws: ['Cognition' as Law, 'Time' as Law],
    keywords: ['戏剧', '电影', '叙事', '表演', '导演', '剧本'],
  },
  {
    code: '1304',
    name: '美术学类',
    level: 2,
    parent_code: '13',
    related_laws: ['Cognition' as Law, 'Space' as Law],
    keywords: ['美术', '绘画', '雕塑', '视觉', '造型', '色彩'],
  },
  {
    code: '1305',
    name: '设计学类',
    level: 2,
    parent_code: '13',
    related_laws: ['Cognition' as Law, 'Space' as Law],
    keywords: ['设计', '创意', '功能', '形式', '视觉', '产品'],
  },
];

/**
 * 根据学科代码查找学科
 */
export function getDisciplineByCode(code: string): AcademicDiscipline | undefined {
  return ACADEMIC_DISCIPLINES.find((d) => d.code === code);
}

/**
 * 根据法则查找相关学科
 */
export function getDisciplinesByLaw(law: Law): AcademicDiscipline[] {
  return ACADEMIC_DISCIPLINES.filter((d) => d.related_laws.includes(law));
}

/**
 * 根据关键词搜索学科 (模糊匹配)
 */
export function searchDisciplinesByKeyword(keyword: string): AcademicDiscipline[] {
  const lowerKeyword = keyword.toLowerCase();
  return ACADEMIC_DISCIPLINES.filter((d) => {
    return (
      d.name.toLowerCase().includes(lowerKeyword) ||
      d.keywords.some((kw) => kw.includes(keyword) || keyword.includes(kw))
    );
  });
}

/**
 * 获取所有二级专业类数量
 */
export function getTotalDisciplineCount(): number {
  return ACADEMIC_DISCIPLINES.length;
}

/**
 * 按门类分组学科
 */
export function groupDisciplinesByParent(): Record<string, AcademicDiscipline[]> {
  const grouped: Record<string, AcademicDiscipline[]> = {};

  ACADEMIC_DISCIPLINES.forEach((discipline) => {
    const parent = discipline.parent_code || 'unknown';
    if (!grouped[parent]) {
      grouped[parent] = [];
    }
    grouped[parent].push(discipline);
  });

  return grouped;
}

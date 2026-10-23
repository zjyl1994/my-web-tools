export const toolGroups = ['通用工具', '开发与文本', '图片与分享', '日常计算'] as const;
export type ToolGroup = typeof toolGroups[number];
export type Tool = {
  path: string;
  title: string;
  description: string;
  group: ToolGroup;
  icon: string;
  layout: 'editor' | 'form' | 'cards';
};

export const tools: Tool[] = [
  { path: '/timestamp', title: '时间戳转换', description: '秒、毫秒与日期时间双向转换，支持本地时区和 UTC。', group: '通用工具', icon: 'clock', layout: 'cards' },
  { path: '/random', title: '随机生成', description: '批量生成指定范围的随机整数，或自选字符的随机字符串。', group: '通用工具', icon: 'shuffle', layout: 'form' },
  { path: '/uuid', title: 'UUID 生成器', description: '批量生成 UUID v4，每行一条，支持选择复制。', group: '通用工具', icon: 'fingerprint', layout: 'form' },
  { path: '/json', title: 'JSON 工具', description: 'JSON 格式化、压缩、修复与转换。', group: '开发与文本', icon: 'braces', layout: 'editor' },
  { path: '/encoder', title: '编解码', description: 'Base64、URL 与 Gzip 编解码。', group: '开发与文本', icon: 'arrows', layout: 'editor' },
  { path: '/textproc', title: '文本处理', description: '文本拆分、合并、替换、去重与排序。', group: '开发与文本', icon: 'text', layout: 'editor' },
  { path: '/compare', title: '内容对比', description: '文本与 JSON 差异对比。', group: '开发与文本', icon: 'columns', layout: 'editor' },
  { path: '/sqlfmt', title: 'SQL 格式化', description: 'SQL 语句格式化，支持 MySQL、PostgreSQL 等多种方言。', group: '开发与文本', icon: 'database', layout: 'editor' },
  { path: '/lazygo', title: 'Go 生成器', description: '处理结构体标签、代码转换与注释。', group: '开发与文本', icon: 'code', layout: 'editor' },
  { path: '/jwt', title: 'JWT 生成器', description: '设置密钥、有效期与自定义字段，生成 JWT。', group: '开发与文本', icon: 'key', layout: 'form' },
  { path: '/code', title: '密码机', description: '通过主密码与助记符，生成对应的密码。', group: '开发与文本', icon: 'lock', layout: 'form' },
  { path: '/imagecompress', title: '图片压缩', description: '等比缩小图片，导出 PNG、JPG 或 WEBP。图片仅在本机处理。', group: '图片与分享', icon: 'image', layout: 'cards' },
  { path: '/qrcode', title: '二维码生成', description: '根据文本、网址、WiFi 或联系人信息生成二维码。', group: '图片与分享', icon: 'qr', layout: 'cards' },
  { path: '/kcal', title: '大卡计算', description: '根据包装上的能量与重量，换算实际摄入大卡。', group: '日常计算', icon: 'flame', layout: 'form' },
  { path: '/pricecalc', title: '比价计算机', description: '计算商品单价，保存记录并比较价格。', group: '日常计算', icon: 'calculator', layout: 'cards' },
  { path: '/lottery', title: '彩票选号机', description: '随机生成彩票号码，保存选号记录。', group: '日常计算', icon: 'ticket', layout: 'cards' },
];

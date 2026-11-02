export const primaryColor = '#673ab7'; // 你的主色 (Deep Purple)

export const COLORS_DB = {
  // --- 语义色（建议与 Ant Design 保持一致，但微调以适配主色） ---
  green: '#52c41a', // Success - 保持
  red: '#ff4d4f', // Error - 建议换成这个更现代的红色
  orange: '#faad14', // Warning - 保持
  blue: '#2f54eb', // Info - 既然主色是紫色，蓝色建议偏向冷色调/深蓝
  purple: '#673ab7', // 既然主色是紫，这个值应该与主色一致
  cyan: '#13c2c2', // 保持
  yellow: '#fadb14', // 调优后的黄色，可读性更好
  pink: '#eb2f96', // 保持

  // --- 中性色（重构逻辑） ---
  black: '#000000',
  textPrimary: '#1f1f1f', // 用于正文
  textSecondary: '#595959', // 用于次要文字
  textDisabled: '#bfbfbf', // 禁用状态文字
  border: '#d9d9d9', // 标准边框
  divider: '#f0f0f0', // 分割线/图表网格
  backgroundGray: '#f5f5f5', // 页面大背景
  white: '#ffffff',

  // --- UI 装饰色（基于主色的派生） ---
  // 建议将 dividerBlue 这种名称改为更通用的功能名称
  primaryLight: '#ede7f6', // 主色的极浅色，用于 Hover 背景或 Tag 背景
  primaryClick: '#512da8', // 主色的深色，用于 Active 状态
};

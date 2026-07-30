# 齐思设计作品集 (QSi Studio Portfolio) - 站点配置与维护指南

## 1. 内容数据配置 (Content Configuration)

网站的所有内容（包括作品集、个人/工作室介绍、首页飘浮卡片、联系方式、获奖履历等）均统一下沉存放在数据配置文件中：
📄 **文件路径**：`/src/data/portfolioData.ts`

### 1.1 作品集配置 (`PROJECTS`)
在 `export const PROJECTS` 数组中添加或修改作品。每个作品包含以下字段：
```typescript
{
  id: 'photo-exhibition', // 唯一标识符
  cardNumber: 'A♠',        // 卡片扑克牌编号或序号
  suit: 'spade',          // 扑克花色 ('spade' | 'heart' | 'diamond' | 'club')
  title: '作品名称',        // 主标题
  subtitle: 'SUBTITLE',   // 副标题
  category: 'exhibition', // 分类: 'branding' | 'exhibition' | 'type' | 'packaging'
  year: '2026',           // 年份
  client: '客户名称',      // 客户/机构
  coverImage: 'https://...', // 封面图URL
  galleryImages: ['https://...'], // 详情页图集
  summary: '一句话简介',
  description: ['第一段详细描述', '第二段详细描述'],
  tags: ['标签1', '标签2'],
  featured: true          // 是否在精选作品中优先展示
}
```

### 1.2 个人/工作室介绍配置 (`ABOUT_DATA`)
在 `export const ABOUT_DATA` 对象中配置个人及工作室信息：
* **基础信息**：姓名 (`name`)、英文名 (`englishName`)、职位 (`title`)、工作地点 (`location`)
* **联系方式**：邮箱 (`email`)、电话 (`phone`)、微信 (`wechat`)、QQ (`qq`)
* **社交媒体**：小红书、Behance、Dribbble、Instagram 链接/名称
* **履历与获奖**：教育背景 (`education`)、工作经历 (`experience`)、获奖荣誉 (`awards`)

### 1.3 首页灵感画布卡片 (`FLOATING_ITEMS`)
在 `export const FLOATING_ITEMS` 数组中控制首页画布上飘浮的卡片位置与样式：
* `x`, `y`：卡片在画布上的百分比坐标 (0 ~ 100)
* `rotation`：卡片的旋转角度 (-30 ~ 30)
* `scale`：缩放比例 (0.8 ~ 1.2)
* `projectId`：关联的作品 ID，点击卡片可直接打开对应作品弹窗

---

## 2. Agent 交互与定制规范 (Agent Instructions)

- **保持一体化流畅视觉**：无缝渐变与悬浮导向，不使用割裂的粗线条分割块。
- **首页层级防护**：首页中央的文字与按键位于 z-30 层级，防止被画布卡片遮挡。
- **顶部导航行为**：顶部 Header 在最顶端时背景透明，向下滚动后自动平滑弹出悬浮半透明毛玻璃导航栏。

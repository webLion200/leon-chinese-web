# LeonChinese 中文电子书网站

LeonChinese 面向中文学习者，提供电子书浏览与章节阅读，并为管理员和认证教师提供内容管理能力。V1 的目标是跑通“创作 → 发布 → 阅读”闭环。

## 技术架构

- 前端与管理后台：Next.js App Router、React、TypeScript
- 业务 API：FastAPI，使用 OpenAPI 描述接口契约
- 数据库：PostgreSQL；章节正文以 ProseMirror JSON 存储在 JSONB 字段
- 富文本编辑：TipTap；前台通过受控 JSON 渲染器展示内容
- 图片：后台上传到对象存储，数据库保存文件元数据和访问 URL

根路径 `/` 应使用 HTTP 308 重定向到 `/home`。

## V1 功能范围

- 读者可浏览已发布电子书、查看详情与已发布章节目录，并阅读已发布章节。
- 管理员可管理电子书、章节、发布状态和教师申请。
- 认证教师可创建和编辑自己的书籍、章节及封面内容。
- 富文本支持标题、段落、加粗、斜体、引用、列表和图片，支持草稿保存与后台预览。
- 公开访问必须同时满足书籍和章节状态均为 `PUBLISHED`；未发布内容须在服务端查询/API 层过滤。

V1 不包含支付、评论、搜索、收藏、AI 内容生成、语音功能或多人协同编辑。具体产品规则以仓库根目录的 `LeonChinese-电子书网站-V1-PRD.md` 为准。

## 开发环境

- Node.js 22.x
- pnpm

进入前端项目目录后安装依赖并启动开发服务器：

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm lint
pnpm build
pnpm start
```

## 代码约定

- 文件和文件夹使用小写 kebab-case；菜单 key 对应的子目录避免使用 `list`、`overview` 等通用名称。
- API 函数命名为 `xxxApi`。
- 类型定义以大写 `I` 或 `T` 开头。
- 组件使用大写字母开头的驼峰命名。
- `src/api` 子目录与 `src/app` 路由目录对应。
- 公共类型放在 `src/types`；页面专属类型放在对应页面目录的 `types.ts`。

## 前端部署

前端通过 Docker 镜像部署。准备部署环境变量后，在本目录执行：

```bash
make
```

该命令会按 `Makefile` 的配置构建镜像。部署目标、镜像名称和服务器路径应以当前项目的 `Makefile`、`Dockerfile` 与部署环境配置为准；不要沿用其他项目的镜像名或服务器目录。

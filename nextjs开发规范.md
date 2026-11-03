# LeonChinese Web Next.js 开发规范

本文适用于 `leon-chinese-web`。项目当前采用 Next.js 16 App Router、React 19、TypeScript strict、Tailwind CSS 4 和 Ant Design 6。开发时以项目锁定版本及其本地文档为准；不要直接套用旧版 Pages Router 示例。

## 1. 总体原则

- 优先使用 Next.js App Router 的文件路由、布局和服务端渲染能力。
- 页面默认采用 Server Component；只有需要浏览器 API、React 状态、事件处理或客户端专属库时才使用 Client Component。
- 前端通过统一请求层访问 FastAPI。业务 API 统一返回 `{ code: number; message: string; data?: T }`；页面和组件优先消费 `data`，错误通过统一请求错误类型处理。
- 保持实现直接、类型明确、边界清楚；避免为了抽象而抽象。

## 2. 目录与路由

```text
src/
  app/                 # 路由、layout、loading、error、not-found
  components/          # 跨页面复用 UI
  features/            # 按业务域组织的页面逻辑、组件、hooks、类型
  lib/                 # 请求封装、数据访问、第三方客户端
  utils/               # 无业务副作用的通用工具
```

- 使用 `src/app` 文件系统路由。`page.tsx` 定义页面，`layout.tsx` 定义共享布局，按需添加 `loading.tsx`、`error.tsx`、`not-found.tsx`。
- 用 route group（如 `(main)`）组织布局，不让分组名进入 URL；动态路由段使用 `[id]` 等清晰命名。
- 可复用组件放 `components`；特定业务且不适合全局复用的组件、hooks 和类型归入对应 `features/<domain>`。
- 路径别名统一使用 `@/`，避免深层相对路径。
- 文件和导出命名保持一致：React 组件 PascalCase，hooks 使用 `useXxx`，普通函数和变量 camelCase，常量按语义选择 camelCase 或 UPPER_SNAKE_CASE。

## 3. Server 与 Client Components

- 未标记 `'use client'` 的组件默认是 Server Component。服务端组件可直接读取服务端数据并减少发送给浏览器的 JavaScript。
- `'use client'` 放在最小的交互边界，尽量靠近叶子组件；不要因为页面中有一个交互控件，就把整页或整个布局标成客户端组件。
- Client Component 不能直接导入带密钥的服务端模块；跨服务端/客户端边界传递的 props 必须可序列化。
- Context Provider、Ant Design 交互 Provider 等客户端能力应集中在必要的 provider 组件中，布局本身尽量保持 Server Component。
- 浏览器专属 API（`window`、`document`、`localStorage`）只能在客户端事件、effect 或经过安全判断的客户端模块中调用，不得在服务端渲染期间访问。
- 服务端专属模块可使用 `server-only` 明确边界；服务端组件向客户端传递数据前，只传递页面确实需要的字段。

## 4. 数据获取、缓存与请求

- 在 Server Component 中可直接 `await` 数据访问函数；不要为了转发请求而无条件增加 Route Handler 中间层。
- 浏览器端业务请求统一经 `src/lib/request` 封装；不要在页面或组件中散落裸 `fetch`、重复拼接 API 地址或重复处理 token。
- 明确缓存意图。用户私有数据、管理后台实时数据使用不缓存/按用户隔离的策略；可公开且允许短暂陈旧的数据再配置缓存和 revalidation。不要依赖隐式默认值。
- Next.js 16 的 `fetch` 缓存行为与旧版本示例有差异；改动缓存逻辑前查当前版本文档并设置明确的 `cache`、`next.revalidate` 或标签策略。
- API 响应维持 `{code, message, data?}` envelope；请求层检查 HTTP 状态和业务 `code`，组件避免重复解析 envelope。请求错误应显示可理解的提示，避免展示堆栈或敏感后端内容。
- 并行且相互独立的数据请求应并行执行；确有依赖关系时再串行，避免不必要的瀑布请求。
- 对列表和搜索使用服务端分页/筛选契约；客户端需处理加载、空结果、错误和重复提交状态。

## 5. 交互、状态与表单

- 状态管理按数据来源和生命周期选择工具，不要求复杂交互全部使用组件本地状态，也不要求一律引入状态库：
  - 单个组件内短期存在的交互状态使用 `useState` / `useReducer`。
  - 跨页面、跨多个组件共享，且属于客户端交互流程的数据，可以使用 Zustand；例如编辑器草稿、复杂多步骤表单、跨区域选择状态、临时工作区状态。
  - 需要刷新后保留、可分享或可通过浏览器前进/后退恢复的筛选、分页、排序和搜索条件，优先放入 URL query string。
  - 来自 FastAPI 的书籍、用户、订单等服务端数据，不要仅为跨组件访问而复制进 Zustand。需要客户端缓存、去重、重取、失效管理时，评估 TanStack Query 等服务端状态工具，并明确它与统一请求层的职责边界。
- Zustand store 按业务域拆分，避免单个全局 store 混放互不相关状态；组件通过 selector 订阅所需字段，避免订阅整个 store 导致无关重渲染。
- 不在 Zustand 中重复保存可从 props、URL、服务端响应或其他状态可靠推导出的值；服务端数据更新后要有明确的失效/同步策略。
- 若使用 Zustand 持久化，先确定状态是否允许写入浏览器存储；不要持久化密码、访问令牌或其他敏感信息，并处理 SSR 首屏与客户端恢复之间的差异。
- 表单输入做客户端体验校验，同时以服务端校验为准；提交状态期间防止重复提交，并呈现成功/失败反馈。
- Effect 只用于与 React 外部系统同步（事件订阅、浏览器 API 等）；派生状态直接计算，避免用 effect 复制 props/state。
- 长操作提供明确的 loading、disabled 和错误状态；可取消请求时在组件卸载或条件变化时取消旧请求。

## 6. 安全与环境变量

- `NEXT_PUBLIC_` 前缀表示变量会进入客户端 bundle，只能放可公开配置。数据库凭证、服务端 API 密钥和签名密钥不得使用该前缀。
- 客户端 token 当前如需放浏览器存储，应明确其 XSS 风险；页面权限检查不能代替服务端授权。所有敏感数据和管理操作必须由 FastAPI 服务端验证身份与权限。
- 不信任客户端传来的用户 ID、角色、价格、资源归属或跳转 URL；服务端每次操作都要重新鉴权并校验对象级权限。
- Server Actions 和 Route Handlers 都是可被请求触发的服务端入口，必须校验输入、身份和授权，不能因为它们位于 Next.js 内部就视为安全。
- 避免将访问令牌、密码、个人信息写入日志、URL、错误提示或客户端可见 HTML。
- 生产环境设置最小必要的 CORS 来源和安全响应头；外部跳转目标必须校验，防止开放重定向。

## 7. SEO、Metadata 与错误边界

- 在 `layout.tsx`、`page.tsx` 使用 Next.js Metadata API 设置页面标题、描述、图标及社交分享元数据；避免保留脚手架默认文案。
- 页面为动态数据且 metadata 依赖参数时使用对应的动态 metadata API，并保证数据获取策略合理。
- 用 `loading.tsx` 呈现路由级加载反馈；用 `error.tsx` 处理可恢复渲染错误；用 `not-found.tsx` 和 `notFound()` 表达资源不存在。
- 错误边界只向用户展示可理解、无敏感信息的提示；服务端日志保留必要诊断信息。
- 图片使用 `next/image` 或明确说明使用原生图片的理由；远程图片配置精确的来源白名单。

## 8. 样式与组件库

- Tailwind CSS 4 与项目当前全局样式约定保持一致；重复使用的视觉模式抽成组件或语义化 class，避免大段重复样式。
- Ant Design 组件按需使用，统一由 provider 处理主题、locale、SSR 样式注册等全局集成；避免在多个页面重复配置全局 Provider。
- 页面布局优先响应式，关注窄屏、键盘操作、焦点态、颜色对比和语义化 HTML。
- 图标优先使用项目已有图标体系；不要为一个小图标引入整套新依赖。

## 9. TypeScript 与代码质量

- 保持 `strict` 类型检查开启；避免 `any`，外部数据从 `unknown` 开始，经校验或类型守卫后使用。
- API 输入、响应和领域数据定义明确类型；不要通过类型断言掩盖运行时数据不匹配。
- 可复用数据访问、权限判断和格式转换逻辑应集中管理，组件保持专注于渲染与交互。
- 删除无用状态、未使用参数、重复逻辑和调试输出；错误应有足够上下文但不泄露敏感信息。
- 引入依赖前先评估现有工具是否可满足需求，并更新锁文件。

## 10. 配置、构建与部署

- 通过环境变量区分本地、预览和生产环境；提供不含真实密钥的 `.env.example`，真实 `.env` 不提交。
- 保持 `next.config.ts` 的配置经过验证，避免宽泛的安全绕过选项；当前项目使用 `output: "standalone"`，Docker 构建和运行需与此配置保持一致。
- Node、包管理器和依赖版本遵循仓库配置与锁文件；本项目使用 pnpm lockfile，安装依赖时使用 pnpm。
- 生产构建不得依赖本地未提交文件、开发服务器缓存或隐式环境变量。
- 错误监控与日志不得记录密钥和敏感业务数据；健康检查、部署回滚和环境变量变更应纳入发布流程。

## 11. 变更交付

- 提交前至少完成受影响文件的 ESLint 检查与 TypeScript 检查；涉及构建配置、路由、服务端渲染或缓存的变更还应验证生产构建。
- 新页面应检查加载、错误、空状态、窄屏和键盘交互。
- PR 描述说明用户可见变化、接口契约影响、环境变量变化及需要的部署步骤。
- 修改 Next.js API 或使用框架特定能力前，先查项目安装版本对应的官方文档。`leon-chinese-web/AGENTS.md` 要求优先阅读 `node_modules/next/dist/docs/` 中相关指南；本地文档与旧教程冲突时，以当前安装版本为准。

## 12. 官方参考

- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Server 与 Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [数据获取与缓存](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js fetch API](https://nextjs.org/docs/app/api-reference/functions/fetch)
- [认证指南](https://nextjs.org/docs/app/guides/authentication)
- [数据安全指南](https://nextjs.org/docs/app/guides/data-security)
- [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

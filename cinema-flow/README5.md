# CinemaFlow - 第五次上机课作业

## 作业主题

第五次上机课围绕 Angular Router 进阶展开，在第四次响应式服务化版本的基础上，补齐了以下能力：

- 新增导演实体 `Director`
- 新增导演列表页和导演详情页
- 支持电影详情页跳转导演详情页
- 支持 `/movies/genre/:genre` 分类筛选路由
- 为“添加电影”页面增加登录守卫
- 在 Dashboard 与 About 页面展示新的多实体路由结构

## 本次完成内容

### 1. 导演实体与服务

- 新增 [src/app/models/director.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/models/director.ts)
- 新增 [src/app/services/director.service.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/services/director.service.ts)
- `DirectorService` 使用 `of() + delay() + tap()`，与 `MovieService` 保持一致的 Observable 风格

### 2. 电影模型扩展

- 扩展 [src/app/models/movie.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/models/movie.ts)，新增 `directorId` 与 `genre`
- 更新 [src/assets/movies.json](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/assets/movies.json) 种子数据
- 更新 `MovieService` 的反序列化与标准化逻辑，确保新字段参与状态流转

### 3. 路由与守卫

当前主路由拓扑如下：

```text
/                     → /dashboard
/dashboard            → 仪表盘
/movies               → 电影列表
/movies/genre/:genre  → 分类筛选
/movies/:id           → 电影详情
/directors            → 导演列表
/directors/:id        → 导演详情
/add                  → 添加电影（authGuard）
/about                → 关于
/**                   → /dashboard
```

- `movies/genre/:genre` 放在 `movies/:id` 之前，避免参数冲突
- 新增 [src/app/services/auth.service.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/services/auth.service.ts)
- 新增 [src/app/guards/auth.guard.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/guards/auth.guard.ts)
- 未登录访问 `/add` 时会被重定向到 `/dashboard?loginRequired=true`

## 页面更新

### 导演列表 / 导演详情

- 新增 [src/app/pages/director-list/director-list.component.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/pages/director-list/director-list.component.ts)
- 新增 [src/app/pages/director-detail/director-detail.component.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/pages/director-detail/director-detail.component.ts)
- 导演详情页支持：
  - `ActivatedRoute.paramMap` 响应式读取导演 ID
  - 显示该导演执导的电影列表
  - “上一位 / 下一位”无刷新切换导演

### 电影列表页

- 增加分类标签栏
- 搜索条件与分类条件同时同步到 URL
- 导演列可直接跳转到导演详情
- 类型列可直接跳转到分类浏览

### 电影详情页

- 导演名称改为可点击链接
- 类型改为可点击链接
- 保留返回、上一部 / 下一部导航

### Dashboard / About / Add

- Dashboard 新增“人气导演”区域
- About 页面更新为第五次实验的完整路由拓扑说明
- Add 页面新增导演选择与类型选择，并接入守卫登录流程

## 登录说明

- 用户名：`admin`
- 密码：`admin`

登录入口位于顶部导航栏右侧。登录成功后即可访问“添加电影”页面。

## 验证结果

已执行：

```bash
npm run build
```

结果：

- 构建成功
- 仍存在一个历史性的 bundle budget 警告：初始包体积约 `633.30 kB`，超过当前 `550 kB` 预算

## 说明

- 本次改动尽量保留了前四次上机课已经完成的响应式状态中心与界面风格
- 未额外实现选做的独立 404 页面，但已保留 `/** -> /dashboard` 的兜底重定向

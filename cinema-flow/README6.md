# CinemaFlow - 第六次上机课作业

## 作业主题

第六次上机课围绕“Angular `HttpClient` + Flask RESTful API + 前后端分离 CRUD”展开。在前五次实验的路由、导演实体和状态中心基础上，这次把 `CinemaFlow` 从纯前端内存数据版升级成了真实的前后端协同项目。

## 本次完成内容

### 1. 新增 Flask 后端工程

后端新增在项目同级目录：

```text
../cinemaflow-api
```

主要结构如下：

```text
cinemaflow-api/
  app.py
  models.py
  requirements.txt
  routes/
    __init__.py
    movies.py
    directors.py
```

后端已经实现：

- `GET /api/health`
- `GET /api/movies`
- `GET /api/movies/:id`
- `POST /api/movies`
- `PUT /api/movies/:id`
- `DELETE /api/movies/:id`
- `GET /api/directors`
- `GET /api/directors/:id`
- `GET /api/directors/:id/movies`
- `POST /api/directors`
- `DELETE /api/directors/:id`

并满足以下要求：

- 使用 `Blueprint` 模块化路由
- 使用 `flask-cors` 处理跨域
- 支持 `?title=` 搜索
- 支持 `?genre=` 类型筛选
- 支持 `400 / 404` 错误返回
- 数据在 Flask 进程存活期间保留

### 2. Angular 服务层改为真实 HTTP 调用

前端服务层不再使用 `of() + delay()` 模拟数据，而是改为真实调用 Flask API：

- [src/app/services/movie.service.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/services/movie.service.ts)
- [src/app/services/director.service.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/services/director.service.ts)

其中已经补齐：

- `HttpClient`
- `httpOptions`
- 每个请求的 `tap()`
- 每个请求的 `catchError()`
- 共享的 `handleError()` 高阶函数
- 日期与评论字段的序列化 / 反序列化

### 3. 状态中心与页面联动升级

状态中心 [src/app/services/movie-state.service.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/services/movie-state.service.ts) 继续负责：

- 全局电影列表
- Dashboard 统计
- 最近添加
- 最近浏览
- 详情页同步

本次额外补齐了实验六要求的：

- `addOptimistic(movieDraft)`
- `deleteOptimistic(id)`

这样新增和删除时，界面会先进行乐观更新，再等待后端确认。

### 4. Dashboard 搜索组件重写

新增接入的搜索组件：

- [src/app/components/movie-search/movie-search.component.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/components/movie-search/movie-search.component.ts)

已实现：

- `Subject`
- `debounceTime(300)`
- `distinctUntilChanged()`
- `switchMap()`
- 通过 `?title=` 调用后端搜索

Dashboard 页面也已经实际接入该组件。

### 5. 电影列表、详情页、导演页全面联通后端

#### 电影列表页

- 保留 `/movies` 和 `/movies/genre/:genre`
- 分类条件映射到后端 `?genre=`
- 搜索条件映射到后端 `?title=`
- 排序仍在前端处理，并继续写入 URL

#### 电影详情页

- 编辑保存改为真实 `PUT`
- 删除改为真实 `DELETE`
- 保存后返回上一页

#### 导演详情页

- 导演详情来自 `GET /api/directors/:id`
- 导演作品来自 `GET /api/directors/:id/movies`

### 6. 拓展挑战

本次额外完成一个低风险拓展项：

- 新增 HTTP 请求耗时拦截器

对应文件：

- [src/app/interceptors/http-timing.interceptor.ts](/d:/课程/2026春课程/商务网站开发与管理/提交到git/cinema-flow/src/app/interceptors/http-timing.interceptor.ts)

作用：

- 记录请求方法、URL、状态码、耗时
- 将日志写入 `MessageService`

## 运行方式

### 后端

在 `cinemaflow-api` 目录执行：

```bash
python -m pip install -r requirements.txt
python app.py
```

默认运行在：

```text
http://localhost:5000
```

### 前端

在 `cinema-flow` 目录执行：

```bash
npm install
npm start
```

默认运行在：

```text
http://localhost:4200
```

## 验证结果

### 已执行的检查

- `npm run build`
- `GET /api/health`
- `GET /api/movies`
- `GET /api/movies?title=Inter`
- `GET /api/movies?genre=剧情`
- `GET /api/directors`
- `GET /api/directors/3/movies`
- `POST -> PUT -> DELETE /api/movies`
- `POST -> DELETE /api/directors`
- 非法数据 `400` 检查
- 缺失资源 `404` 检查

### 检查结论

- 前端构建成功
- Flask API 可正常启动
- CORS 生效
- 电影 CRUD 正常
- 导演接口正常
- Dashboard 搜索正常接入后端
- 类型筛选正常接入后端
- 详情页保存与删除正常

## 作业六完成情况说明

按实验六验收标准审查，当前项目已经满足：

- Flask 后端存在并可运行
- Angular 使用真实 `HttpClient`
- 电影与导演模块都通过 HTTP API 工作
- `tap + catchError + handleError + httpOptions` 已补齐
- 搜索组件满足防抖搜索要求
- 具备友好错误处理与服务日志
- 具备乐观更新能力

结论：

**本项目已完成第六次上机课作业要求。**

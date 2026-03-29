# Website-Creator

本仓库包含商务网站开发与管理课程的上机课项目。

## 项目说明

- **第一次上机课**：Angular 基础组件开发
- **第二次上机课**：Service 层架构 + 豆瓣风格功能

## 进入项目

```bash
cd cinema-flow
```

## 运行项目

```bash
npm install
npm start
```

浏览器访问：http://localhost:4200/

---

# CinemaFlow - 电影管理系统

CinemaFlow 是一个功能完整的电影管理系统，采用 Angular 17 Standalone 架构，实现了豆瓣风格的电影浏览、评分、评论等功能。

## 技术栈

- Angular 17 (Standalone Components)
- TypeScript
- Angular Material (深色主题)
- RxJS (响应式编程)

---

## 第二次上机课完成内容

### Phase 1: 创建 MovieService 服务层
- ✅ 使用 Angular CLI 生成 MovieService
- ✅ 将 mock 数据迁移到 Service 中管理
- ✅ 实现 `getMovies()` 和 `getMovieById()` 方法

### Phase 2: 组件依赖注入重构
- ✅ MovieList 组件通过构造函数注入 MovieService
- ✅ MovieStats 组件从 Service 获取数据
- ✅ 移除组件中的 @Input 数据传递方式
- ✅ 实现清晰的数据流：Service → Component → Template

### Phase 3: 实现 CRUD 操作
- ✅ **新增功能**：创建 MovieForm 组件，支持添加新电影
- ✅ **删除功能**：电影卡片添加删除按钮
- ✅ **更新功能**：MovieDetail 组件支持编辑模式
- ✅ 所有操作通过 MovieService 统一管理

### Phase 4: 服务分层与最佳实践
- ✅ 创建 LoggerService 记录操作日志
- ✅ MovieService 注入 LoggerService
- ✅ 确保所有数据操作都通过 Service 进行
- ✅ 使用 `@Injectable({ providedIn: 'root' })`

### Phase 5: RxJS Observable 进阶
- ✅ 将 MovieService 改造为 Observable 模式
- ✅ 使用 BehaviorSubject 管理状态
- ✅ 组件中使用 `async` 管道订阅数据
- ✅ 数据变更自动推送到所有订阅者

### 豆瓣风格功能扩展
- ✅ **评论系统**：用户可以发表评论和评分
- ✅ **五星评分**：支持 1-5 星评分系统
- ✅ **观看状态**：想看/在看/看过状态管理
- ✅ **标签系统**：电影类型标签展示和筛选
- ✅ **搜索功能**：按标题、导演、演员、标签搜索
- ✅ **筛选排序**：按评分、时间、热度排序
- ✅ **浏览统计**：记录电影浏览次数
- ✅ **详细信息**：剧情简介、主演列表等

---

## 第一次上机课完成内容

### 第一阶段：系统蓝图与环境搭建
- 初始化 Standalone 项目并接入 Angular Material 深色主题
- 定义 Movie 数据接口（含上映日期、观影状态等字段）

### 第二阶段：声明式列表渲染与交互
- 使用 ngFor 渲染电影列表
- 点击卡片选中电影并高亮
- 使用 JSON 调试区实时观察 selectedMovie 变化

### 第三阶段：组件拆分与 Input 通信
- 拆分 MovieDetail 组件并通过 Input 接收数据
- 使用 ngIf 进行防御式渲染
- 日期管道格式化为 yyyy年MM月
- 自定义 RatingLevelPipe 将评分映射为等级

### 第四阶段：智能统计与联动编辑
- 新增 MovieStats 组件展示总片量、观影比例、平均评分
- 使用 getter 保证数据变化时统计自动更新
- 详情页使用 ngModel 双向绑定修改电影标题并与列表同步

---

## 核心功能

### 1. 电影管理
- 浏览电影列表（网格布局）
- 添加新电影
- 编辑电影信息
- 删除电影
- 查看电影详情

### 2. 豆瓣风格功能
- 五星评分系统
- 想看/在看/看过状态
- 发表影评和短评
- 评论点赞
- 浏览次数统计

### 3. 搜索与筛选
- 关键词搜索（标题、导演、演员）
- 按标签筛选
- 按观看状态筛选
- 多种排序方式（评分、时间、热度）

### 4. 数据统计
- 电影总数
- 观影比例
- 平均评分
- 实时更新

---

## 项目结构

```text
src/app/
├── models/
│   └── movie.ts                    # Movie 和 Comment 接口定义
├── services/
│   ├── movie.service.ts            # 电影数据服务（CRUD + 豆瓣功能）
│   └── logger.service.ts           # 日志服务
├── components/
│   ├── movie-form/                 # 添加电影表单
│   ├── movie-search/               # 搜索和筛选组件
│   └── movie-comments/             # 评论组件
├── movie-list/                     # 电影列表组件
├── movie-detail/                   # 电影详情组件
├── movie-stats/                    # 统计信息组件
└── pipes/
    └── rating-level.pipe.ts        # 评分等级管道
```

---

## 运行方式

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm start
# 或
ng serve
```

浏览器访问：http://localhost:4200/

### 构建生产版本

```bash
npm run build
# 或
ng build --configuration production
```

### 运行测试

```bash
npm test
```

---

## 技术亮点

1. **Standalone Components**：使用 Angular 17 最新架构
2. **依赖注入**：Service 层统一管理数据
3. **响应式编程**：RxJS Observable + BehaviorSubject
4. **Material Design**：使用 Angular Material 组件库
5. **TypeScript**：类型安全的开发体验
6. **模块化设计**：清晰的组件和服务分层

---

## 说明

本项目用于《商务网站开发与管理》课程实验提交，实现了完整的 Angular 服务层架构和豆瓣风格的电影管理功能。

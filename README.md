# CinemaFlow - 第一次上机课

CinemaFlow 是一个内部电影库管理系统原型项目，用于演示 Angular 17 Standalone 架构下的数据驱动 UI、组件通信与统计展示。

## 技术栈

- Angular 17 (Standalone Components)
- TypeScript
- Angular Material (深色主题)

## 实验完成内容

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

## 运行方式

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm start
```

浏览器访问：http://localhost:4200/

### 构建

```bash
npm run build
```

### 单元测试

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## 项目结构

```text
src/app/
	models/movie.ts
	mock-movies.ts
	movie-list/
	movie-detail/
	movie-stats/
	pipes/rating-level.pipe.ts
```

## 说明

本项目用于课程实验提交，界面已在保留核心实验功能基础上进行了现代化升级。

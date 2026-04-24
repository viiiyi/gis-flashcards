# Cloudflare Pages + D1 数据库配置

这个项目现在使用 Cloudflare Pages Functions + Cloudflare D1 记录学生数据。

## 1. 创建 D1 数据库

在 Cloudflare 控制台：

1. 进入 `Workers & Pages`
2. 左侧或页面中找到 `D1 SQL Database`
3. 点击 `Create database`
4. 数据库名称建议：`gis-flashcards-db`
5. 创建完成后进入数据库页面

## 2. 建表

进入 D1 数据库后：

1. 打开 `Console` 或 `Query`
2. 复制 `schema-d1.sql` 的全部内容
3. 粘贴并执行

会创建这些表：

- `students`：学生姓名、学号
- `favorites`：收藏卡片
- `progress`：章节进度和正确/错误数
- `answer_logs`：每次答题记录

## 3. 绑定 D1 到 Pages 项目

进入你的 Cloudflare Pages 项目：

1. 打开 `Settings`
2. 找到 `Functions`
3. 找到 `D1 database bindings`
4. 点击 `Add binding`
5. 变量名必须填：`DB`
6. 数据库选择刚才创建的 `gis-flashcards-db`
7. 保存

注意：变量名必须是 `DB`，因为代码里使用的是 `env.DB`。

## 4. 部署

把以下文件推送到 GitHub：

- `index.html`
- `functions/api/sync.js`
- `schema-d1.sql`
- `CLOUDFLARE_D1.md`

Cloudflare Pages 会自动重新部署。

## 5. 测试

1. 打开 Cloudflare Pages 网址
2. 点击 `登录记录`
3. 输入姓名和学号
4. 做题、收藏、点击正确/错误
5. 回到 D1 数据库查看表数据

如果 `students`、`favorites`、`progress`、`answer_logs` 中出现数据，说明成功。

## 6. 当前安全级别

这是轻量课堂版：学生输入姓名和学号即可记录，没有密码。

适合：班级内部练习、低门槛使用。

如果后续公开给大量学生，建议升级为正式账号登录或增加管理后台。

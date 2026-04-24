# GIS 抽认卡部署说明

## 1. 创建 GitHub Pages

1. 登录 GitHub，新建仓库，例如 `gis-flashcards`。
2. 把 `flashcards.html` 上传到仓库根目录。
3. 建议把文件改名为 `index.html`，这样网址更短。
4. 打开仓库 `Settings` → `Pages`。
5. `Build and deployment` 选择 `Deploy from a branch`。
6. Branch 选择 `main` 和 `/root`，保存。
7. 等 1-3 分钟后，GitHub 会生成访问网址。

## 2. 创建 Supabase 云端数据库

1. 登录 https://supabase.com/ 并新建项目。
2. 进入项目后打开 `SQL Editor`。
3. 复制 `supabase-schema.sql` 的全部内容并运行。
4. 进入 `Project Settings` → `API`。
5. 复制：
   - `Project URL`
   - `anon public key`

## 3. 填入网页配置

打开 `flashcards.html`，找到：

```js
const supabaseConfig = {
  url: '',
  anonKey: ''
};
```

改成：

```js
const supabaseConfig = {
  url: '你的 Project URL',
  anonKey: '你的 anon public key'
};
```

保存后重新上传到 GitHub。

## 4. 学生使用方式

1. 学生打开 GitHub Pages 网址。
2. 点击 `登录记录`。
3. 输入姓名和学号。
4. 之后收藏、章节进度、答题日志会同步到 Supabase。

## 5. 查看学生数据

在 Supabase 的 `Table Editor` 查看：

- `students`：学生姓名和学号
- `favorites`：收藏的卡片
- `progress`：章节进度、正确/错误数
- `answer_logs`：每次答题记录

## 6. 重要提醒

当前是轻量课堂版：学生输入姓名/学号即可记录，没有密码校验。适合班级内部练习。

如果要正式发布给大量学生，建议升级为 Supabase Auth 登录，并把 RLS 策略改成只允许学生访问自己的数据。

# MSN News Link Extractor

这个项目使用GitHub Actions自动获取MSN新闻链接，并筛选出包含`ar-A`的URL，将结果保存为JSON文件。

## 工作原理

1. GitHub Actions按照预定的时间表（每12小时）或手动触发时运行
2. 脚本读取`http_head.txt`中的请求头信息
3. 使用这些请求头向MSN服务器发送请求
4. 从返回的数据中筛选出包含'ar-A'的URL
5. 将结果保存为`msn_news_links.json`文件，使用北京时间（UTC+8）格式记录时间戳
6. 如果过程中出现错误，会发送邮件通知（需配置邮箱信息）
7. 自动提交并推送更改到仓库

## 文件结构

- `http_head.txt`: 包含HTTP请求头信息
- `http_back.txt`: 包含HTTP响应示例（仅作参考）
- `.github/workflows/fetch_msn_news.yml`: GitHub Actions工作流配置
- `.github/scripts/fetch_msn_news.js`: 处理请求和数据的Node.js脚本
- `msn_news_links.json`: 输出的结果文件（自动生成）

## 本地测试

如果要在本地测试，可以运行：

```bash
npm install
npm run fetch
```

## 注意事项

- 请确保`http_head.txt`中的请求头信息是最新的
- GitHub Actions会自动运行，无需手动干预
- 也可以在GitHub仓库页面手动触发工作流
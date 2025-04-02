# 邮件通知设置指南

为了启用错误通知邮件功能，您需要在GitHub仓库中设置以下Secrets：

## 所需的Secrets

1. `EMAIL_USER` - 发送邮件的邮箱地址（例如：your-email@gmail.com）
2. `EMAIL_PASS` - 邮箱的应用专用密码或授权码（不是您的登录密码）
3. `EMAIL_TO` - 接收错误通知的邮箱地址

## 如何设置GitHub Secrets

1. 打开您的GitHub仓库
2. 点击 "Settings" 选项卡
3. 在左侧菜单中，点击 "Secrets and variables" 然后选择 "Actions"
4. 点击 "New repository secret" 按钮
5. 添加上述三个Secrets，每个都需要单独添加

## 邮箱设置说明

### Gmail用户

如果您使用Gmail，需要设置应用专用密码：

1. 登录您的Google账户
2. 前往 [安全性设置](https://myaccount.google.com/security)
3. 在"登录Google"部分，确保已启用两步验证
4. 然后点击"应用专用密码"
5. 生成一个新的应用专用密码并使用它作为 `EMAIL_PASS`

### 其他邮箱提供商

对于其他邮箱提供商，请查阅其文档了解如何设置SMTP访问和应用专用密码。

## 注意事项

- 脚本默认使用Gmail作为邮件服务。如需使用其他邮件服务，请修改`.github/scripts/fetch_msn_news.js`文件中的`service`配置。
- 确保您的邮箱允许第三方应用访问。
- 不要在代码中直接硬编码邮箱凭据，始终使用环境变量或Secrets。
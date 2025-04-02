const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 获取北京时间（UTC+8）
function getBeijingTime() {
  const now = new Date();
  // 获取UTC时间并加上8小时的毫秒数
  const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return beijingTime.toISOString().replace('T', ' ').replace(/\.[0-9]{3}Z$/, '');
}

// 发送错误通知邮件
async function sendErrorEmail(errorMessage) {
  // 检查是否设置了邮件环境变量
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailTo = process.env.EMAIL_TO;
  
  if (!emailUser || !emailPass || !emailTo) {
    console.error('邮件配置不完整，无法发送错误通知');
    return;
  }
  
  try {
    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: 'smtp.qq.com', // QQ邮箱SMTP服务器
      port: 465, // SMTP端口
      secure: true, // 使用SSL
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    // 邮件内容
    const mailOptions = {
      from: emailUser,
      to: emailTo,
      subject: 'MSN新闻链接获取失败通知',
      text: `获取MSN新闻时出错，时间：${getBeijingTime()}\n错误信息：${errorMessage}`,
      html: `<h3>MSN新闻链接获取失败</h3>
            <p><strong>时间：</strong>${getBeijingTime()}</p>
            <p><strong>错误信息：</strong>${errorMessage}</p>`
    };
    
    // 发送邮件
    const info = await transporter.sendMail(mailOptions);
    console.log('错误通知邮件已发送:', info.messageId);
  } catch (emailError) {
    console.error('发送错误通知邮件失败:', emailError.message);
  }
}

// 提取包含ar-A的URL并为每隔一个URL添加参数
function extractArAUrls(data) {
  const arAUrls = [];
  
  // 递归函数来遍历对象
  function findUrls(obj) {
    if (!obj) return;
    
    if (typeof obj === 'object') {
      // 如果是对象或数组，检查每个属性
      for (const key in obj) {
        // 检查是否有url属性且包含ar-A
        if (key === 'url' && typeof obj[key] === 'string' && obj[key].includes('ar-A')) {
          arAUrls.push(obj[key]);
        } else {
          // 递归检查子对象
          findUrls(obj[key]);
        }
      }
    }
  }
  
  findUrls(data);
  
  // 为每隔一个URL添加参数
  return arAUrls.map((url, index) => {
    // 为偶数索引的URL添加参数（0, 2, 4...）
    if (index % 2 === 0) {
      return url;
    } else {
      // 检查URL是否已有参数
      return url.includes('?') ? `${url}&ocid=sapphireappshare` : `${url}?ocid=sapphireappshare`;
    }
  });
}

// 生成请求URL
function generateRequestUrl() {
  // 使用固定的User ID，与cookie中的MUID值保持一致
  const userId = 'm-' + crypto.randomBytes(12).toString('hex').toUpperCase();
  
  // 生成随机的activityId (模拟UUID格式)
  const activityId = [
    crypto.randomBytes(4).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(6).toString('hex')
  ].join('-').toUpperCase();
  
  // 使用固定的apikey，这是MSN API的关键
  const apikey = '0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM';
  
  // 构建URL参数对象
  const params = {
    'User': userId,
    'activityId': activityId,
    'adoffsets': 'c1:-1,c2:-1,c3:-1',
    'apikey': apikey,
    'audienceMode': 'adult',
    'cm': 'zh-cn',
    'colstatus': 'c1:0,c2:0,c3:0',
    'column': 'c3',
    'colwidth': '300',
    'contentType': 'article,video,slideshow,webcontent',
    'it': 'edgeid',
    'l3v': '2',
    'layout': 'c3',
    'memory': '8',
    'newsSkip': '0',
    'newsTop': '48',
    'ocid': 'hponeservicefeed',
    'pgc': '11',
    'private': '1',
    'scn': 'APP_ANON',
    'timeOut': '1000',
    'vpSize': `${Math.floor(900 + Math.random() * 200)}x${Math.floor(700 + Math.random() * 100)}`,
    'wposchema': 'byregion'
  };
  
  // 构建URL查询字符串
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return `https://assets.msn.cn/service/news/feed/pages/weblayout?${queryString}`;
}

// 生成请求头
function generateHeaders() {
  // 使用固定的Chrome和Edge版本号
  const chromeVersion = '134.0.0.0';
  const edgeVersion = '134.0.0.0';
  
  // 生成随机的sec-ms-gec值
  const secMsGec = crypto.randomBytes(16).toString('hex').toUpperCase();
  
  // 生成随机的x-client-data值
  const clientData = {
    '1': '0',
    '2': '0',
    '3': '0',
    '4': crypto.randomBytes(8).toString('hex'),
    '6': 'stable',
    '9': 'desktop'
  };
  
  const encodedClientData = Buffer.from(JSON.stringify(clientData)).toString('base64');
  
  // 生成随机的MUID值，用于cookie和User参数
  const muid = crypto.randomBytes(12).toString('hex').toUpperCase();
  
  // 构建必要的cookie字符串
  const cookies = [
    'APP_ANON=A=B1471EC7882B01B553737A98FFFFFFFF',
    `MUID=${muid}`,
    'msnup=%7B%22cnex%22%3A%22no%22%7D',
    'aace=%7b%22child%22%3a0%2c%22expiredOn%22%3a%223025-09-24T07%3a43%3a47%22%7d',
    'els=%7b%22account_type%22%3a%22MSA%22%7d'
  ].join('; ');
  
  return {
    'host': 'assets.msn.cn',
    'sec-ch-ua-platform': '"Windows"',
    'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36 Edg/${edgeVersion}`,
    'accept': '*/*',
    'sec-ch-ua': `"Chromium";v="${chromeVersion.split('.')[0]}", "Not:A-Brand";v="24", "Microsoft Edge";v="${edgeVersion.split('.')[0]}"`,
    'sec-ch-ua-mobile': '?0',
    'origin': 'https://www.msn.cn',
    'x-edge-shopping-flag': '0',
    'sec-ms-gec': secMsGec,
    'sec-ms-gec-version': `1-${edgeVersion}`,
    'x-client-data': encodedClientData,
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://www.msn.cn/',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'cookie': cookies
  };
}

// 主函数
async function fetchMsnNews() {
  // 设置最大重试次数
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount < maxRetries) {
    try {
      // 动态生成请求URL和请求头
      const url = generateRequestUrl();
      const headers = generateHeaders();
      
      console.log(`正在从MSN获取新闻数据...（尝试 ${retryCount + 1}/${maxRetries}）`);
      
      // 发送请求，添加超时设置
      const response = await axios.get(url, { 
        headers,
        timeout: 30000, // 30秒超时
        validateStatus: status => status === 200 // 只接受200状态码
      });
      
      // 检查响应数据是否有效
      if (!response.data) {
        throw new Error('响应数据为空');
      }
      
      // 提取包含ar-A的URL
      const arAUrls = extractArAUrls(response.data);
      
      if (arAUrls.length === 0) {
        throw new Error('未找到包含ar-A的URL，可能是响应格式已变更');
      }
      
      console.log(`找到 ${arAUrls.length} 个包含 'ar-A' 的URL，已为每隔一个URL添加参数`);
      
      // 保存结果到JSON文件
      const outputPath = path.join(process.cwd(), 'links.json');
      fs.writeFileSync(outputPath, JSON.stringify({
        timestamp: getBeijingTime(), // 使用北京时间
        urls: arAUrls
      }, null, 2));
      
      console.log(`结果已保存到 ${outputPath}，使用北京时间：${getBeijingTime()}`);
      
      // 成功获取数据，退出循环
      return;
      
    } catch (error) {
      lastError = error;
      retryCount++;
      
      // 记录详细错误信息
      console.error(`获取MSN新闻时出错 (尝试 ${retryCount}/${maxRetries}):`, error.message);
      if (error.response) {
        console.error(`状态码: ${error.response.status}`);
        console.error(`响应头:`, JSON.stringify(error.response.headers, null, 2));
        console.error(`响应数据:`, error.response.data ? JSON.stringify(error.response.data).substring(0, 200) + '...' : '无数据');
      } else if (error.request) {
        console.error('请求已发送但未收到响应');
      }
      
      if (retryCount < maxRetries) {
        // 等待一段时间后重试
        const waitTime = 2000 * retryCount; // 递增等待时间
        console.log(`将在 ${waitTime/1000} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // 所有重试都失败
  console.error(`达到最大重试次数 (${maxRetries})，获取MSN新闻失败`);
  
  // 发送错误通知邮件
  await sendErrorEmail(lastError ? lastError.message : '未知错误');
  process.exit(1);
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  fetchMsnNews();
}

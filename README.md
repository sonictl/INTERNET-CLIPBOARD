# 互联网剪贴板

## 项目介绍

互联网剪贴板是一个简单高效的在线文本分享工具，允许用户创建、查看、编辑和分享文本内容。每个剪贴板都有唯一的ID，可以设置过期时间和阅后即焚功能，确保数据安全和隐私保护。

## 功能特点

- **文本分享**：支持创建和分享文本内容，单次最多支持28万字符
- **唯一ID**：每个剪贴板都有唯一的数字ID，方便查找和分享
- **过期设置**：支持设置剪贴板的过期时间（1天、3天、7天）
- **阅后即焚**：支持阅后即焚功能，查看一次后自动删除
- **自动延期**：剪贴板在有效期内有查看或修改操作会自动延长过期时间
- **复制下载**：支持一键复制内容和下载为文本文件
- **自动清理**：系统会自动清理过期的剪贴板数据

## 技术栈

### 前端

- Vue 3 + Vite：现代化的前端框架和构建工具
- Vue Router：前端路由管理
- Element Plus：UI组件库
- Axios：HTTP请求库
- Pinia：状态管理

### 后端

- Node.js + Express：后端服务框架
- SQLite3：轻量级数据库
- Body-parser：请求体解析中间件
- CORS：跨域资源共享

## 安装部署

### 前端部署

1. 克隆项目并安装依赖

```bash
git clone [项目地址]
cd INTERNET-CLIPBOARD
pnpm install  # 或 npm install
```

2. 开发环境运行

```bash
pnpm dev  # 或 npm run dev
```

3. 生产环境构建

```bash
pnpm build  # 或 npm run build
```

构建完成后，dist目录中的文件即为可部署的静态文件。

### 后端部署

1. 安装后端依赖

```bash
cd houtai
pnpm install  # 或 npm install
```

2. 启动后端服务

```bash
node app.js
```

服务将在3002端口启动。

## 配置说明

### 前端API请求配置

前端API请求配置位于 `src/utils/request.js`，默认配置为：

```js
export const request = axios.create({
  baseURL: "/api",  // 使用相对路径，通过Vite代理转发
  timeout: 5000,
});
```

在开发环境中，Vite会将`/api`代理到`http://localhost:3002`，配置位于`vite.config.js`：

```js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3002",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
},
```

在生产环境中，需要配置反向代理将`/api`路径转发到后端服务。

### 数据库配置

项目使用SQLite数据库，数据库文件会自动在后端目录下创建为`clipboard.db`。数据表结构如下：

```sql
CREATE TABLE IF NOT EXISTS clipboard (
  id TEXT PRIMARY KEY,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP DEFAULT NULL,
  expire_days INTEGER DEFAULT 1,
  burn_after_read BOOLEAN DEFAULT 0
);
```

## Caddy配置示例

使用Caddy作为Web服务器和反向代理，可以轻松处理HTTPS和API转发。以下是一个基本的Caddyfile配置示例：

```
yourdomain.com {
  # 启用HTTPS
  tls your@email.com
  
  # 静态文件服务（前端构建输出）
  root * /path/to/INTERNET-CLIPBOARD/dist
  
  # 处理Vue Router的历史模式
  try_files {path} /index.html
  
  # API请求转发到后端
  handle /api/* {
    uri strip_prefix /api
    reverse_proxy localhost:3002
  }
  
  # 启用压缩
  encode gzip
  
  # 文件服务
  file_server
}
```

### Vue Router适配说明

本项目使用Vue Router的历史模式（createWebHistory），需要在服务器配置中添加适当的重写规则，确保所有路由都能正确指向index.html。

在Caddy中，使用`try_files {path} /index.html`指令可以实现这一功能。

对于Nginx，可以使用以下配置：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

对于Apache，需要在.htaccess文件中添加：

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 使用说明

1. 访问首页，点击「重置」按钮创建新的剪贴板
2. 在剪贴板页面，输入要保存的文本内容
3. 选择过期时间（1天、3天或7天）
4. 点击保存按钮保存内容
5. 通过分享剪贴板的唯一ID，其他人可以访问该剪贴板
6. 使用右侧工具栏可以复制内容、下载为文本文件或删除剪贴板

## 注意事项

- 剪贴板内容在过期后会被自动删除
- 启用阅后即焚功能的剪贴板在被查看后将无法再次访问
- 为保护隐私，请在使用完毕后主动删除剪贴板
- 系统会每小时自动清理过期的剪贴板数据

## 开发者

互联网剪贴板由LUOZIHAO开发








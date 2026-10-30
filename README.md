# 阳润驰 · Rinch Portfolio

个人设计作品集。页面按 1920 × 1080 设计，手机与电脑共用相同排版，按屏幕等比缩放。包含六个项目的完整详情、环形目录、个人简介、简历与入场动效。

公开网站：https://rinch-portfolio.yangrunchi8.workers.dev/

备用网站：https://rinch-portfolio.netlify.app/

## 本地运行

```sh
npm install
npm run build
npm start
```

## 发布

`dist/` 包含可直接部署的完整静态网站与图片资源；`src/` 为对应 React 源码。Netlify 的构建设置见 `netlify.toml`。

Cloudflare Workers 静态部署配置见 `wrangler.toml`。连接本仓库后，构建命令使用 `npm run build`，部署命令使用 `npx wrangler deploy`；也可以直接上传 `dist/` 到 Cloudflare Pages。

本仓库保存已发布版本。Safari 兼容性实验尚未验证完成，未纳入本次上传。

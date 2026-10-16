# MyWebTools

一些自用的在线工具，使用 React + Vite 开发。

## 站点配置

修改根目录的 `site.config.ts`：

- `name`：站点名称，用于网页标题、导航、页脚、关于页和 PWA。
- `shortName`：安装应用后的短名称。
- `description`：PWA 应用说明。
- `icon`：源图路径，相对于项目根目录，默认 `assets/site-icon.png`。支持 PNG、JPEG、WebP、SVG 等 Sharp 支持的图片格式。

执行 `corepack pnpm build` 时，会从源图自动生成 16、32、180、192、512 像素的 PNG 图标和包含 16、32、48 像素图像的 `favicon.ico`，输出到 `dist/`。非正方形图片按中心裁剪为正方形，保持比例缩放；不需要手动准备各尺寸图标。源图不作为公共资源部署。

开发服务器也提供生成的图标，修改源图会重新生成并刷新页面。修改配置后需重新构建部署，已安装的 PWA 图标由浏览器更新。

特别感谢 Rex 大佬帮忙重构的部分代码~

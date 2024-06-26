# 免责声明: 本项目仅供学习交流使用，不得用于商业用途，如有侵权请联系删除

## 启动说明

  + 安装依赖

  ```bash
    npm install
  ```

  + 启动项目

  ```bash
    npm run dev
  ```

  + 加载插件

  1. 打开 Chrome 浏览器，输入 `chrome://extensions/` 进入插件管理页面 (edge 浏览器输入 `edge://extensions/`)

  2. 打开开发者模式

  3. 点击 `加载已解压的扩展程序`，选择项目中的 `dist` 目录

## 项目说明

  + [CRXJS](https://crxjs.dev/vite-plugin)

  + [谷歌插件文档](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world?hl=zh-cn)

```sh
  ⊢ dist                          # 打包后的文件 [插件文件]
  ⊢ public                        # 静态资源文件
    ⨽ images                      # 图片资源
    ⨽ manifest.json               # 插件配置文件 [重要]
    ⨽ inject.js                   # 注入脚本 [inject-script.js]
  ⊢ src                           # 源码文件
    ⨽ apis                        # 接口请求
    ⨽ background                  # 后台脚本 [background-script.js]
      ⨽ init.ts                   # 后台脚本入口
      ⨽ menus.ts                  # 右键菜单项
      ⨽ notifications             # 通知管理
      ⨽ service-worker.ts         # 后台脚本入口
    ⨽ content                     # 内容脚本 [content-script.js]
      ⨽ loginModal                # 登录Modal弹窗
      ⨽ navbar                    # 导航栏
      ⨽ sidebar                   # 通知管理
      ⨽ index.ts                  # 后台脚本入口
    ⨽ options                     # 配置页面 
    ⨽ request                     # 请求封装
    ⨽ utils                       # 工具函数
    ⨽ App.tsx                     # popup页面
    ⨽ global.ts                   # 全局变量
```

## 参考文献

  + [入门](https://juejin.cn/post/7035782439590952968)

  + [chrome extension ts提示](https://www.cnblogs.com/cc11001100/p/12350611.html)

  + [入门](https://zhuanlan.zhihu.com/p/678535335)

  + [跨域问题](https://juejin.cn/post/7071594888839561253)

  + [插件文档](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world?hl=zh-cn)

  + [CRXJS](https://crxjs.dev/vite-plugin)

  + `css` 中使用图片的路径问题: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts?hl=zh-cn#files

  + [whatsapp-web](https://wwebjs.dev/)

  + [开发者平台](https://business.whatsapp.com/developers/developer-hub)

  + [Chrome插件(扩展)开发全攻略](https://www.bookstack.cn/read/chrome-plugin-develop/spilt.1.8bdb1aac68bbdc44.md)

  + [使用 CRXJS、Vite、TypeScript、React、Zustand、Antd 开发 Chrome 浏览器插件——自带热加载，无需手动配置 vite.config.ts 文件](https://blog.csdn.net/guoqiankunmiss/article/details/137007691)

  + [Chrome插件(扩展)开发全攻略](https://www.cnblogs.com/liuxianan/p/chrome-plugin-develop.html)
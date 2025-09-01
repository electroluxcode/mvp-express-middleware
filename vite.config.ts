import { defineConfig, loadEnv, normalizePath } from "vite";
import type { UserConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
const path = { resolve };



const entryFileNamesFn = (chunkInfo: any) => {
  // 处理 node_modules 路径，重命名为 external 避免被 npm 忽略
  if (chunkInfo.name.includes('node_modules') 
    || chunkInfo.name.includes('dist') 
    || chunkInfo.name.includes('.pnpm')
    || chunkInfo.name.includes('build')   
  ) {
    return chunkInfo.name.replace(/node_modules/g, 'external')
    .replace(/dist/g, 'distLink')
    .replace(/\.pnpm/g, 'pnpmLink')
    .replace(/build/g, 'buildLink')
    .replace(/src/g, 'srcLink') + '.js';
  } 
  return '[name].js';
}

export default defineConfig((config): UserConfig => {
  process.env = {
    ...process.env,
    ...loadEnv(config.mode, process.cwd(), ["PORT"]),
  };
  const { PORT } = process.env;
  const isProd = config.mode === "production";
  return {
    resolve: {
      alias: [
        {
          find: "~antd",
          replacement: "antd",
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "src"),
        },
      ],
    },
    plugins: [
      react(),
      // dts({
      //   entryRoot: "./src/kk-adapt-export.ts",
      //   outDir: ["./dist/es", "./dist/lib"],
      //   tsconfigPath: "./tsconfig.json",
      // }),
    ],
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `
						@import "${normalizePath(path.resolve("./src/assets/style/mixin.less"))}";
					`,
        },
      },
      postcss: './postcss.config.js',
    },
    optimizeDeps: {
      holdUntilCrawlEnd: true,
      esbuildOptions: {
        drop: ["console"],
      },
      include: [
        'sharedb-client-browser/dist/sharedb-client-umd.cjs',
        'ottype-slate-test',
        'reconnecting-websocket',
      ],
      exclude: [
        'sharedb/lib/client',
        'sharedb',
        // 排除 markdown 相关包以避免 devlop 问题
        'remark-gfm',
        'remark-emoji', 
        'remark-math',
        'mdast-util-gfm-autolink-literal',
        // 'devlop' // 移除这个，让它被打包进去
      ]
    },
    define: {
      // 添加全局变量定义
      global: 'globalThis',
      'process.env': {},
      // 添加 Node.js 环境变量 polyfill
      'process.browser': true,
      'process.version': '"v16.0.0"',
    },
    server: {
      port: Number(PORT || 8080),
    },
    build: {
      // 打包文件目录
      outDir: "./dist",
      // 压缩
      minify: false,
      // 增加内存限制相关配置
      chunkSizeWarningLimit: 2000,
      target: ['es2018', 'chrome58', 'firefox57', 'safari11'],
      rollupOptions: {
        input: "./src/kk-adapt-export.ts",
        external: [
          // React 生态系统
          "react",
          "react-dom",
          "react/jsx-runtime",
          
          // UI 组件库
          "antd",
          "@ant-design/icons",
          /^@radix-ui\/.*/,
          "@ariakit/react",
          "lucide-react",
          "@tabler/icons-react",
          
          // Plate.js 相关
          // /^@platejs\/.*/,
          "platejs",
          // /^@udecode\/.*/,
          "@slate-yjs/react",
          
          // 表单和验证
          "react-hook-form",
          "@hookform/resolvers",
          "zod",
          /^@formily\/.*/,
          
          // 样式和动画
          "tailwind-merge",
          "class-variance-authority",
          "framer-motion",
          "next-themes",
          
          // 工具库
          "lodash",
          "date-fns",
          "dayjs",
          "dayjs/locale/zh-cn",
          "jotai",
          "ahooks",
          
          // 国际化
          "i18next",
          "react-i18next",
          
          // 文件处理
          "pdf-lib",
          "html2canvas-pro",
          "exceljs",
          "uploadthing",
          "@uploadthing/react",
          "use-file-picker",
          
          // 编辑器相关
          "prismjs",
          "lowlight",
          "cmdk",
          // "@udecode/cmdk",
          "react-syntax-highlighter",
          "react-textarea-autosize",
          
          // AI 和数据处理
          "ai",
          "@ai-sdk/openai",
          "@faker-js/faker",
          
          // 协作和实时
          "@hocuspocus/provider",
          "sharedb-client-browser",
          "y-webrtc",
          
          // Next.js 相关
          "next",
          "@next/third-parties",
          "next-contentlayer2",
          "contentlayer2",
          
          // 媒体和内容
          "react-player",
          "react-lite-youtube-embed",
          "react-tweet",
          "react-markdown",
          "react-day-picker",
          
          // 拖拽
          "react-dnd",
          "react-dnd-html5-backend",
          
          // Markdown 相关 - 添加这些来解决 devlop 问题
          "remark-emoji",
          "remark-gfm", 
          "remark-math",
          /^remark-.*/,
          /^rehype-.*/,
          /^mdast-.*/,
          /^micromark-.*/,
          /^unist-.*/,
          // "devlop", // 移除这个，让它被打包进去
          
          // 其他工具
          "dotenv",
          "node-fetch",
          "crypto-browserify",
          "stream-browserify",
          "fumadocs-core",
          "fzf",
          "nuqs",
          "sonner",
          "vaul",
          "react-wrap-balancer",
          "react-resizable-panels",
          "ts-morph",
          
          // 其他
          "sass",
          "shadcn",
          "shadcn-prose",
          "@emoji-mart/data",
          
          // 日期选择器
          "rc-picker",
          
          // SVG
          "react-svg"
        ],
        plugins: [
        ],
        output: [
          {
            // 打包格式
            format: "es",
            // 打包后文件名
            entryFileNames: entryFileNamesFn,
            // 让打包目录和我们目录对应
            preserveModulesRoot: "src",
            inlineDynamicImports: false,
            exports: "named",
            // 配置打包根目录
            dir: "./dist/es",
            preserveModules: false,
            // 移除 preserveEntrySignatures 以避免与 preserveModules 冲突
          },
          // {
          //   // 打包格式
          //   format: "cjs",
          //   // 打包后文件名
          //   entryFileNames: "[name].js",
          //   exports: "named",
          //   // 配置打包根目录
          //   dir: "./dist/lib",
          //   // CJS 格式不使用 preserveModules
          // },
        ],
      },
    },
  };
});

## 背景

### 问题表现

1. **应用层面**：PC/Mobile 端审批详情页面在部分用户环境下无法正常打开，测试环境中 Office 编辑功能表现异常。频繁出现难以复现的缓存问题，通常刷新页面后问题暂时消失。

2. **开发层面**：开发环境与生产环境的表现存在差异，即使在 pre 和 release 环境代码完全一致的情况下，呈现出来两个环境的行为仍然不一致。

### 问题本质

经过分析，以上两个现象实际上是同一个根本问题的不同表现形式。问题的核心在于生产环境与开发环境的配置不一致，导致静态资源缓存策略出现偏差。

## 原因分析与排查步骤

### 问题定位

经过排查，确认问题根源在于 Server 端顶层中间件的设计缺陷。

### 排查过程

1. **逐步排除**：将生产环境的路由逐个移除，各种 Provider 也逐个剔除，最终简化至仅渲染一个基础组件，但问题依然存在。这说明问题不在业务逻辑层，而在服务器配置层。

2. **对比分析**：鉴于开发环境与生产环境表现不同，克隆了 Vite 官方仓库，深入分析 dev-server 和 build-server 的请求处理链路。

3. **dev-server 验证**：magic-web 项目的 dev-server 链路未进行定制化修改，因此开发环境的中间件配置基本正确。

4. **build-server 分析**：检查 build-server 的链路时，发现了关键差异。Vite 官方在处理 HTML 交互时的关键代码如下： 

**参考链接**：[Vite Preview Server 源码](https://github.com/electroluxcode/vite/blob/46d3077f2b63771cc50230bc907c48f5773c00fb/packages/vite/src/node/preview.ts#L264-L277)

### Vite 官方中间件配置

在 Vite 的 build server 中，中间件的加载顺序如下：

1. **资源中间件**：`viteAssetMiddleware` - 优先处理静态资源请求
2. **HTML 回退中间件**：`htmlFallbackMiddleware` - 处理 路由 相关 对应 `magic-web`  的 `app.use(history `
3. **HTML 资源中间件**：`indexHtmlMiddleware` - 处理 HTML 入口文件 对应 `magic-web`  的 `express.static`

### 当前项目的中间件配置

我们的 server 中间件定义在 `server/routes/index.js` 文件中，关于 HTML 处理的关键代码如下：

**1. HTML 中间件**
```ts
app.use(
    history({
        index: "/index.html",
    }),
)
```

**2. 静态资源中间件**
```ts
express.static(path.join(rootPath, "../dist"))
```

### 问题根因

**关键缺陷**：我们的配置缺少了 Vite 官方的第一步——**静态资源优先处理中间件**。

这导致在某些情况下，静态资源请求会被 HTML 回退中间件错误拦截，造成资源缓存策略失效，进而引发前端资源更新不及时的问题。


## 复现流程

可以在本地构建 magic-web 的生产环境进行复现。为了便于演示，这里提供了一个精简的 Mini Repo 用于快速验证。

**仓库地址**：https://github.com/electroluxcode/mvp-express-middleware

### 复现步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动服务**
   ```bash
   node main.js
   ```

3. **建立初始缓存**
   
   分别访问以下两个页面，让浏览器建立资源缓存：
   - http://localhost:3010/onlyoffice （正确配置）
   - http://localhost:3011/onlyoffice （错误配置）
   
   此时两个页面均能正常加载并执行 `dist/app.js` 中的资源。

4. **修改静态资源**
   
   修改 `dist/app.js` 文件，例如将内容改为：
   ```javascript
   alert("222222222")
   ```

5. **观察更新差异**
   
   再次访问步骤 3 中的两个页面，会发现：
   - **正确配置**：能够正常加载更新后的资源
   - **错误配置**：仍然使用旧的缓存资源

6. **验证缓存机制**
   
   - **开启 Disable Cache**：两个页面的行为一致，均能加载最新资源
   - **关闭 Disable Cache**：错误配置的页面会持续复用旧缓存，导致新代码逻辑无法生效

### 现象总结

错误的中间件配置顺序导致浏览器的缓存策略无法正确触发，使得静态资源更新后，客户端仍然使用过期的缓存版本，从而引发各种不可预期的行为异常。

## 解决方案

### 调整中间件顺序

参照 Vite 官方的最佳实践，调整 Express 中间件的加载顺序，确保静态资源中间件在 HTML 回退中间件之前加载：

```javascript
// 1. 首先加载静态资源中间件（优先级最高）
app.use(express.static(path.join(rootPath, "../dist")));

// 2. 然后加载 HTML 回退中间件
app.use(
    history({
        index: "/index.html",
    })
);

// 3. 再次声明静态资源中间件（处理回退后的 HTML 请求）
app.use(express.static(path.join(rootPath, "../dist")));
```

### 预期效果

修复后，生产环境和开发环境的行为将保持一致，静态资源更新后浏览器能够正确获取最新版本，不再出现缓存导致的各种异常现象。

## 总结

此问题影响所有使用了该服务端配置的生产环境， 从 magic-web 这个项目诞生之处就存在，最近随着 审批的用户量上来了，而使得问题 更加突出和尖锐
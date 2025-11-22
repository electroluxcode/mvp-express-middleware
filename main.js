const express = require("express")
const history = require("connect-history-api-fallback")
const path = require("path")

// ========================================
// ❌ 错误：缺少第一个 static
// ========================================
const appWrong = express()

appWrong.use(history({ 
  index: "/index.html"
}))
appWrong.use(express.static(path.join(__dirname, "dist")))

// ========================================
// ✅ 正确：完整配置
// ========================================
const appCorrect = express()

appCorrect.use(express.static(path.join(__dirname, "dist")))
appCorrect.use(history({ index: "/index.html" }))
appCorrect.use(express.static(path.join(__dirname, "dist")))

// ========================================
// 启动
// ========================================
appWrong.listen(3010, () => {
  console.log("\n" + "=".repeat(60))
  console.log("🧪 测试：在浏览器中打开")
  console.log("=".repeat(60))
  console.log("\n❌ 错误配置: http://localhost:3010/onlyoffice")
  console.log("\n✅ 正确配置: http://localhost:3011/onlyoffice")
  console.log("=".repeat(60) + "\n")
})
appCorrect.listen(3011)

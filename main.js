const express = require("express")
const history = require("connect-history-api-fallback")
const path = require("path")

const config = (log, isSetCache=false)=>{

  return express.static(path.join(__dirname, "dist"),{
    setHeaders: (res, pathname) => {
      console.log(log)
      const excludeReg = [
        /sw\.js$/,
        /\.html$/,
        /registerSW\.js$/,
        /favicon\.svg$/,
        /manifest\.webmanifest$/,
      ]
      // Pages to not cache
      if (excludeReg.some((o) => o.test(pathname))) {
        // Custom Cache-Control for HTML files
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        res.setHeader("Pragma", "no-cache")
        res.setHeader("Expires", "0")
      } else {
        if(isSetCache){
          res.setHeader("Cache-Control", "max-age=31536000")
        }
      }
    },
  })
}
// ========================================
// ❌ 错误：缺少第一个 static
// ========================================
const appWrong = express()

appWrong.use(history({ 
  index: "/index.html"
}))
appWrong.use(config("after history static", true))

// ========================================
// ✅ 正确：完整配置
// ========================================
const appCorrect = express()

appCorrect.use(config("before history static", ))
appCorrect.use(history({ index: "/index.html" }))
appCorrect.use(config("after history static", true) )

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

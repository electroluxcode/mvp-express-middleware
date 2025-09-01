/**
 *react应用入口
 */

import { createRoot } from "react-dom/client";
import App from "./app";

// 导入 Tailwind CSS 样式
import "./index.css";


const container = document.querySelector("#root");
if (!container) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(container);
root.render(<App />);

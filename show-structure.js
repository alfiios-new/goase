import fs from "fs";
import path from "path";

const ignore = ["node_modules", ".git", "dist"];

function formatSize(bytes) {
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0B";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i)) + sizes[i];
}

function showTree(dir, indent = "") {
  let items = fs.readdirSync(dir);

  items.forEach((item, index) => {
    if (ignore.includes(item)) return;

    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    const isLast = index === items.length - 1;

    const treePrefix = isLast ? "└── " : "├── ";
    const nextIndent = indent + (isLast ? "    " : "│   ");

    if (stats.isDirectory()) {
      console.log(indent + treePrefix + item + "/");
      showTree(fullPath, nextIndent);
    } else {
      console.log(
        indent + treePrefix + item + " (" + formatSize(stats.size) + ")"
      );
    }
  });
}

console.log("📁 Project Structure:\n");
showTree(process.cwd());

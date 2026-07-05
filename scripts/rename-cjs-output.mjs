import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist-cjs");

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".js")) {
    continue;
  }
  const jsPath = path.join(root, entry.name);
  const cjsPath = path.join(root, entry.name.replace(/\.js$/, ".cjs"));
  const source = fs
    .readFileSync(jsPath, "utf8")
    .replace(/require\("(\.\/[^"]+)\.js"\)/g, 'require("$1.cjs")')
    .replace(/sourceMappingURL=(.+)\.js\.map/g, "sourceMappingURL=$1.cjs.map");
  fs.writeFileSync(cjsPath, source);
  fs.rmSync(jsPath);

  const mapPath = `${jsPath}.map`;
  if (fs.existsSync(mapPath)) {
    fs.renameSync(mapPath, `${cjsPath}.map`);
  }
}

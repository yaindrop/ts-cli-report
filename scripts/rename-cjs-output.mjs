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

for (const entry of fs.readdirSync(path.resolve("dist"), {
  withFileTypes: true,
})) {
  if (!entry.isFile() || !entry.name.endsWith(".d.ts")) {
    continue;
  }
  const sourcePath = path.resolve("dist", entry.name);
  const declarationPath = path.join(
    root,
    entry.name.replace(/\.d\.ts$/, ".d.cts"),
  );
  const source = fs
    .readFileSync(sourcePath, "utf8")
    .replace(/from "(\.\/[^"]+)\.js"/g, 'from "$1.cjs"');
  fs.writeFileSync(declarationPath, source);

  const mapPath = `${sourcePath}.map`;
  if (fs.existsSync(mapPath)) {
    fs.copyFileSync(
      mapPath,
      path.join(root, entry.name.replace(/\.d\.ts$/, ".d.cts.map")),
    );
  }
}

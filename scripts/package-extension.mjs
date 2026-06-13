import { createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import yazl from "yazl";

const rootDir = process.cwd();
const distDir = join(rootDir, "dist");
const releaseDir = join(rootDir, "release");
const packageJson = JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));
const zipPath = join(releaseDir, `weblens-v${packageJson.version}.zip`);

const buildCommand = process.platform === "win32" ? "cmd.exe" : "npm";
const buildArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm run build"] : ["run", "build"];
const build = spawnSync(buildCommand, buildArgs, {
  cwd: rootDir,
  stdio: "inherit"
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

await mkdir(releaseDir, { recursive: true });

const zip = new yazl.ZipFile();
await addDirectoryToZip(zip, distDir);

const output = createWriteStream(zipPath);
zip.outputStream.pipe(output);
zip.end();

await new Promise((resolve, reject) => {
  output.on("close", resolve);
  output.on("error", reject);
});

console.log(`Created ${relative(rootDir, zipPath)}`);

async function addDirectoryToZip(zipFile, directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    const zipEntryPath = relative(base, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      await addDirectoryToZip(zipFile, fullPath, base);
      continue;
    }

    const fileStat = await stat(fullPath);
    if (fileStat.isFile()) {
      zipFile.addFile(fullPath, zipEntryPath);
    }
  }
}

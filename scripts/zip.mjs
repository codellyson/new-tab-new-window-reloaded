import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"));
const out = `new-tab-new-window-reloaded-v${manifest.version}.zip`;

const command =
    `Import-Module Microsoft.PowerShell.Archive; ` +
    `Compress-Archive -Path 'dist/*' -DestinationPath '${out}' -Force`;

let packaged = false;
for (const shell of ["pwsh", "powershell"]) {
    const result = spawnSync(shell, ["-NoProfile", "-Command", command], {
        stdio: "inherit",
    });
    if (result.status === 0) {
        packaged = true;
        break;
    }
}

if (!packaged) {
    console.error(
        "Failed to create zip. Manually compress the contents of dist/ instead."
    );
    process.exit(1);
}
console.log(`packaged -> ${out}`);

export const execPrefix = {
  pnpm: "pnpx",
  bun: "bunx --bun",
};

export const bunfigContent = '[install]\nlinker = "isolated"';
export const pnpmWorkspaceContent = "packages:\n - apps/*\n - packages/*";

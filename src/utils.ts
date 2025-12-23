import packageJson from '../package.json' with { type: 'json' };

export function showHelp() {
  console.log(`
Usage:
  bun cli.ts [options] [-- extra args]

Options:
  -r, --relay             Start a p2p relay server
  -n, --name <string>     Set your name (default: "World")
  -m, --mode <string>     Choose mode: "dev" | "prod" (default: "dev")
  -v, --version           Show version
  -h, --help              Show this help message
      --verbose           Enable verbose output

Examples:
  bun cli.ts --name Alice
  bun cli.ts -m prod --verbose
  bun cli.ts -- --extra something
  bun cli.ts relay
`);
}

export function showVersion() {
  const pkg = packageJson as unknown as { version?: string };
  console.log(pkg.version ?? '0.0.0');
}

#!/usr/bin/env sh
set -eu

required_node='22.12.0'

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo 'Node.js 22.12 or newer is required. Install it from https://nodejs.org/ and run this installer again.' >&2
  exit 1
fi

node_version="$(node --version | sed 's/^v//')"
node -e "const [a,b,c] = process.argv[1].split('.').map(Number); const [x,y,z] = process.argv[2].split('.').map(Number); process.exit(a > x || (a === x && (b > y || (b === y && c >= z))) ? 0 : 1)" "$node_version" "$required_node" || {
  echo "Node.js $required_node or newer is required. Detected $node_version." >&2
  exit 1
}

npm install --global scorpion-cli@latest
echo 'Scorpion CLI installed successfully.'
echo 'Run: scorpion'

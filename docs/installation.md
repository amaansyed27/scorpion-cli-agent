# Installation and updates

Scorpion is a Node.js CLI that uses a local Ollama installation. It supports Windows, macOS, and Linux.

## Requirements

- Node.js 22.12 or newer
- [Ollama](https://ollama.com/download)
- At least one downloaded Ollama model

For example:

```bash
ollama pull qwen3.5:0.8b
```

## npm

Install Scorpion globally:

```bash
npm install --global scorpion-cli
scorpion
```

Update an existing installation:

```bash
npm update --global scorpion-cli
```

## npx

Run the current package without a global installation:

```bash
npx scorpion-cli
```

## One-line installers

PowerShell:

```powershell
irm https://raw.githubusercontent.com/amaansyed27/scorpion-cli-agent/v0.1.3/install.ps1 | iex
```

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/amaansyed27/scorpion-cli-agent/v0.1.3/install.sh | sh
```

## Run from source

```bash
git clone https://github.com/amaansyed27/scorpion-cli-agent.git
cd scorpion-cli-agent
npm install
npm start
```

Use `scorpion --help` to see command-line options and `/help` inside the interactive CLI for session commands.

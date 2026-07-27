# Scorpion CLI 🦂

An end-to-end **agentic AI assistant** for your terminal, refined for **speed**, **aesthetics**, and **intelligence**.

Powered by [Ollama](https://ollama.com) and **qwen3.5:0.8b**, Scorpion doesn't just chat—it takes action, manages your system, and researches the web for you **(for free, without API keys)**.

```
  ███████╗ ██████╗ ██████╗ ██████╗ ██████╗ ██╗ ██████╗ ███╗   ██╗
  ██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗██║██╔═══██╗████╗  ██║
  ███████╗██║     ██║   ██║██████╔╝██████╔╝██║██║   ██║██╔██╗ ██║
  ╚════██║██║     ██║   ██║██╔══██╗██╔═══╝ ██║██║   ██║██║╚██╗██║
  ███████║╚██████╗╚██████╔╝██║  ██║██║     ██║╚██████╔╝██║ ╚████║
  ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

## ✨ Key Features

- **🌐 Free & Private Web Search**: Builit-in scraping engine uses **DuckDuckGo**, **Bing**, and **Google News** to find real-time information without requiring any paid API keys.
- **🧠 Smart Agent Core**: Automatically detects when it needs to search the web (for events after 2023) vs. using internal knowledge.
- **🔬 Deep Research Mode**: A dedicated tool that scans **arXiv** (papers), **Hacker News** (tech discussions), and **Wikipedia** to generate comprehensive, cited reports.
- **⚡ Local & Fast**: Runs entirely on your machine using Ollama. No data leaves your system except for anonymous search queries.
- **🎨 Beautiful UI**: Rich ASCII tables, interactive spinners, live progress updates, and structured markdown rendering.
- **🔧 System Control**: Execute commands, manage files, check system performance (CPU/RAM), and write code directly to files.

[![npm version](https://img.shields.io/npm/v/scorpion-cli?logo=npm)](https://www.npmjs.com/package/scorpion-cli)
[![GitHub release](https://img.shields.io/github/v/release/amaansyed27/scorpion-cli-agent)](https://github.com/amaansyed27/scorpion-cli-agent/releases)

Scorpion is a local AI agent CLI for Windows, macOS, and Linux. Powered by [Ollama](https://ollama.com), it provides interactive local model selection, web research, file and system tools, and persistent session settings without requiring a paid AI API.

Use Scorpion from any terminal to chat with locally available Ollama models, run deep research, inspect your system, and work with files.

## What It Can Do

- **"Research the latest developments in quantum computing"** (Triggers Deep Research)
- **"What's the current stock price of NVIDIA?"** (Triggers Web Search)
- **"Check my system CPU usage"** (Triggers System Tools)
- **"Create a Python script for a discord bot"** (Triggers File Tools)

## Requirements

- **Node.js** 22.12+
- [Ollama](https://ollama.com/download) running locally
- **qwen3.5:0.8b** model (recommended):
  ```bash
  ollama pull qwen3.5:0.8b
  ```

## Quick Start

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd scorpion-cli-2
   npm install
   ```

2. **Run Scorpion**
   ```bash
   npm start
   ```
   *No API keys required! It works straight out of the box.*

### Install from npm

Scorpion can be installed on Windows, macOS, and Linux:

```bash
# Global npm install
npm install --global scorpion-cli@0.1.3
scorpion

# Run without installing globally
npx scorpion-cli@0.1.3
```

PowerShell:

```powershell
irm https://raw.githubusercontent.com/amaansyed27/scorpion-cli-agent/v0.1.3/install.ps1 | iex
scorpion
```

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/amaansyed27/scorpion-cli-agent/v0.1.3/install.sh | sh
scorpion
```

The current `https://aish.dawnlightlabs.com/install.ps1` endpoint belongs to AiSH and should not be used for Scorpion. Configure a separate Scorpion subdomain, such as `https://scorpion.dawnlightlabs.com/install.ps1`, to serve these installer files if you want a branded short URL.

Scorpion is distributed as one Node.js package rather than separate native binaries, so the same release works across all three platforms. Ollama must still be installed and running locally.

## Documentation

- [Installation and updates](docs/installation.md)
- [Model selection and persistent settings](docs/model-selection.md)

## 🎯 Usage & Power Commands

Scorpion uses a natural language interface, but also supports powerful triggers for specific workflows:

Inside the interactive session, slash commands control the session:

```text
/list                 List installed Ollama models
/model                Interactively select an installed model
/model <name>         Switch directly to a model
/settings             Show the active model and settings
/think on|off|toggle  Enable or disable visible thinking output
/help                 Show all commands
/clear                Clear conversation history
/stats, /reports      Show session statistics or saved reports
/export [md|json]     Export the last report
/demo                 Show UI features
/exit                 Quit Scorpion
```

The model chosen through `/model` is saved locally and reused the next time Scorpion starts. Use `--model <name>` to override it for one launch.

### **1. Deep Research Mode** (`@deep`)
Triggers an in-depth analysis session. It searches multiple sources, reads simplified content, and compiles a structured report with citations.

```bash
> @deep The impact of AI agents on software engineering jobs
```
*Also triggered by asking to "research", "analyze", or "explain in detail".*

### **2. Quick Response** (`@quick`)
Forces a fast answer without searching the web, using only the model's internal knowledge.

```bash
> @quick Explain the concept of recursion
```

### **3. System & Files**
Directly interact with your OS.

```bash
> show my memory usage
> list files in the current directory
> create a README.md file for a react project
```

## 🛠️ Configuration

Scorpion works with default settings, but you can configure it via environment variables if needed:

- `OLLAMA_HOST`: Set if your Ollama instance is not on `localhost:11434`.
- `OLLAMA_MODEL`: Override the default `qwen3.5:0.8b` model.

## Troubleshooting

- **"Model not found"**: Run `ollama pull qwen3.5:0.8b` (or your preferred model) first.
- **"Connection failed"**: Ensure Ollama is running (`ollama serve`).

## Built With

- **Ollama** - Local AI inference
- **Cheerio** - specialized web scraping & parsing
- **Node.js** - Runtime & System Interaction
- **Ora/Chalk** - Terminal styling & Animations

## License

MIT

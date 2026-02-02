# Scorpion CLI 🦂

An end-to-end **agentic AI assistant** for your terminal, refined for **speed**, **aesthetics**, and **intelligence**.

Powered by [Ollama](https://ollama.com) and **qwen3:8b**, Scorpion doesn't just chat—it takes action, manages your system, and researches the web for you **(for free, without API keys)**.

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

## What It Can Do

- **"Research the latest developments in quantum computing"** (Triggers Deep Research)
- **"What's the current stock price of NVIDIA?"** (Triggers Web Search)
- **"Check my system CPU usage"** (Triggers System Tools)
- **"Create a Python script for a discord bot"** (Triggers File Tools)

## Requirements

- **Node.js** 18+
- [Ollama](https://ollama.com/download) running locally
- **qwen3:8b** model (recommended):
  ```bash
  ollama pull qwen3:8b
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

## 🎯 Usage & Power Commands

Scorpion uses a natural language interface, but also supports powerful triggers for specific workflows:

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
- `OLLAMA_MODEL`: Override the default `qwen3:8b` model.

## Troubleshooting

- **"Model not found"**: Run `ollama pull qwen3:8b` (or your preferred model) first.
- **"Connection failed"**: Ensure Ollama is running (`ollama serve`).

## Built With

- **Ollama** - Local AI inference
- **Cheerio** - specialized web scraping & parsing
- **Node.js** - Runtime & System Interaction
- **Ora/Chalk** - Terminal styling & Animations

## License

MIT

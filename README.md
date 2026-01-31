# Scorpion CLI 🦂

An end-to-end **agentic AI assistant** for your terminal, refined for **speed**, **aesthetics**, and **intelligence**.

Powered by [Ollama](https://ollama.com) and **qwen3:8b**, Scorpion doesn't just chat—it takes action, manages your system, and researches the web for you.

```
  ███████╗ ██████╗ ██████╗ ██████╗ ██████╗ ██╗ ██████╗ ███╗   ██╗
  ██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗██║██╔═══██╗████╗  ██║
  ███████╗██║     ██║   ██║██████╔╝██████╔╝██║██║   ██║██╔██╗ ██║
  ╚════██║██║     ██║   ██║██╔══██╗██╔═══╝ ██║██║   ██║██║╚██╗██║
  ███████║╚██████╗╚██████╔╝██║  ██║██║     ██║╚██████╔╝██║ ╚████║
  ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

## ✨ New Features

- **🧠 Smart Agent Core**: Automatically detects when it needs to search the web for up-to-date info vs. using internal knowledge.
- **🎨 Refined UI/UX**: Beautiful ASCII tables, interactive spinners, and structured markdown output.
- **⚡ Proactive & Dynamic**: The system prompt now adapts to the current date/time and enforces strict formatting rules for clarity.

## What It Can Do

- 🌐 **Smart Web Research** - "Search for the latest AI news" (Auto-searches if knowledge is outdated)
- 🔧 **System Control** - Execute PowerShell commands, manage processes, check logs
- 📁 **File Operations** - Create, read, edit, and analyze files with ease
- 📊 **System Analysis** - Visual performance reports (CPU, RAM, Disk)
- 📝 **Structured Reports** - Generates clean, formatted summaries and documents

## Requirements

- Node.js 18+
- [Ollama](https://ollama.com/download) running locally
- qwen3:8b model: `ollama pull qwen3:8b`
- *(Optional)* Ollama API Key for Web Search capabilities

## Quick Start

```bash
cd scorpion-cli-2
npm install
npm start
```

## Usage Examples

**1. System Analysis (Formatted Tables)**
```
  > show my system performance

  ◆ Checking CPU usage...
  ◆ Checking memory usage...

  ┌───────────────┬────────────────────────────────────────┐
  │ Metric        │ Value                                  │
  ├───────────────┼────────────────────────────────────────┤
  │ CPU Usage     │ 23% (8 cores)                          │
  │ Memory        │ 12.4 GB / 32 GB (39%)                  │
  │ Disk (C:)     │ 234 GB free / 512 GB                   │
  └───────────────┴────────────────────────────────────────┘
```

**2. Smart Web Search**
```
  > what happened in the tech world yesterday?

  ◆ Searching the web for: "tech news yesterday [current-date]"
  ◆ Reading: techcrunch.com...
  ◆ Reading: theverge.com...

  ## Tech News Roundup
  > Key Insight: Major breakthroughs in AI agents and new hardware releases defined the news cycle.

  - **Company X** released a new open-source model...
  - **Product Y** was announced with...
```

**3. File Creation**
```
  > create a python script that calculates fibonacci

  ◆ Generating code...
  ◆ Writing to file: fib.py

  Done! Created fib.py
```

## 🎯 Interactive Commands

Inside the CLI, you can use special triggers to control the agent:

### **Power Triggers**

- **`@deep <query>`** (or **`@deepresearch`**)
  *Triggers Deep Research Mode: searches arXiv, Wikipedia, & web for comprehensive reports.*
  
- **`@quick <query>`** (or **`@fast`**)
  *Forces a quick response without searching the web.*

> **Note:** Scorpion automatically enables Deep Research if you ask to "research", "analyze", or "explain in detail".

### **Utilities**

- `help` / `?` : Show help menu
- `demo` : Run a UI features demo
- `stats` : Show session statistics
- `reports` : List saved reports
- `export md` : Export last output to Markdown
- `clear` : Reset conversation
- `exit` : Quit

## Configuration

**Web Search Setup**
To enable the agent's ability to search the live web, set your Ollama API key:

```powershell
$env:OLLAMA_API_KEY = "your-key-here"
npm start
```

## CLI Options

```bash
npm start                    # Interactive mode
node src/index.js --think    # Show the AI's hidden thought process
node src/index.js --check    # Check connection and model status
```

## Built With

- **Ollama** - Local AI inference & Tool Calling
- **qwen3:8b** - Powerful small-model logic
- **Node.js** - Runtime & System Interaction
- **ora/chalk** - Terminal styling & Animations

## License

MIT

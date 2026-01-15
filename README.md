# Scorpion CLI 🦂

An end-to-end **agentic AI assistant** for your terminal, powered by [Ollama](https://ollama.com) and **qwen3:8b**.

Just type what you want in plain English - Scorpion figures out how to do it.

```
  ███████╗ ██████╗ ██████╗ ██████╗ ██████╗ ██╗ ██████╗ ███╗   ██╗
  ██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗██║██╔═══██╗████╗  ██║
  ███████╗██║     ██║   ██║██████╔╝██████╔╝██║██║   ██║██╔██╗ ██║
  ╚════██║██║     ██║   ██║██╔══██╗██╔═══╝ ██║██║   ██║██║╚██╗██║
  ███████║╚██████╗╚██████╔╝██║  ██║██║     ██║╚██████╔╝██║ ╚████║
  ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

## What It Can Do

- 🔧 **Run commands** - Execute PowerShell, manage processes
- 📁 **Manage files** - Create, read, write, search files
- 📊 **Analyze system** - CPU, memory, disk usage, performance reports
- 🌐 **Research topics** - Search the web, fetch pages, synthesize info
- 📝 **Create documents** - Reports, summaries, formatted output

## Requirements

- Node.js 18+
- [Ollama](https://ollama.com/download) running locally
- qwen3:8b model: `ollama pull qwen3:8b`

## Quick Start

```bash
cd scorpion-cli-2
npm install
npm start
```

## Usage

Just type naturally:

```
  > show my system performance

  ◆ Checking CPU usage...
  ◆ Checking memory usage...
  ◆ Checking disk usage...

  Your system is running well:
  - CPU: 23% usage (8 cores)
  - Memory: 12.4 GB / 32 GB (39%)
  - Disk C: 234 GB free / 512 GB
```

```
  > create a file called notes.txt with today's meeting notes

  ◆ Creating file: notes.txt

  Done! Created notes.txt with your meeting notes template.
```

```
  > search for the latest news about AI coding assistants

  ◆ Searching the web for: "latest AI coding assistants news"
  ◆ Fetching: techcrunch.com/ai-coding-tools...

  Here's what I found about AI coding assistants...
```

## Commands

| Command | Description |
|---------|-------------|
| `exit` | Quit Scorpion |
| `clear` | Clear conversation history |

## CLI Options

```bash
# Interactive mode (default)
npm start

# Single query
node src/index.js --query "show disk usage"

# Show AI thinking process
node src/index.js --think

# Use different model
node src/index.js --model qwen3:32b

# Check connection
node src/index.js --check
```

## Web Search

For web search, get an API key from [ollama.com/settings/keys](https://ollama.com/settings/keys):

```powershell
$env:OLLAMA_API_KEY = "your-key"
npm start
```

## Built With

- **Ollama** - Local AI inference
- **qwen3:8b** - Excellent tool-calling model with thinking mode
- **Node.js** - Runtime
- **chalk/gradient-string** - Beautiful terminal output

## License

MIT

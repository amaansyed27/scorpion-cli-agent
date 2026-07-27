# Model selection and persistent settings

Scorpion reads the models installed in your local Ollama instance. Start the CLI, then use:

```text
/list
```

to see installed models and:

```text
/model
```

to select one interactively. You can also switch directly:

```text
/model qwen3.5:4b
```

The selected model is saved locally and automatically reused on the next launch.

## Settings file

By default Scorpion stores settings in:

```text
~/.scorpion/config.json
```

Use `/settings` to display the active model, Ollama host, and exact settings-file location.

For isolated testing or automation, set `SCORPION_CONFIG_DIR` to another directory before starting Scorpion.

## One-time override

Use a command-line override without changing the saved selection:

```bash
scorpion --model qwen3.5:0.8b
```

If the chosen model has been removed from Ollama, run `/list` and select an installed replacement.

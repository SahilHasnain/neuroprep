## Logging dev server output

- [ ] Redirect `expo start` stdout/stderr to `logs/dev.log`
- [ ] Do NOT break the interactive terminal UI (QR code, Metro menu, etc.)
- [ ] Cross-platform (Windows, macOS, Linux)

### Options to explore:
1. Use a pseudo-terminal (pty) to capture output while preserving TUI
2. Install a cross-platform `tee` package
3. Use `expo start` flags for log output (if available)
4. Write a custom Node.js wrapper with `node-pty`

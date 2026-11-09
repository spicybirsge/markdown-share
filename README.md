# Markdown share
Welcome to markdown share, and alternative to the usual codebins. Here instead of sharing just the code you share markdown and if you want to add code you can just write a codeblock and share it. This methods makes it easier for you to write things like the error, explain what is wrong, etc.

The landing page (`/`) is a short product tour with an agent animation, a copy-paste MCP prompt and the share editor itself. Public shares live at `/list`, and the standalone editor is at `/new`.
# Technologies used
The frontend uses Next.js with Tailwind CSS and shadcn/ui. The backend uses Express and Mongoose with MongoDB. Both apps are written in TypeScript; see the [backend setup and scripts](backend/README.md).
# MCP
The backend exposes an [MCP](https://modelcontextprotocol.io) server at `POST /mcp` (Streamable HTTP, stateless), so agents can publish and read markdown shares.

Tools:
- `create_share` — publish markdown and get back a ready-to-paste link. Shares are always unlisted: only people with the link can open them.
- `get_share` — read a share back by id.

```json
{
  "mcpServers": {
    "markdown-share": {
      "type": "http",
      "url": "https://api.markdownshare.shaheerahamed.com/mcp"
    }
  }
}
```

The endpoint cannot edit or delete shares.
# Contributing
Got any contribution? feel free to submit a PR.

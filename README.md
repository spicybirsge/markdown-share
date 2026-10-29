# Markdown share
Welcome to markdown share, and alternative to the usual codebins. Here instead of sharing just the code you share markdown and if you want to add code you can just write a codeblock and share it. This methods makes it easier for you to write things like the error, explain what is wrong, etc.
# Technologies used
For frontend and ssr I used `nextjs` with `radix-ui` and for the database I used `mongodb` and for the backend I used `expressjs`.
# MCP
The backend exposes a read-only [MCP](https://modelcontextprotocol.io) server at `POST /mcp` (Streamable HTTP, stateless), so agents can read a share by id. The only tool is `get_share`.

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

The endpoint cannot create, edit or delete shares.
# Contributing
Got any contribution? feel free to submit a PR.
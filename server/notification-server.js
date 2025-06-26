/* eslint-env node */
/* global console */
import http from "http";

const clients = new Set();

const server = http.createServer((req, res) => {
  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
  } else if (req.url === "/notify" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        for (const client of clients) {
          client.write(`data: ${JSON.stringify(data)}\n\n`);
        }
        res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
        res.end();
      } catch {
        res.writeHead(400);
        res.end();
      }
    });
  } else if (req.method === "OPTIONS" && req.url === "/notify") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4001, () => {
  console.log("Notification server listening on port 4001");
});

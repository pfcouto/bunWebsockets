const server = Bun.serve<{ device: string }>({
  port: 3001,
  fetch(req, server) {
    //* FROM URL
    const url = new URL(req.url, `http://${req.headers.get("host")}`);
    const urlParams = new URLSearchParams(url.search);
    const deviceURL = urlParams.get("device");

    if (deviceURL) {
      const success = server.upgrade(req, { data: { device: deviceURL } });
      if (success) return undefined;
    }

    let device = "Default device";

    const success = server.upgrade(req, { data: { device: device } });
    if (success) return undefined;

    return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      const msg = `${ws.data.device} has entered the chat`;
      console.log(msg);
      ws.subscribe("the-group-chat");
      ws.publish("the-group-chat", msg);
    },
    message(ws, message) {
      // the server re-broadcasts incoming messages to everyone
      const messageStringify = JSON.stringify(message);
      //   console.log(`Publishing to the-group-chat: ${message}`);
      ws.publish("the-group-chat", message);
    },
    close(ws) {
      const msg = `${ws.data.device} has left the chat`;
      ws.publish("the-group-chat", msg);
      ws.unsubscribe("the-group-chat");
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

// cookiesString = "device=website"
function getDeviceFromCookies(cookiesString: string | null) {
  const cookies: Record<string, string | Record<string, string>> = {};
  if (cookiesString) {
    cookiesString.split(";").forEach((cookie) => {
      const [key, value] = cookie.split("=").map((part) => part.trim());
      if (key === "device") {
        cookies[key] = value;
      }
    });
  }
  return cookies["device"];
}

const server = Bun.serve<{ device: string }>({
  port: 10000,
  fetch(req, server) {
    console.log(`req: ${req}`);

    const cookies = req.headers.get("cookie");

    //* FROM URL
    const url = new URL(req.url, `http://${req.headers.get("host")}`);
    const urlParams = new URLSearchParams(url.search);
    const deviceURL = urlParams.get("device");

    if (deviceURL) {
      const success = server.upgrade(req, { data: { device: deviceURL } });
      if (success) return undefined;
    }

    if (req.url.endsWith("/vehicleArrived")) {
      const message = {
        status: "Vehicle arrived successfully at its destination.",
      };

      let parsedMessage: any;
      try {
        const messageString = JSON.stringify(message);
        parsedMessage = JSON.parse(String(messageString));
      } catch (error) {
        console.error("Error parsing message:", error);
        return;
      }

      const { status } = parsedMessage;

      console.log(`Publishing to commsIplNova: ${JSON.stringify(status)}`);
      server.publish("commsIplNova", `${JSON.stringify(status)}`);
    }

    //* FROM COOKIES
    const deviceCookies = getDeviceFromCookies(cookies);
    const success = server.upgrade(req, { data: { device: deviceCookies } });
    if (success) return undefined;

    return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      console.log(`ws: ${ws}`);

      const msg = `${ws.data.device} has entered the chat: commsIplNova`;
      console.log(msg);
      ws.subscribe("commsIplNova");
      ws.publish("commsIplNova", msg);
    },
    message(ws, message) {
      // if "IPL" in ws.data.device
      if (
        typeof ws.data.device === "string" &&
        ws.data.device.includes("IPL")
      ) {
        // Do something if "IPL" is present in the device property

        fetch("http://localhost:3000/move/100")
          .then((response) => {
            if (!response.ok) {
              console.error("Failed to send HTTP GET request");
            } else {
              console.log("Making robot move forward");
            }
          })
          .catch((error) => {
            console.error("Error sending HTTP GET request:", error);
          });
      }

      const msg = `${ws.data.device}: ${message}`;
      console.log(msg);
      // the server re-broadcasts incoming messages to everyone
      ws.publish("commsIplNova", `${msg}`);
    },
    close(ws) {
      const msg = `${ws.data.device} has left the chat`;
      ws.publish("commsIplNova", msg);
      ws.unsubscribe("commsIplNova");
    },
  },
});

console.log(`Listening RENDER on ${server.hostname}:${server.port}`);

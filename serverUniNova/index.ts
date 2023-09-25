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
        data: "Vehicle arrived successfully at its destination.",
      };

      const messageString = JSON.stringify(message);

      console.log(`Publishing to commsIplNova: ${messageString}`);
      server.publish("commsIplNova", messageString);

      return new Response("Hello world");
    }

    //* FROM COOKIES
    const deviceCookies = getDeviceFromCookies(cookies);
    const success = server.upgrade(req, { data: { device: deviceCookies } });
    if (success) return undefined;

    return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      const msg = `${ws.data.device} has entered the chat: commsIplNova`;
      console.log(msg);
      ws.subscribe("commsIplNova");
      ws.publish("commsIplNova", msg);
    },
    message(ws, message) {
      // if "IPL" in ws.data.device

      let parsedMessage: any;
      try {
        parsedMessage = JSON.parse(String(message));
      } catch (error) {
        console.error("Error parsing message:", error);
        return;
      }

      const msg = parsedMessage;

      if (
        typeof ws.data.device === "string" &&
        ws.data.device.includes("IPL")
      ) {
        // Do something if "IPL" is present in the device property

        fetch(`http://localhost:3000/move/${msg}`)
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

      const msgData = { data: msg };
      const msgDataString = JSON.stringify(msgData);

      // the server re-broadcasts incoming messages to everyone
      console.log(`Publishing to commsIplNova: ${msgDataString}`);
      ws.publish("commsIplNova", msgDataString);
    },
    close(ws) {
      const msg = `${ws.data.device} has left the chat`;
      ws.publish("commsIplNova", msg);
      ws.unsubscribe("commsIplNova");
    },
  },
});

console.log(`Listening RENDER on ${server.hostname}:${server.port}`);

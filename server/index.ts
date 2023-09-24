import { ServerWebSocket } from "bun";
import { log } from "console";

interface Topic {
  [key: string]: string;
}

function parseCookies(
  cookiesString: string | null
): Record<string, string | Record<string, string>> {
  const cookies: Record<string, string | Record<string, string>> = {};
  if (cookiesString) {
    cookiesString.split(";").forEach((cookie) => {
      const [key, value] = cookie.split("=").map((part) => part.trim());
      if (key === "topics") {
        const topics = value.split(",").map((topic, index) => ({
          [`${index + 1}`]: topic.trim(),
        }));
        cookies[key] = topics;
      } else {
        cookies[key] = value;
      }
    });
  }
  return cookies;
}

const server = Bun.serve<{ device: string } & { topics: Topic[] }>({
  fetch(req, server) {
    const cookiesString = req.headers.get("cookie");
    const cookiesObject = parseCookies(cookiesString);

    // Parse URL parameters
    const url = new URL(req.url, `http://${req.headers.get("host")}`);
    const urlParams = new URLSearchParams(url.search);

    // Extract topics and device from URL parameters
    const topicsParam = urlParams.get("topics");
    const deviceParam = urlParams.get("device");

    if (topicsParam && deviceParam) {
      // If topics and device are provided in the URL, use them
      const topics = topicsParam.split(",").map((topic, index) => ({
        [`${index + 1}`]: topic.trim(),
      }));
      const device = deviceParam.trim();

      const success = server.upgrade(req, { data: { topics, device } });
      if (success) return undefined;
    }

    if (req.url.endsWith("/vehicleReady")) {
      const message = {
        topic: "website",
        status: "vehicle reached destination",
      };

      let parsedMessage: any;
      try {
        const messageString = JSON.stringify(message);
        parsedMessage = JSON.parse(String(messageString));
      } catch (error) {
        console.error("Error parsing message:", error);
        return;
      }

      const { topic, status } = parsedMessage;

      console.log(`Publishing to ${topic}: ${JSON.stringify(status)}`);
      server.publish(`${topic}`, `${JSON.stringify(status)}`);
    }

    const success = server.upgrade(req, {
      data: { topics: cookiesObject.topics, device: cookiesObject.device },
    });
    if (success) return undefined;

    return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      let topics = ws.data.topics;

      topics.forEach((topic: Topic) => {
        const topicKey: string = Object.keys(topic)[0];
        const topicValue = topic[topicKey];

        const msg = `${ws.data.device} has entered the chat: ${topicValue}`;
        console.log(msg);
        ws.subscribe(`${topicValue}`);
      });
    },
    message(ws, message) {
      let parsedMessage: any;
      try {
        parsedMessage = JSON.parse(String(message));
      } catch (error) {
        console.error("Error parsing message:", error);
        return;
      }

      const { topic, data } = parsedMessage;
      if (data["command"] === "V") {
        fetch("http://localhost:3000/move/100")
          .then((response) => {
            if (!response.ok) {
              console.error("Failed to send HTTP GET request");
            } else {
              log("Making robot move forward");
            }
          })
          .catch((error) => {
            console.error("Error sending HTTP GET request:", error);
          });
        return;
      }

      if (parsedMessage && topic) {
        console.log(`Publishing to ${topic}: ${JSON.stringify(data)}`);

        ws.publish(`${topic}`, `${JSON.stringify(data)}`);
      }
    },
    close(ws) {
      let topics = ws.data.topics;

      topics.forEach((topic) => {
        const topicKey: string = Object.keys(topic)[0];
        const topicValue = topic[topicKey];

        const msg = `${ws.data.device} has left the chat: ${topicValue}`;
        // ws.publish(`${topic}`, msg);
        ws.unsubscribe(`${topicValue}`);
      });
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

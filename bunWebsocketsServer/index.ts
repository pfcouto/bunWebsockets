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

const clientsByTopic = new Map();

const server = Bun.serve<{ device: string } & { topics: Topic[] }>({
  fetch(req, server) {
    const cookiesString = req.headers.get("cookie");
    const cookiesObject = parseCookies(cookiesString);
    // console.log(cookiesObject);
    // const username = getUsernameFromCookies(cookies);
    const success = server.upgrade(req, {
      data: { topics: cookiesObject.topics, device: cookiesObject.device },
    });
    if (success) return undefined;

    return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      // console.log(ws.data);

      let topics = ws.data.topics;

      topics.forEach((topic: Topic) => {
        const topicKey: string = Object.keys(topic)[0];
        const topicValue = topic[topicKey];

        const msg = `${ws.data.device} has entered the chat: ${topicValue}`;
        console.log(msg);
        ws.subscribe(`${topicValue}`);
        // ws.publish(`${topic}`, msg);
      });
    },
    message(ws, message) {
      console.log(message);
      let parsedMessage: any;
      try {
        parsedMessage = JSON.parse(String(message));
      } catch (error) {
        console.error("Error parsing message:", error);
        return;
      }

      if (parsedMessage && parsedMessage.topic) {
        const { topic, data } = parsedMessage;
        console.log(`Publishing to ${topic}: ${JSON.stringify(data)}`);

        ws.publish(`${topic}`, `${JSON.stringify(data)}`);
      }
    },
    close(ws) {
      let topics = ws.data.topics;

      topics.forEach((topic) => {
        const msg = `${ws.data.device} has left the chat: ${topic}`;
        ws.publish(`${topic}`, msg);
        ws.unsubscribe(`${topic}`);
      });
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

// const server = Bun.serve({
//   fetch(req, server) {
//     const success = server.upgrade(req);
//     if (success) {
//       // Bun automatically returns a 101 Switching Protocols
//       // if the upgrade succeeds
//       return undefined;
//     }

//     // handle HTTP request normally
//     return new Response("Hello world!");
//   },
//   websocket: {
//     // this is called when a message is received
//     async message(ws, message) {
//       console.log(`Received ${message}`);
//       // send back a message
//       ws.send(`You said: ${message}`);
//     },
//   },
// });

// console.log(`Listening on localhost:${server.port}`);

//! WORKING

// interface Topic {
//   [key: string]: string;
// }

// function parseCookies(
//   cookiesString: string | null
// ): Record<string, string | Record<string, string>> {
//   const cookies: Record<string, string | Record<string, string>> = {};
//   if (cookiesString) {
//     cookiesString.split(";").forEach((cookie) => {
//       const [key, value] = cookie.split("=").map((part) => part.trim());
//       if (key === "topics") {
//         const topics = value.split(",").map((topic, index) => ({
//           [`${index + 1}`]: topic.trim(),
//         }));
//         cookies[key] = topics;
//       } else {
//         cookies[key] = value;
//       }
//     });
//   }
//   return cookies;
// }

// const server = Bun.serve<{ device: string } & { topics: Topic[] }>({
//   fetch(req, server) {
//     const cookiesString = req.headers.get("cookie");
//     const cookiesObject = parseCookies(cookiesString);
//     // console.log(cookiesObject);
//     // const username = getUsernameFromCookies(cookies);
//     const success = server.upgrade(req, {
//       data: { topics: cookiesObject.topics, device: cookiesObject.device },
//     });
//     if (success) return undefined;

//     return new Response("Hello world");
//   },
//   websocket: {
//     open(ws) {
//       let topics = ws.data.topics;

//       topics.forEach((topic: Topic) => {
//         const topicKey: string = Object.keys(topic)[0];
//         const topicValue = topic[topicKey];

//         const msg = `${ws.data.device} has entered the chats: ${topicValue}`;
//         console.log(msg);
//         ws.subscribe(`${topic}`);
//         ws.publish(`${topic}`, msg);
//       });
//     },
//     message(ws, message) {
//       let topics = ws.data.topics;

//       // the server re-broadcasts incoming messages to everyone
//       topics.forEach((topic) => {
//         ws.publish(`${topic}`, `${JSON.stringify(message)}`);
//         console.log(message);
//       });
//     },
//     close(ws) {
//       let topics = ws.data.topics;

//       topics.forEach((topic) => {
//         const msg = `${ws.data.device} has left the chat: ${topic}`;
//         ws.publish(`${topic}`, msg);
//         ws.unsubscribe(`${topic}`);
//       });
//     },
//   },
// });

// console.log(`Listening on ${server.hostname}:${server.port}`);

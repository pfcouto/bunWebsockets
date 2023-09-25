// import { log } from "console";
// import * as readline from "readline";

// const socket = new WebSocket("ws://localhost:3000", {
//   headers: {
//     // custom headers
//     cookie: "topics=robot,ai,digital_twin;device=manager",
//   },
// });

// // message is received
// socket.addEventListener("message", (event) => {
//   console.log(`Message from server ${event.data}`);
// });

// // socket opened
// socket.addEventListener("open", (event) => {
//   socket.send(JSON.stringify("Hello Server!"));

//   while (true) {
//     let promptText = prompt("Enter a command: ");
//     log(promptText);
//   }
// });

// // socket closed
// socket.addEventListener("close", (event) => {
//   console.log("Socket closed");
// });

// // error handler
// socket.addEventListener("error", (event) => {
//   console.log("Socket error");
// });

// import { log } from "console";
// import * as readline from "readline";

// const socket = new WebSocket("ws://localhost:3000", {
//   headers: {
//     // custom headers
//     cookie: "topics=robot;device=manager",
//   },
// });

// // Define a function to send messages and handle ACKs
// const sendMessageWithACK = (message: any): Promise<void> => {
//   return new Promise<void>((resolve) => {
//     // message is received
//     socket.addEventListener("message", (event) => {
//       const data = JSON.parse(String(event.data));
//       console.log(`Message from server: ${JSON.stringify(data)}`);

//       if (data === "ACK") {
//         resolve();
//       }
//     });

//     // Send the message
//     socket.send(JSON.stringify(message));
//   });
// };

// // socket opened
// socket.addEventListener("open", async (event) => {
//   console.log("Connected to the server");

//   while (true) {
//     try {
//       let command = prompt("Enter a command (H/L/R): ")?.toUpperCase();

//       switch (command) {
//         case "H":
//           const messageH = {
//             topic: "robot",
//             data: { command: "H" },
//           };
//           await sendMessageWithACK(messageH);
//           break;
//         case "L":
//         case "R":
//           const messageLR = {
//             topic: "robot",
//             data: { command: command },
//           };
//           await sendMessageWithACK(messageLR);

//           // Send {"topic":"ai", "data":"D"} after receiving ACK
//           const messageD = {
//             topic: "ai",
//             data: "D",
//           };
//           await sendMessageWithACK(messageD);
//           break;
//         default:
//           console.log("Invalid command. Use H, L, or R.");
//           break;
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }
// });

// // socket closed
// socket.addEventListener("close", (event) => {
//   console.log("Socket closed");
// });

// // error handler
// socket.addEventListener("error", (event) => {
//   console.log("Socket error");
// });

import { log } from "console";
import * as readline from "readline";

const socket = new WebSocket(
  "wss://server-ipl-nova.onrender.com?device=insomniaFake",
  {
    headers: {
      // custom headers
      cookie: "topics=manager;device=manager",
      Upgrade: "websocket",
      Connection: "Upgrade",
    },
  }
);

let waitForAck: boolean = false;

// Add a single "message" event listener to handle ACK messages
socket.addEventListener("message", (event) => {
  const data = JSON.parse(String(event.data));
  console.log(`Message from server: ${JSON.stringify(data)}`);

  if (data === "ACK") {
    waitForAck = false;
  }
});

// Define a function to send messages and wait for ACK
const sendMessageAndWaitForACK = (message: any): Promise<void> => {
  return new Promise<void>((resolve) => {
    waitForAck = true;

    console.log(`Sending message: ${JSON.stringify(message)}`);

    // Send the message
    socket.send(JSON.stringify(message));

    // Wait for ACK before resolving
    const interval = setInterval(() => {
      if (!waitForAck) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
};

// socket opened
socket.addEventListener("open", async (event) => {
  console.log("Connected to the server");

  while (true) {
    try {
      let command = prompt("Enter a command (H/L/R/D/D1): ")?.toUpperCase();

      switch (command) {
        case "H":
          const messageH = {
            topic: "robot",
            data: { command: command },
          };
          await sendMessageAndWaitForACK(messageH);
          break;
        case "L":
        case "R":
          const messageLR = {
            topic: "robot",
            data: { command: command },
          };
          await sendMessageAndWaitForACK(messageLR);
          break;
        case "D":
          // Send {"topic":"ai", "data":{"command":"D"}} after receiving ACK
          const messageD = {
            topic: "ai",
            data: { command: "D" },
          };
          await sendMessageAndWaitForACK(messageD);
          break;
        case "D1":
          // Send {"topic":"ai", "data":{"command":"D1"}} after receiving ACK
          const messageD1 = {
            topic: "ai",
            data: { command: "D1" },
          };
          await sendMessageAndWaitForACK(messageD1);
          break;
        default:
          console.log("Invalid command. Use H, L, R, D or D1.");
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }
});

// socket closed
socket.addEventListener("close", (event) => {
  console.log("Socket closed");
});

// error handler
socket.addEventListener("error", (event) => {
  console.log("Socket error");
});

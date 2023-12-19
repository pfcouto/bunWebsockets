// const socket = new WebSocket("ws://127.0.0.1:3002?device=IPL");

// function sendMessage() {
//   const data = {
//     movimentos: [{ avancar: 110 }],
//   };

//   prompt("Clique no ENTER para enviar a mensagem");

//   // Serialize the data object as a JSON string
//   const dataJSON = JSON.stringify(data);

//   // Send the entire list as a single message
//   socket.send(dataJSON);
// }

// // Create an array of objects with "avancar" and "rodar" keys

// // socket opened
// socket.addEventListener("open", (event) => {
//   try {
//     sendMessage();
//   } catch (error) {
//     console.error(error);
//   }
// });

// // message is received
// socket.addEventListener("message", (event) => {
//   const data = JSON.parse(String(event.data));

//   if (data.estado === "concluido") {
//     console.log("Movimento concluído");

//     sendMessage();
//   }
// });
// // socket closed
// socket.addEventListener("close", (event) => {});

// // error handler
// socket.addEventListener("error", (event) => {});

const socket = new WebSocket("ws://127.0.0.1:3002?device=IPL");

function sendMessage() {
  const data = {
    movimentos: [{ avancar: 110 }],
  };

  // Serialize the data object as a JSON string
  const dataJSON = JSON.stringify(data);

  // Send the entire list as a single message
  socket.send(dataJSON);

  // Set a timeout for 3 seconds
  const timeoutId = setTimeout(() => {
    console.log(
      "No response received within 3 seconds. sendMessage will be called again."
    );
    sendMessage(); // Call sendMessage again if no response is received in time
  }, 3000);

  // Listen for a message and clear the timeout when a message is received
  const messageListener = (event) => {
    clearTimeout(timeoutId); // Clear the timeout
    const data = JSON.parse(String(event.data));

    if (data.estado === "concluido") {
      console.log("Movimento concluído");
      sendMessage(); // Call sendMessage again after receiving a message
    }
    // Remove the listener to avoid calling sendMessage multiple times
    socket.removeEventListener("message", messageListener);
  };

  socket.addEventListener("message", messageListener);

  // Ask for user input after sending the message
  prompt("Clique no ENTER para enviar a mensagem");
}

// socket opened
socket.addEventListener("open", (event) => {
  try {
    sendMessage();
  } catch (error) {
    console.error(error);
  }
});

// socket closed
socket.addEventListener("close", (event) => {
  console.log("Socket closed");
});

// error handler
socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});

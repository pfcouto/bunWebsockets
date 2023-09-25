const socket = new WebSocket("wss://server-ipl-nova.onrender.com?device=IPL");

function sendMessage() {
  const data = {
    movimentos: [
      { avancar: 60 },
      { rodar: 45 },
      { avancar: 100 },
      { rodar: 60 },
    ],
  };

  prompt("Clique no ENTER para enviar a mensagem");

  // Serialize the data object as a JSON string
  const dataJSON = JSON.stringify(data);

  // Send the entire list as a single message
  socket.send(dataJSON);
}

// Create an array of objects with "avancar" and "rodar" keys

// socket opened
socket.addEventListener("open", (event) => {
  try {
    sendMessage();
  } catch (error) {
    console.error(error);
  }
});

// message is received
socket.addEventListener("message", (event) => {
  const data = JSON.parse(String(event.data));

  if (data.estado === "concluido") {
    console.log("Movimento concluído");

    sendMessage();
  }
});
// socket closed
socket.addEventListener("close", (event) => {});

// error handler
socket.addEventListener("error", (event) => {});

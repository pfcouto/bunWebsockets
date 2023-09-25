const socket = new WebSocket("wss://server-ipl-nova.onrender.com?device=IPL");

// Function to sleep for 2 seconds
function sleep(ms:any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// socket opened
socket.addEventListener("open", async (event) => {
  // Create an array of objects with "avancar" and "rodar" keys
  // You can add your logic here
  // Sleep for 2 seconds

  const data = { estado: "concluido" };
  socket.send(JSON.stringify(data));
});

// message is received
socket.addEventListener("message", async (event) => {
  const data = JSON.parse(String(event.data));

  for (const movement of data.movimentos) {
    for (const key of Object.keys(movement)) {
      const value = movement[key];

      //* Make the robot move according to the key and value
      if (key == "avancar") {
        if (value > 0) {
          console.log(`Avançar ${value} cm`);
        } else {
          console.log(`Recuar ${value} cm`);
        }
      }

      if (key == "rodar") {
        if (value > 0) {
          console.log(`Rodar ${value} graus para a direita`);
        } else {
          console.log(`Rodar ${value} graus para a esquerda`);
        }
      }
      
      // Sleep for 2 seconds
      await sleep(2000);
    }
  }
  
  const response = { estado: "concluido" };
  socket.send(JSON.stringify(response));
  console.log("Movimento concluído");
});

// socket closed
socket.addEventListener("close", (event) => {
  // Handle socket close event
});

// error handler
socket.addEventListener("error", (event) => {
  // Handle socket error event
});

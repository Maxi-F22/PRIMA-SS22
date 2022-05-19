import * as Http from "http";


let port = Number(process.env.PORT);

if (!port) {
    port = 8100;
}

startServer(port);

function startServer(_port) {
    let server = Http.createServer();
    server.addListener("listening", handleListen);
}

function handleListen() {
    console.log("Listening");
}
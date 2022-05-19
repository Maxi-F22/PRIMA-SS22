import * as Http from "http";


let port: number = Number(process.env.PORT);

if (!port) {
    port = 8100;
}

startServer(port);

function startServer(_port: number | string): void {
    let server: Http.Server = Http.createServer();
    server.addListener("listening", handleListen);
}

function handleListen(): void {
    console.log("Listening");
}
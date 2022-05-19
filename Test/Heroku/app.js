let port = Number(process.env.PORT);

if (!port) {
    port = 8100;
}

startServer(port);

function startServer(_port) {
    console.log("Listening:" + _port);
}
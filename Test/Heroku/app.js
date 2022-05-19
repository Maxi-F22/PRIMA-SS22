System.register(["http"], function (exports_1, context_1) {
    "use strict";
    var Http, port;
    var __moduleName = context_1 && context_1.id;
    function startServer(_port) {
        let server = Http.createServer();
        server.addListener("listening", handleListen);
    }
    function handleListen() {
        console.log("Listening");
    }
    return {
        setters: [
            function (Http_1) {
                Http = Http_1;
            }
        ],
        execute: function () {
            port = Number(process.env.PORT);
            if (!port) {
                port = 8100;
            }
            startServer(port);
        }
    };
});
//# sourceMappingURL=app.js.map
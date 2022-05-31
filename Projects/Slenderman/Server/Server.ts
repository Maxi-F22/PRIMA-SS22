import { FudgeServer } from "../../../Net/Build/Server/FudgeServer.js";

let port: number | string | undefined = process.env.PORT;
if (port == undefined)
  port = parseInt(process.argv[2]);

if (!port) {
  console.log("Syntax: 'node Server.js <port>' or use start script in Heroku");
  process.exit();
}

let server: FudgeServer = new FudgeServer();
server.startUp(<number>port);
console.log(server);

import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app);
import cors from "cors";
import { WebSocketServer } from "ws";
import { RedisStream } from "./redis-stream";
const wss = new WebSocketServer({ server });

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

wss.on("connection", (ws: any) => {
  console.log("user connected!");
  ws.on("message", async function message(data: any) {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.type == "createGame") {
      const userId: string = parsedData.payload.userId;
      const roomId: string = parsedData.payload.roomId;
      userId;
      roomId;
      RedisStream.getInstance().subscribeToGame(userId, ws, roomId);
      await RedisStream.getInstance().joinGame(userId, roomId, ws, true);
    }
    if (parsedData.type == "joinGame") {
      const userId: string = parsedData.payload.userId;
      const roomId: string = parsedData.payload.roomId.toString();
      userId;
      roomId;
      RedisStream.getInstance().joinGame(userId, roomId, ws, false);
    }
    if (parsedData.type == "leaveGame") {
      const userId: string = parsedData.payload.userId;
      const roomId: string = parsedData.payload.roomId.toString();
      userId;
      roomId;
      RedisStream.getInstance().leavingGame(userId, roomId);
    }
    if (parsedData.type == "getLeaderboard") {
      ("get leaderboard");
      const roomId: string = parsedData.payload.roomId.toString();
      roomId;
      RedisStream.getInstance().getLeaderBoard(roomId);
    }
    if (parsedData.type == "startGame") {
      ("start game");
      const roomId: string = parsedData.payload.roomId.toString();
      roomId;
      RedisStream.getInstance().startGame(roomId);
    }
    if (parsedData.type == "findDrawer") {
      const roomId: string = parsedData.payload.roomId.toString();
      roomId;
      RedisStream.getInstance().findDrawer(roomId, ws);
    }
    if (parsedData.type == "sendCanvas") {
      const roomId: string = parsedData.payload.roomId.toString();
      const canvasImage: string = parsedData.payload.canvas;
      RedisStream.getInstance().publishCanvas(canvasImage, roomId);
    }
    if (parsedData.type == "updateLeaderboard") {
      const userId: string = parsedData.payload.userId;
      const roomId: string = parsedData.payload.roomId.toString();
      userId;
      roomId;
      RedisStream.getInstance().updateLeaderboard(roomId, userId);
    }
    if (parsedData.type == "getNumberOfUsers") {
      ("get number of users");
      const roomId: string = parsedData.payload.roomId.toString();
      const number = RedisStream.getInstance().getNumberOfUsers(roomId);
      const userId: string = parsedData.payload.userId;
      userId;
      roomId;
      if (number != null)
        RedisStream.getInstance().joinGame(userId, roomId, ws, false);
    }
    if (parsedData.type == "getWord") {
      const roomId: string = parsedData.payload.roomId.toString();
      RedisStream.getInstance().publishWord(roomId, ws);
    }
    if (parsedData.type == "sendWordDrawing") {
      const roomId: string = parsedData.payload.roomId.toString();
      const index: string = parsedData.payload.index.toString();
      const userId: string = parsedData.payload.userId;
      const word: string = parsedData.payload.word;
      RedisStream.getInstance().publishWordDrawing(roomId, index, userId, word);
    }
    if (parsedData.type == "publishGuess") {
      const roomId: string = parsedData.payload.roomId.toString();
      const guess: string = parsedData.payload.guess.toString();
      const userId: string = parsedData.payload.userId;
      const status: boolean = parsedData.payload.status;
      RedisStream.getInstance().publishGuesses(roomId, guess, userId, status);
    }
  });
});

server.listen(3004, () => {
  console.log("server runninhg");
});

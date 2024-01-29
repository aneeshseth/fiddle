import { RedisClientType, createClient } from "redis";

export class RedisStream {
  private producer: RedisClientType;
  private subscriber: RedisClientType;
  private static instance: RedisStream;
  private generalClient: RedisClientType;
  private gameTracker: RedisClientType;
  private drawTracker: RedisClientType;
  private subscriptions: Map<String, String>;
  private reverseSubscriptions: Map<String, { userId: string; ws: any }[]>;
  constructor() {
    this.producer = createClient({
      url: "redis://redis_db:6379",
    });
    this.subscriber = createClient({
      url: "redis://redis_db:6379",
    });
    this.generalClient = createClient({
      url: "redis://redis_db:6379",
    });
    this.drawTracker = createClient({
      url: "redis://redis_db:6379",
    });
    this.gameTracker = createClient({
      url: "redis://redis_db:6379",
    });
    this.producer.connect();
    this.generalClient.connect();
    this.gameTracker.connect();
    this.drawTracker.connect();
    this.subscriber.connect();
    this.subscriptions = new Map<String, String>();
    this.reverseSubscriptions = new Map<
      String,
      { userId: string; ws: any }[]
    >();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisStream();
    }
    return this.instance;
  }
  public async subscribeToGame(userId: string, ws: any, roomId: string) {
    await this.subscriber.subscribe(roomId, async (payload: any) => {
      const reverseSubs = this.reverseSubscriptions.get(roomId);
      if (reverseSubs) {
        for (let i = 0; i < reverseSubs.length; i++) {
          reverseSubs[i].ws.send(payload);
        }
      }
    });
  }
  public async leavingGame(userId: string, roomId: string) {
    const currentSubscriptions = await this.subscriptions.get(userId);
    if (!currentSubscriptions) {
      return;
    }
    this.subscriptions.delete(userId);
    const newReverseSubscriptions = this.reverseSubscriptions
      .get(roomId)
      ?.filter((value: { userId: string; ws: any }) => value.userId != userId);
    await this.reverseSubscriptions.set(roomId, newReverseSubscriptions || []);
    const currentUsers = await this.generalClient.get(roomId);
    //@ts-ignore
    const changedUsers = JSON.parse(currentUsers).filter(
      (user: { userId: string; points: number }) => user.userId != userId
    );
    await this.generalClient.set(roomId, JSON.stringify(changedUsers));
    console.log(changedUsers.length);
    await this.producer.publish(
      roomId,
      JSON.stringify({
        type: "leaving",
        userId: userId,
        usersLength: changedUsers.length,
      })
    );
  }
  public async joinGame(
    userId: string,
    roomId: string,
    ws: any,
    startGame: boolean
  ) {
    let currentUsers = await this.generalClient.get(roomId);
    if (currentUsers == null && !startGame) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "game does not exist",
        })
      );
      return;
    }
    const currentStatus = await this.gameTracker.get(roomId);
    if (currentStatus == "true") {
      ws.send(
        JSON.stringify({
          type: "gameAlreadyStarted",
          message: "the game has already begun!",
        })
      );
      return;
    }
    if (currentUsers == null) {
      currentUsers = "[]";
    }
    const parsedCurrent = JSON.parse(currentUsers);
    const findAnyCommon = parsedCurrent.find(
      (user: any) => user.userId == userId
    );
    if (findAnyCommon != undefined) {
      ws.send(
        JSON.stringify({
          type: "commonDetected",
        })
      );
      return false;
    }
    const newUserSet = [...parsedCurrent!, { userId: userId, points: 0 }];
    await this.generalClient.set(roomId, JSON.stringify(newUserSet));
    const numberSubscriptions = await this.subscriptions.get(userId);
    if (numberSubscriptions != null) {
      //@ts-ignore
      this.leavingGame(userId, numberSubscriptions);
      await this.subscriptions.delete(userId);
    }
    this.subscriptions.set(userId, roomId);
    this.reverseSubscriptions.set(roomId, [
      ...(this.reverseSubscriptions.get(roomId) || []),
      { userId: userId, ws: ws },
    ]);
    await this.producer.publish(
      roomId,
      JSON.stringify({
        type: "joining",
        userId: userId,
        usersLength: newUserSet.length,
      })
    );
  }
  public async getNumberOfUsers(roomId: string) {
    return await this.generalClient.get(roomId);
  }
  public async startGame(roomId: string) {
    const currentStatus = await this.gameTracker.get(roomId);
    if (currentStatus == "true") return;
    if (currentStatus == null) this.gameTracker.set(roomId, "true");
    await this.producer.publish(
      roomId,
      JSON.stringify({
        type: "startGame",
      })
    );
  }
  public async findDrawer(roomId: string, ws: any) {
    const currentStatus = await this.generalClient.get(roomId + "drawerStatus");
    const roomUsers = await this.generalClient.get(roomId);
    if (currentStatus == "true") {
      const currentDrawer = await this.drawTracker.get(roomId + "index");
      //@ts-ignore
      const numberOfUsers = JSON.parse(roomUsers).length;
      //@ts-ignore
      if (currentDrawer >= numberOfUsers) {
        await this.producer.publish(
          roomId,
          JSON.stringify({
            type: "gameFinished",
          })
        );
        return;
      }
      ws.send(
        JSON.stringify({
          type: "drawer",
          userId: JSON.parse(roomUsers!)[JSON.parse(currentDrawer!)].userId,
        })
      );
      return;
    } else {
      await this.generalClient.set(roomId + "drawerStatus", "true");
      //@ts-ignore
      const numberOfUsers = JSON.parse(roomUsers).length;
      const currentUserIndex = await this.drawTracker.get(roomId + "index");
      if (currentUserIndex == null) {
        await this.drawTracker.set(roomId + "index", 0);
      } else {
        await this.drawTracker.set(
          roomId + "index",
          JSON.parse(currentUserIndex) + 1
        );
      }
      const final = await this.drawTracker.get(roomId + "index");
      //@ts-ignore
      const finalCheck = JSON.parse(final!);
      if (finalCheck >= numberOfUsers) {
        await this.producer.publish(
          roomId,
          JSON.stringify({
            type: "gameFinished",
          })
        );
        return;
      }
      const userToDraw = JSON.parse(roomUsers!)[finalCheck];
      await this.producer.publish(
        roomId,
        JSON.stringify({
          type: "drawer",
          userId: userToDraw.userId,
        })
      );
    }
  }
  public async publishCanvas(canvas: string, roomId: string) {
    await this.producer.publish(
      roomId,
      JSON.stringify({
        type: "canvasPublish",
        canvas: canvas,
      })
    );
  }
  public async publishWord(roomId: string, ws: any) {
    const currentStatus = await this.generalClient.get(roomId + "wordStatus");
    if (currentStatus == "true") {
      const currentWord = await this.drawTracker.get(roomId + "wordNow");
      ws.send(
        JSON.stringify({
          type: "drawer",
          userId: currentWord,
        })
      );
      return;
    }
    await this.generalClient.set(roomId + "wordStatus", "true");
    const array = ["ambulance", "dog", "cat", "injection", "hospital"];
    await this.generalClient.set(roomId + "wordsNow", JSON.stringify(array));
    console.log(array);
    await this.producer.publish(
      roomId,
      JSON.stringify({
        type: "guessWord",
        word: JSON.stringify(array),
      })
    );
  }
  public async publishWordDrawing(
    roomId: string,
    index: string,
    userId: string,
    word: string
  ) {
    await this.producer.publish(
      roomId,
      JSON.stringify({
        type: "currentWordGuessing",
        index: index,
        userId: userId,
        word: word,
      })
    );
  }
  public async publishGuesses(
    roomId: string,
    guess: string,
    userId: string,
    status: boolean
  ) {
    await this.producer.publish(
      roomId,
      JSON.stringify({
        type: "guessPublish",
        guess: guess,
        userId: userId,
        status: status,
      })
    );
    if (status) this.updateLeaderboard(roomId, userId);
  }
  public async updateLeaderboard(roomId: string, userId: string) {
    let getUser = await this.generalClient.get(roomId);
    //@ts-ignore
    const users = JSON.parse(getUser);
    const findUser = users.find(
      (user: { userId: string; points: number }) => user.userId == userId
    );
    //@ts-ignore
    findUser.points = findUser.points + 100;
    await this.generalClient.set(roomId, JSON.stringify(users));
  }
  public async getLeaderBoard(roomId: string) {
    //@ts-ignore
    let getLeaderBoard = await this.generalClient.get(roomId);
    await this.generalClient.set(roomId + "wordStatus", "false");
    await this.generalClient.set(roomId + "drawerStatus", "false");
    //@ts-ignore
    const leaderBoard = this.sortByKey(JSON.parse(getLeaderBoard!), "points");
    await this.producer.publish(
      roomId,
      JSON.stringify({
        type: "leaderboard",
        leaderboard: leaderBoard,
      })
    );
  }
  public sortByKey(array: { userId: string; points: number }[], key: string) {
    return array.sort(function (a: any, b: any) {
      var x = a[key];
      var y = b[key];
      return x < y ? 1 : x > y ? -1 : 0;
    });
  }
}

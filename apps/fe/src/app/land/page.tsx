"use client";
import React, { useRef, useEffect, useState, CSSProperties } from "react";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import "./page.css";
import Bar from "../Bar";
import { useRecoilState, useRecoilValue } from "recoil";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { BellIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  IsBrushClicked,
  IsCircleClicked,
  IsRectClicked,
  brushState,
  circleState,
  currentBrush,
  gameState,
  rectState,
  roomId,
  roomIdS,
  usernameState,
  webSocketState,
} from "@/app/state/state";
import useBeforeUnload from "@/app/hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function Home() {
  const notifications = [
    {
      title: "Your call has been confirmed.",
      description: "1 hour ago",
    },
    {
      title: "You have a new message!",
      description: "1 hour ago",
    },
    {
      title: "Your subscription is expiring soon!",
      description: "2 hours ago",
    },
  ];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let [loading, setLoading] = useState(true);
  const { toast } = useToast();
  let [color, setColor] = useState("#ffffff");
  const isBrushClicked = useRecoilValue(brushState);
  const [clearCanvas, setClearCanvas] = useState(false);
  const router = useRouter();
  const isCircleClicked = useRecoilValue(circleState);
  const isRectClicked = useRecoilValue(rectState);
  const [height, setHeight] = useState<number>();
  const [width, setWidth] = useState<number>();
  const [_brush, setBrush] = useRecoilState(IsBrushClicked);
  const [_circle, setCircle] = useRecoilState(IsCircleClicked);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentLeaderboard, setCurrentLeaderboard] = useState<
    { userId: string; points: number }[]
  >([]);
  const [_rect, setRect] = useRecoilState(IsRectClicked);
  const [_brushNow, setBrushNow] = useRecoilState(currentBrush);
  const [_publishedCanvas, setPublishedCanvas] = useState("");
  const [ct, setCt] = useState<any>(null);
  const [seconds, setSeconds] = useState(35);
  const [running, setRunning] = useState(false);
  let prevRectXRef = useRef<number>(0);
  let prevRectYRef = useRef<number>(0);
  const [gameS, setGameS] = useRecoilState(gameState);
  let prevCircleRadiusRef = useRef<number>(0);
  const uuidValue = useRecoilValue(roomIdS);
  const [wordGuess, setWordGuess] = useState("");
  const [_uuid, setUuid] = useRecoilState(roomId);
  const webSocket = useRecoilValue(webSocketState);
  const usernameVal = useRecoilValue(usernameState);
  const [isDrawing, setIsDrawing] = useState(true);
  const [currentWord, setCurrentWord] = useState<string[]>([
    "ambulance",
    "dog",
    "cat",
    "injection",
    "hospital",
  ]);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [wordSelectedForColor, setWordSelectedForColor] = useState<
    number | null
  >(null);
  const [drawer, setDrawer] = useState("");
  let currImageRef = useRef<HTMLImageElement | null>(null);
  let prevImageRef = useRef<string>("");
  const [guessed, setGuessed] = useState(false);
  const handleWordClick = async (index: number, word: string) => {
    setWordSelectedForColor(index);
    console.log(index);
    console.log(word);
    setSelectedWord(word);
    if (webSocket) {
      //@ts-ignore
      await webSocket.send(
        JSON.stringify({
          type: "sendWordDrawing",
          payload: {
            roomId: uuidValue.toString(),
            index: (index + 1).toString(),
            userId: usernameVal,
            word: currentWord[index],
          },
        })
      );
    }
  };
  useBeforeUnload();
  async function sendCanvas(canvasI: any) {
    if (webSocket) {
      //@ts-ignore
      await webSocket.send(
        JSON.stringify({
          type: "sendCanvas",
          payload: {
            roomId: uuidValue,
            canvas: canvasI,
          },
        })
      );
    }
  }
  useEffect(() => {
    setGameS(true);
  }, []);
  useEffect(() => {
    if (webSocket) {
      //@ts-ignore
      webSocket.onmessage = async function (event: any) {
        const data = JSON.parse(event.data);
        if (data.type == "leaving") {
          if (data.userId != usernameVal) {
            toast({
              description: `${data.userId} left the game!`,
            });
          } else {
            toast({
              description: `you left the game!`,
            });
            setGameS(false);
            router.push("/");
          }
          if (data.usersLength == 1) {
            toast({
              description: `game ending because only one user left!`,
            });
            setGameS(false);
            router.push("/");
          }
        }
        if (data.type == "drawer") {
          if (data.userId == usernameVal) {
            setIsDrawing(true);
            toast({
              description: `you are now drawing!`,
            });
          } else {
            toast({
              description: `${data.userId} is drawing!`,
            });
            setIsDrawing(false);
          }
          setDrawer(data.userId);
        }
        if (data.type == "guessWord") {
          console.log("GUESS WORD");
          console.log(data);
          console.log(data.word);
          setCurrentWord(JSON.parse(data.word));
        }
        if (data.type == "currentWordGuessing") {
          console.log(data);
          if (data.userId == usernameVal) {
            toast({
              title: `you are now drawing word ${data.index}`,
            });
          } else {
            console.log(data);
            setSelectedWord(data.word);
            toast({
              title: `${data.userId} are now drawing word ${data.index}`,
            });
          }
        }
        if (data.type == "canvasPublish") {
          setPublishedCanvas(data.canvas);
          if (data.canvas == undefined) {
            if (prevImageRef.current != "") {
              currImageRef.current?.setAttribute("src", prevImageRef.current);
            } else {
              currImageRef.current?.setAttribute(
                "src",
                "https://images.unsplash.com/photo-1618123069754-cd64c230a169?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              );
            }
          } else {
            currImageRef.current?.setAttribute("src", data.canvas);
            prevImageRef.current = data.canvas;
          }
        }
        if (data.type == "guessPublish") {
          console.log(data);
          if (data.status) {
            if (data.userId == usernameVal) {
              toast({
                title: "you guessed the word!",
              });
              setGuessed(false);
            } else {
              toast({
                title: `${data.userId} guessed the word!`,
              });
            }
          } else {
            if (data.userId == usernameVal) {
              toast({
                title: "wrong guess!",
              });
            }
          }
        }
        if (data.type == "gameFinished") {
          setGameS(false);
          router.push("/");
        }
        if (data.type == "leaderboard") {
          setCurrentLeaderboard(data.leaderboard);
          setShowLeaderboard(true);
          setTimeout(() => {
            setGameS(false);
            router.push("/");
          }, 5000);
        }
      };
      if (showLeaderboard == false) {
        //@ts-ignore
        webSocket.send(
          JSON.stringify({
            type: "getWord",
            payload: {
              roomId: uuidValue.toString(),
            },
          })
        );
        //@ts-ignore
        webSocket.send(
          JSON.stringify({
            type: "findDrawer",
            payload: {
              roomId: uuidValue.toString(),
            },
          })
        );
      }
    }
  }, [showLeaderboard]);
  async function sendGuess() {
    if (wordGuess == "") return;
    setWordGuess("");
    console.log(wordGuess);
    console.log(selectedWord);
    if (wordGuess == selectedWord) {
      //@ts-ignore
      await webSocket.send(
        JSON.stringify({
          type: "publishGuess",
          payload: {
            roomId: uuidValue,
            guess: wordGuess,
            userId: usernameVal,
            status: true,
          },
        })
      );
      setGuessed(true);
    } else {
      //@ts-ignore
      await webSocket.send(
        JSON.stringify({
          type: "publishGuess",
          payload: {
            roomId: uuidValue,
            guess: wordGuess,
            userId: uuidValue,
            status: false,
          },
        })
      );
    }
  }
  async function getLeaderboard() {
    //@ts-ignore
    await webSocket.send(
      JSON.stringify({
        type: "getLeaderboard",
        payload: {
          roomId: uuidValue.toString(),
        },
      })
    );
  }
  useEffect(() => {
    let timer: any;

    if (running && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      getLeaderboard();
      setRunning(false);
    }
    return () => {
      clearInterval(timer);
    };
  }, [running, seconds]);
  useEffect(() => {
    setRunning(true);
  }, []);
  useEffect(() => {
    let canvas = canvasRef.current;
    const height = (window.innerHeight / 100) * 70;
    const width = (window.innerWidth / 100) * 97;
    let ctx = canvas?.getContext("2d");
    if (clearCanvas) {
      ctx!.fillStyle = "rgba(0, 0, 0, 1)";
      ctx?.fillRect(0, 0, canvas!.width, canvas!.height);
      setClearCanvas(false);
    }
    setInterval(() => {
      sendCanvas(canvas?.toDataURL("image/jpeg", 1)!);
    }, 200);
    setWidth(width);
    setHeight(height);
    let drawingWithBrush = false;
    let drawingRect = false;
    let drawingCircle = false;
    function clearPrevCircle(startX: number, startY: number, currRef: number) {
      ctx?.beginPath();
      ctx?.clearRect(
        startX - currRef - 1,
        startY - currRef - 1,
        currRef * 2 + 2,
        currRef * 2 + 2
      );
      ctx?.closePath();
    }
    function clearPrevRectangle(
      _e: MouseEvent,
      startX: number,
      startY: number,
      prevXRef: number,
      prevYRef: number
    ) {
      ctx?.clearRect(startX, startY, prevXRef - startX, prevYRef - startY);
    }
    function drawRectangleCustom(e: MouseEvent) {
      if (!isRectClicked) return;
      drawingRect = true;
      const startX = e.clientX - canvas!.getBoundingClientRect().x;
      const startY = e.clientY - canvas!.getBoundingClientRect().y;
      ctx?.beginPath();
      canvas?.addEventListener("mousemove", function (e: MouseEvent) {
        if (!drawingRect) return;
        if (prevRectXRef.current != 0 && prevRectYRef.current != 0) {
          clearPrevRectangle(
            e,
            startX,
            startY,
            prevRectXRef.current,
            prevRectYRef.current
          );
        }
        const { x, y } = getFinalCoordinates(e);
        ctx!.strokeStyle = "red";
        if (x < prevRectXRef.current || y < prevRectYRef.current) {
          stopDrawingRect(e);
        }
        ctx!.strokeStyle = "white";
        ctx?.strokeRect(startX, startY, x - startX, y - startY);
        ctx?.stroke();
        prevRectXRef.current = x;
        prevRectYRef.current = y;
      });
      function stopDrawingRect(e: MouseEvent) {
        drawingRect = false;
        setRect(false);
        prevRectXRef.current = 0;
        prevRectYRef.current = 0;
        canvas?.removeEventListener("mousemove", drawRectangleCustom);
        canvas?.removeEventListener("mousedown", drawRectangleCustom);
      }
      canvas?.addEventListener("mouseup", stopDrawingRect);
    }
    function drawCircleCustom(e: MouseEvent) {
      if (!isCircleClicked) return;
      drawingCircle = true;
      const startX = e.clientX - canvas!.getBoundingClientRect().x;
      const startY = e.clientY - canvas!.getBoundingClientRect().y;
      ctx?.beginPath();
      canvas?.addEventListener("mousemove", function (e) {
        if (!drawingCircle) return;
        clearPrevCircle(startX, startY, prevCircleRadiusRef.current);
        const { x, y } = getFinalCoordinates(e);
        ctx!.strokeStyle = "green";
        const radius = Math.sqrt(
          Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
        );
        ctx?.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx?.stroke();
        prevCircleRadiusRef.current = radius;
      });
      function stopDrawingCircle() {
        drawingCircle = false;
        prevCircleRadiusRef.current = 0;
        setCircle(false);
        canvas?.removeEventListener("mousemove", drawCircleCustom);
        canvas?.removeEventListener("mouseup", stopDrawingCircle);
        canvas?.removeEventListener("mousedown", drawCircleCustom);
      }
      canvas?.addEventListener("mouseup", stopDrawingCircle);
    }
    function drawWithBrush(e: MouseEvent) {
      if (!isBrushClicked) return;
      drawingWithBrush = true;
      const currentX = e.clientX - canvas!.getBoundingClientRect().x;
      const currentY = e.clientY - canvas!.getBoundingClientRect().y;
      ctx?.moveTo(currentX, currentY);
      ctx?.beginPath();
      canvas?.addEventListener("mousemove", function (e) {
        if (!drawingWithBrush) return;
        ctx!.strokeStyle = "red";
        const { x, y } = getFinalCoordinates(e);
        ctx?.lineTo(x, y);
        ctx?.stroke();
      });
      function stopDrawingWithBrush() {
        drawingWithBrush = false;
        setBrush(false);
        setBrushNow(
          "https://d1nhio0ox7pgb.cloudfront.net/_img/m_collection_png/512x512/plain/paint_brush.png"
        );
        canvas?.removeEventListener("mousemove", drawWithBrush);
        canvas?.removeEventListener("mouseup", stopDrawingWithBrush);
        canvas?.removeEventListener("mousedown", drawWithBrush);
      }
      canvas?.addEventListener("mouseup", stopDrawingWithBrush);
    }
    function getFinalCoordinates(e: MouseEvent) {
      const newX = e.clientX - canvas!.getBoundingClientRect().x;
      const newY = e.clientY - canvas!.getBoundingClientRect().y;
      return { x: newX, y: newY };
    }
    canvas?.addEventListener("mousedown", drawCircleCustom);
    canvas?.addEventListener("mousedown", drawRectangleCustom);
    canvas?.addEventListener("mousedown", drawWithBrush);
    const handleResize = (e: any) => {};
    window.addEventListener("resize", handleResize);
    setCt(ctx);
    setTimeout(() => {
      setLoading(false);
    }, 1400);
    return () => {
      canvas?.removeEventListener("mousedown", drawCircleCustom);
      canvas?.removeEventListener("mousemove", drawCircleCustom);
      canvas?.removeEventListener("mousedown", drawRectangleCustom);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    isBrushClicked,
    isCircleClicked,
    isRectClicked,
    showLeaderboard,
    clearCanvas,
  ]);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClimbingBoxLoader
          color={color}
          loading={loading}
          cssOverride={override}
          size={25}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }
  if (showLeaderboard) {
    return (
      <div className="w-screen flex justify-center items-center h-screen">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>game leaderboard.</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              {currentLeaderboard
                .filter((user) => user.userId != drawer)
                .map((user, index) => (
                  <div
                    key={index}
                    className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                  >
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.userId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.points}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <CheckIcon className="mr-2 h-4 w-4" />{" "}
              {currentLeaderboard.length > 0
                ? `${currentLeaderboard[0].userId} won the game!`
                : "not enough users."}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  if (isDrawing) {
    return (
      <div className="flex flex-col  w-screen bg-cover">
        <div className="flex flex-col items-center justify-center w-screen">
          <div className="flex justify-center items-center gap-4 mb-4 mt-4">
            <Bar />
            <Button className="ml-2">{seconds}s</Button>
            <Button
              onClick={() => {
                setClearCanvas(true);
              }}
            >
              clear canvas
            </Button>
          </div>
          <canvas
            ref={canvasRef}
            className="border-2 border-white rounded-md"
            height={height}
            width={width}
          />
        </div>
        <div className="w-screen mt-8 h-screen word-guess">
          {currentWord &&
            currentWord.map((word: string, index) => (
              <Button className="bg-brown-900 mr-3 hover:bg-blue-800">
                <h3
                  key={index}
                  className={`scroll-m-20 text-2xl font-semibold tracking-tight hover:cursor-pointer ${
                    wordSelectedForColor === index
                      ? "text-green-500"
                      : "text-white"
                  }`}
                  onClick={() => handleWordClick(index, word)}
                >
                  {word}
                </h3>
              </Button>
            ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col  w-screen  bg-[url('https://images.unsplash.com/photo-1618123069754-cd64c230a169?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover h-screen">
        <Button className="">{seconds}s</Button>
        <div className="flex flex-col items-center justify-center w-screen h-4/5 border-2 border-white rounded-md">
          <img
            ref={currImageRef}
            className="h-full w-full bg-cover"
            src="https://images.unsplash.com/photo-1618123069754-cd64c230a169?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
        </div>
        <div className="w-screen mt-2 h-1/5 flex">
          <Input
            className="w-2/3 bg-blue-800 text-white mr-2"
            value={wordGuess}
            onChange={(e) => setWordGuess(e.target.value)}
          />
          <Button
            className="w-1/3 text-white  bg-blue-800"
            onClick={sendGuess}
            disabled={guessed}
          >
            guess
          </Button>
        </div>
      </div>
    );
  }
}

/*
 <div className="dark:bg-black p-6 rounded-lg">
        <h1 className="text-3xl font-bold text-white mb-4">Leaderboard</h1>
        <div className="grid gap-4">
          {currentLeaderboard
            .filter((user) => user.userId != drawer)
            .map((user, index) => (
              <div className="flex items-center gap-4 bg-black p-4 rounded-lg">
                <div className="text-white text-xl font-bold">{index + 1}</div>
                <Avatar className="w-10 h-10 border">
                  <AvatarImage alt="Player 1" src="/placeholder-user.jpg" />
                  <AvatarFallback>P{index + 1}</AvatarFallback>
                </Avatar>
                <div className="text-white text-lg">{user.userId}</div>
                <div className="ml-auto text-white text-lg">{user.points}</div>
              </div>
            ))}
        </div>
      </div>

*/

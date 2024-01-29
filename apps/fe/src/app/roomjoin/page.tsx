"use client";
import * as React from "react";
import "./page.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CSSProperties, useEffect, useState } from "react";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  usernameValue,
  usernameState,
  roomId,
  roomIdS,
  webSocketState,
  gameStateSelector,
  gameState,
} from "../state/state";
import useBeforeUnload from "../hook";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
export default function CardWithForm() {
  const [uuid, setUuid] = useRecoilState(roomId);
  const uuidValue = useRecoilValue(roomIdS);
  useBeforeUnload();
  let [loading, setLoading] = useState(true);
  const [username, setUsername] = useRecoilState(usernameValue);
  const usernameVal = useRecoilValue(usernameState);
  let [color, setColor] = useState("#ffffff");
  const router = useRouter();
  const { toast } = useToast();
  const [usersJoined, setUsersJoined] = useState<string>("");
  const gameS = useRecoilValue(gameStateSelector);
  const [state, setState] = useRecoilState(gameState);
  const webSocket = useRecoilValue(webSocketState);
  useEffect(() => {
    if (gameS) {
      setState(false);
      if (webSocket) {
        //@ts-ignore
        webSocket.send(
          JSON.stringify({
            type: "leaveGame",
            payload: {
              userId: usernameVal,
              roomId: uuidValue,
            },
          })
        );
      }
      router.push("/");
    }
  }, []);
  async function assignWebsockets() {
    if (webSocket) {
      //@ts-ignore
      webSocket.send(
        JSON.stringify({
          type: "getNumberOfUsers",
          payload: {
            roomId: uuidValue,
            userId: usernameVal,
          },
        })
      );
    }
  }
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1300);
    setUuid("");
    if (webSocket) {
      //@ts-ignore
      webSocket.onmessage = function (event: any) {
        console.log("EVENT JOIN");
        console.log(JSON.parse(event.data));
        const data = JSON.parse(event.data);
        if (data.type == "joining") {
          setUsersJoined(data.usersLength.toString());
          toast({
            title: "A user has joined!",
            description: `${data.userId} joined!`,
          });
        }
        if (data.type == "error") {
          toast({
            title: "room does not exist!",
          });
        }
        if (data.type == "leaving") {
          setUsersJoined(data.usersLength.toString());
          toast({
            title: "a user left!",
            description: `${data.userId} left the game!`,
          });
        }
        if (data.type == "startGame") {
          router.push("/land");
        }
        if (data.type == "commonDetected") {
          toast({
            title: "username taken!",
          });
        }
        if (data.type == "gameAlreadyStarted") {
          toast({
            title: "game already in progress!",
          });
        }
      };
    }
  }, []);
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
  return (
    <div className="bg-[url('https://images.unsplash.com/photo-1618123069754-cd64c230a169?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover h-screen flex items-center justify-center gap-5 main-div">
      <div className="w-screen">
        <Card className="h-screen mx-auto my-4 flex flex-col justify-center">
          <CardHeader className="items-center">
            <CardTitle>Join Room</CardTitle>
            <CardDescription>
              {usersJoined == "" || usersJoined == "0" ? "0" : usersJoined}{" "}
              users have joined!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Username</Label>
                  <Input
                    id="name"
                    placeholder="Your ingame name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Room ID</Label>
                  <CardDescription className="mt-2 mb-2">
                    Get this from your room creator!
                  </CardDescription>
                  <Input
                    id="name"
                    placeholder="ID of your room"
                    value={uuid}
                    onChange={(e) => {
                      setUuid(e.target.value);
                    }}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={assignWebsockets}>Enter game</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

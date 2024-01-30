"use client";
import React, { useEffect, useState } from "react";
import "./page.css";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRecoilState, useRecoilValue } from "recoil";
import { webSocketState, roomIdS, usernameState, roomId } from "./state/state";
function page() {
  const router = useRouter();
  const currentWebsocket = useRecoilValue(webSocketState);
  const uuidValue = useRecoilValue(roomIdS);
  const [_uuidVal, setUuidVal] = useRecoilState(roomId);
  const usernameVal = useRecoilValue(usernameState);
  const [video, setVideo] = useState(false);
  if (video) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <div className="border-2 border-green-500 border-solid w-screen h-5/6">
          <video
            src="https://myawsbucketaneesh.s3.eu-west-3.amazonaws.com/Screen+Recording+2024-01-29+at+7.20.42+PM.mov"
            controls
            autoPlay
            className="ml-10 mr-10 mb-10"
          />
        </div>
        <Button
          className="w-full mt-5 ml-10 mr-10 bg-white text-black h-1/6"
          onClick={() => {
            setVideo(false);
          }}
        >
          Stop Video
        </Button>
      </div>
    );
  }
  return (
    <div className="bg-[url('https://images.unsplash.com/photo-1603366615917-1fa6dad5c4fa?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] flex flex-col bg-auto bg-center w-screen max-w-screen pb-6 min-h-screen drop-in">
      <div className="mt-2 h-[100px]">
        <div className="h-full">
          <img
            src="https://cdn2.steamgriddb.com/logo/b8043b9b976639acb17b035ab8963f18.png"
            className="h-20 w-60"
          />
        </div>
      </div>
      <div className="h-[400px] flex justify-center items-center flex-col">
        <div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight heading-text">
            fiddle.io
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            className="text-xl px-3 py-7 mt-14"
            onClick={() => {
              router.push("/roomcreate");
            }}
          >
            Create Room
          </Button>
          <Button
            className="text-xl px-3 py-7 mt-14"
            onClick={() => {
              router.push("/roomjoin");
            }}
          >
            Join Room
          </Button>
        </div>
        <Button
          onClick={() => {
            setVideo(true);
          }}
          className="text-lg px-3 py-5 mt-5"
        >
          Watch Demo
        </Button>
        <blockquote className="mt-6 border-l-2 pl-6 italic text-center">
          90 seconds. 1 drawer. n users. 5 words. maximum guesses wins.
        </blockquote>
      </div>
      <div className="flex-grow grid md:grid-cols-3 sm:grid-cols-1 max-w-screen justify-between ml-4 mr-4 gap-6 lg:grid-cols-3 small-size drop-in-2">
        <div className="bg-none  rounded-lg p-4 hover:scale-105 h-auto">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            🍎 websockets.
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
            Engineered end to end websocket communication to enable sharing
            game-state, canvas drawings, guess statuses, leaderboards, etc using
            native websockets written in Typescript with NodeJS and NextJS.
          </p>
        </div>
        <div className="bg-none  rounded-lg p-4 hover:scale-105 h-auto">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            🍬 canvas.
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
            Engineered the HTML canvas on .tsx files (Typescript) in a way to
            allow users to draw rectangles, circles, and plain-ly dynamically in
            the browser.
          </p>
        </div>
        <div className="bg-none  rounded-lg p-4 hover:scale-105 h-auto">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            🍎 deployments.
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
            Engineered the end to end websocket server deployment on AWS with
            the backend containerized with Docker.
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;

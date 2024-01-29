"use client";
import React, { createContext, useContext, useEffect } from "react";
import { webS } from "../state/state";
import { useRecoilState } from "recoil";

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }: any) => {
  const [webSocket, setWebSocket] = useRecoilState(webS);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3004");
    console.log("socket");
    console.log(socket);
    //@ts-ignore
    setWebSocket(socket);
  }, []);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  IsBrushClicked,
  IsCircleClicked,
  IsRectClicked,
  brushCurrentState,
  currentBrush,
} from "./state/state";

function Bar() {
  const [brush, setBrush] = useRecoilState(IsBrushClicked);
  const [circle, setCircle] = useRecoilState(IsCircleClicked);
  const [rect, setRect] = useRecoilState(IsRectClicked);
  const currBrush = useRecoilValue(brushCurrentState);
  const [brushNow, setBrushNow] = useRecoilState(currentBrush);
  return (
    <div className="flex">
      <div>
        <div className="flex justify-center items-center gap-4">
          <div
            className={`rectangle hover:cursor-pointer border-2 border-white border-solid ${rect ? "border-2 border-red-800 border-solid" : ""}`}
            onClick={() => {
              setBrush(false);
              setCircle(false);
              setRect(true);
              setBrushNow(
                "https://d1nhio0ox7pgb.cloudfront.net/_img/m_collection_png/512x512/plain/paint_brush.png"
              );
            }}
          />
          <div
            className={`circle hover:cursor-pointer border-2 border-white border-solid ${circle ? "border-2 border-red-800 border-solid" : ""} `}
            onClick={() => {
              setBrush(false);
              setCircle(true);
              setRect(false);
              setBrushNow(
                "https://d1nhio0ox7pgb.cloudfront.net/_img/m_collection_png/512x512/plain/paint_brush.png"
              );
            }}
          />
          <div className={`hover:cursor-pointer`}>
            <img
              src={currBrush}
              className="w-[30px] h-[30px]"
              onClick={() => {
                setBrush(true);
                setCircle(false);
                setRect(false);
                setBrushNow(
                  "https://www.clker.com/cliparts/i/V/W/m/v/u/red-paint-brush-and-can-hi.png"
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bar;

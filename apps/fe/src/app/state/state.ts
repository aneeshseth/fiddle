import { atom, selector } from "recoil";

export const IsBrushClicked = atom({
  key: "brush",
  default: false,
});

export const IsRectClicked = atom({
  key: "rect",
  default: false,
});

export const IsCircleClicked = atom({
  key: "circle",
  default: false,
});

export const webS = atom({
  key: "websocket",
  default: null,
});

export const usernameValue = atom({
  key: "username",
  default: "",
});

export const roomId = atom({
  key: "roomId",
  default: "",
});

export const gameState = atom({
  key: "gameState",
  default: false,
});

export const usernameState = selector({
  key: "usernames",
  get: ({ get }) => {
    const text = get(usernameValue);
    return text;
  },
});

export const gameStateSelector = selector({
  key: "games",
  get: ({ get }) => {
    const text = get(gameState);
    return text;
  },
});

export const roomIdS = selector({
  key: "roomIds",
  get: ({ get }) => {
    const text = get(roomId);
    return text;
  },
});

export const brushState = selector({
  key: "brushs",
  get: ({ get }) => {
    const text = get(IsBrushClicked);

    return text;
  },
});

export const webSocketState = selector({
  key: "sockets",
  get: ({ get }) => {
    const text = get(webS);

    return text;
  },
});

export const rectState = selector({
  key: "rects",
  get: ({ get }) => {
    const text = get(IsRectClicked);

    return text;
  },
});

export const circleState = selector({
  key: "circles",
  get: ({ get }) => {
    const text = get(IsCircleClicked);

    return text;
  },
});

export const currentBrush = atom({
  key: "brushcurr",
  default:
    "https://d1nhio0ox7pgb.cloudfront.net/_img/m_collection_png/512x512/plain/paint_brush.png",
});

export const brushCurrentState = selector({
  key: "brushcurrentstate",
  get: ({ get }) => {
    const text = get(currentBrush);

    return text;
  },
});

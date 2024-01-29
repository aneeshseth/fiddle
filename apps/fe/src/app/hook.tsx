import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { roomId, roomIdS, usernameState, webSocketState } from "./state/state";
export default function useBeforeUnload() {
  const currentWebsocket = useRecoilValue(webSocketState);
  const uuidValue = useRecoilValue(roomIdS);
  const [_uuidVal, setUuidVal] = useRecoilState(roomId);
  const usernameVal = useRecoilValue(usernameState);
  useEffect(() => {
    const eventListener = () => {
      sessionStorage.clear();
      console.log(currentWebsocket);
      console.log(uuidValue);
      //@ts-ignore
      currentWebsocket.send(
        JSON.stringify({
          type: "leaveGame",
          payload: {
            userId: usernameVal,
            roomId: uuidValue,
          },
        })
      );
      setUuidVal("");
    };
    window.addEventListener("beforeunload", eventListener);
    return () => {
      window.removeEventListener("beforeunload", eventListener);
    };
  }, [currentWebsocket, uuidValue, usernameVal]);
}

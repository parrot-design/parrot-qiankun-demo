
import { SmPlayer } from "supremind";
import React from "react";
import CustomSmPlayer from "./SmPlayer";

const wsUrl = "ws://100.100.69.111:8088/live/cat6ff0f291cqotkuc20.mp4";
const ws265Url = "ws://100.100.69.111:8088/live/cclcvr0f291cqpktvcs0.mp4";

const httpUrl = "";

const Player=()=>{
    return (
        <div>
            <SmPlayer 
                url={ws265Url}
                ws={true}
                width={"60%"}
            />
            <CustomSmPlayer 
                url={ws265Url}
                ws={true}
                width={"60%"}
            />
        </div>
    )
}

export default Player;



import React from "react";
import WsPlayer from "./WsPlayer";
import "./index.scss";


//ws 表示是否是直播流
//url 表示视频地址 直播为 ws 开头 片段为 http 开头
const SmPlayer=(props)=>{

    const { ws }=props;

    if(ws){
        return <WsPlayer {...props} />
    }
    
}

export default SmPlayer;
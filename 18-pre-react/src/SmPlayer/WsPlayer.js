import React, { useState, useRef, useEffect } from "react";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import { isHttp } from "./utils";
import vmplayer from "./vmplayer";
import zrender from "zrender";
import useStateCallback from "../hook/useStateCallback";

// id：内部自定义的id
// showControl：是否显示下面的控制条
// status：播放器的状态 normal|pause|loading|urlerr|emptyurl|playing|error|reload
// currentPTZInfo：当前预置位信息
// videoType：httpmp4|h265|h264
// reloaded：表示是否加载过
// errorMsg: 播放器错误信息
// playerExample：vmplayer播放器
// autoPlay: 是否自动播放
const WsPlayer = (props) => {
  const {
    url,
    ws,
    width = "100%",
    height = "100%",
    onError,
    onPlay,
    autoPlay = true,
  } = props;

  const [ id ] = useState(Math.random().toString(36).substring(2));

  const [showControl, setShowControl] = useState(false);

  const [fontSizeType, setFontSizeType] = useState("default");

  const [errorMsg, setErrorMsg] = useState("播放错误");

  const [videoType, setVideoType] = useStateCallback("");

  const [currentPTZInfo, setCurrentPTZInfo] = useState(undefined);

  const [status, setStatus] = useState("normal");

  const reloaded = useRef(false);

  const playerRef = useRef(null);

  const playerExample = useRef(null);

  const zr = useRef();

  const zrGroup = useRef();

  const zrInit = (container) => {
    zr.current = zrender.init(container);
    zrGroup.current = new zrender.Group();
    zr.current.add(zrGroup.current);
  };

  const pause = () => {
    setStatus("pause");
  };

  const play = () => {
    init();
  };

  const videoOnPlay = () => {  
    if (videoType === "264") {
    }
  };

  useEffect(() => {
    if (autoPlay) {
      init();
    }
  }, []);

  //初始化 播放
  const init = () => {
    const videoEle = document.getElementById(`newPlayer${id}`); 
    setStatus("loading");
    setCurrentPTZInfo(undefined);

    if (!videoEle) {
      return;
    }
    videoEle.onerror = undefined;
    videoEle.onplay = undefined;
    if (!url) {
      if (url !== "") {
        this.setState({
          status: "urlerr",
        });
      } else {
        this.setState({
          status: "emptyurl",
        });
      }
      return;
    }

    if (isHttp(url)) {
      console.log("httpMP4");
      videoEle.src = url;
      setStatus("playing");
      setVideoType("httpmp4");
      //只有在 httpmp4时才监听video的错误信息 其他时候报错是由 vmplayer传出的
      videoEle.onerror = () => {
        onError?.();
        setStatus(reloaded.current ? "error" : "reload");
        setErrorMsg(
          window.navigator.onLine
            ? "视频流地址不存在，请联系管理员"
            : "网络异常，请检查网络连接情况后重试播放"
        );
      };
      videoEle.onplay = () => {
        onPlay?.(videoEle.videoWidth, videoEle.videoHeight, "httpmp4");
      };
      return;
    }
    document.getElementById(`newPlayer${id}`).src = null;

    let player = new vmplayer(`canvas${id}`, `newPlayer${id}`, url);
    playerExample.current = player;

    player.open((errorMsg) => {
      onError?.();
      setStatus(reloaded.current ? "error" : "reload");
      setErrorMsg(errorMsg);
    });

    player.onerror((errorMsg) => { 
      onError?.();
      setStatus(reloaded.current ? "error" : "reload");
      setErrorMsg(errorMsg);
    });

    player.onStartPlay((videoType) => {
      setStatus("playing");
      setVideoType(videoType, () => { 
        if (videoType === "264") {
          const video = document.getElementById(`newPlayer${id}`); 
          video.addEventListener("play", videoOnPlay);
        } else {
          console.log(265);
        }
      });
    });
  };

  const renderControls = () => {
    return (
      <div
        className="playerControls"
        id={`playerControls${id}`}
        style={{
          opacity: showControl ? 1 : 0,
          bottom: showControl ? 0 : "-35px",
        }}
      >
        <div className="playback-control">
          {status === "playing" ? (
            <PauseOutlined onClick={pause} className="control-icon" />
          ) : (
            <CaretRightOutlined className="control-icon" onClick={play} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="newPlayerBox"
      id={`newPlayerBox${id}`}
      style={{
        width,
        height,
      }}
      key={id}
      ref={playerRef}
    >
      <canvas
        className="pointCanvas"
        id={`point${id}`}
        width={1920}
        height={1080}
      />
      {renderControls()}
      <video id={`newPlayer${id}`} muted autoPlay playsInline loop />
      <canvas id={`canvas${id}`}   className={`newPlayerCanvas`} width={1920} height={1080}/>
      {status === "loading" && (
        <div className={`errModel ${fontSizeType}`}>
          <div className="errInfo">
            <div className="videoError loading"></div>
            <p className="videoTxt">加载中</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WsPlayer;

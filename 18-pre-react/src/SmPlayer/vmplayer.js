'use strict';
/* eslint-disable */

import CSuperRender2 from './super_render_20.js';
import worker_script from './decode_worker.js';
import icon from './smicon.js';
window.debug = false;

const SuperRender2 = CSuperRender2();

export const Version = 'SmPlayer v0.0.6 20220929';

export default function vmplayer(videoCanvasId, drawCanvasId, wsUrl) {
  this.videoCanvasId = videoCanvasId;
  this.videomse = drawCanvasId;
  this.wsUrl = wsUrl;
  this.ws = null;
  this.frame_queue = [];
  this.sei_queue = [];
  this.sei_frame_callback = null;
  this.DecodeWorker = null;
  this.SuperRender = null;
  this.pre_ptz;
  this.startPlay = null;
  this.onMediaInfo = null;
  this.errorCallback = null;
  this.wsClose = null;
  this.MediaStatusCallback = null;
  this.MediaStatus = {};
  this.MediaStatus.Url = wsUrl;
  this.MediaStatusTimer = null;
}

vmplayer.prototype.open = function (callback) {
  let first_message = true;
  let second_message = true;
  let isH265 = false;
  let wasm_loaded = false;
  let sourcebuffer = null;

  let pre_width = 0;
  let pre_height = 0;

  let ReceiveStartTime = 0;
  let FrameCount = 0;
  let FrameByteRate = 0;

  let video = document.getElementById(this.videomse);

  const canvas = document.getElementsByClassName('pointCanvas')[0];
  var canvasc = canvas.getContext('2d');

  // console.log(window.WebSocket);
  if (!window.WebSocket) {
    console.log('浏览器不支持ws');
    callback && callback('初始化失败，请使用chrome浏览器');
    return;
  }

  if (!this.wsUrl.includes('ws')) {
    callback && callback('视频流地址格式异常，请检查');
    return;
  }
  const a1 = document.getElementsByClassName('pointCanvas')[0];
  var a = a1.getContext('2d');

  try {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.binaryType = 'arraybuffer';
    this.ws.onmessage = function (evt) { 
      if (first_message) {
        console.log("===first_message==>",evt.data)
        first_message = false;
        if (evt.data == 'h265') { 
          this.SuperRender = new SuperRender2(this.videoCanvasId);
          isH265 = true;
          this.startPlay && this.startPlay('265');
          this.DecodeWorker = new Worker(worker_script);
          this.DecodeWorker.onmessage = function (evt) {
            switch (evt.data.command) {
              case 'loaded':
                wasm_loaded = true;
                break;
              case 'frame':
                var width = evt.data.width;
                var height = evt.data.height;
                var ydata = new Uint8Array(evt.data.YData);
                var udata = new Uint8Array(evt.data.UData);
                var vdata = new Uint8Array(evt.data.VData);
                this.SuperRender.SR_DisplayFrameData(width, height, ydata, udata, vdata);
                var mediainfo = { width: width, height: height };
                if (mediainfo.width != pre_width || mediainfo.height != height) {
                  this.onMediaInfo && this.onMediaInfo(mediainfo);
                }
                pre_width = width;
                pre_height = height;

                if (this.sei_queue.length !== 0) {
                  this.sei_frame_callback && this.sei_frame_callback(this.sei_queue.shift());
                }
                break;
            }
          }.bind(this);
        } else {
          open_media(evt.data);
        }
        return;
      } 
      if (typeof evt.data === 'string') {
        let seijson = JSON.parse(evt.data);
        seijson.pts = seijson.pts / 1000;
        this.sei_queue.push(seijson);
        if (this.sei_queue.length > 200) {
          this.sei_queue.splice(0, this.sei_queue.length - 200);
        }
      } else {
        if (isH265) {
          if (second_message) {
            second_message = false;
            return;
          }
          this.frame_queue.push(evt.data);
          if (!wasm_loaded) {
            return;
          }
          let frame = this.frame_queue.shift();
          this.DecodeWorker.postMessage(frame, [frame]);
        } else {
          
          FrameCount += 1;
          FrameByteRate += evt.data.byteLength;
          console.log("===onmessage==>",FrameCount,FrameByteRate)
          if (ReceiveStartTime === 0) {
            ReceiveStartTime = Date.now();
          } 
          this.frame_queue.push(evt.data);
          if (!sourcebuffer || sourcebuffer.updating) {
            return;
          }
          if (this.frame_queue.length === 1) {
            sourcebuffer.appendBuffer(this.frame_queue.shift());
          } else {
            let byte_length = 0;
            for (const qnode of this.frame_queue) {
              byte_length += qnode.byteLength;
            }
            let mp4buf = new Uint8Array(byte_length);
            let offset = 0;
            for (const qnode of this.frame_queue) {
              let frame = new Uint8Array(qnode);
              mp4buf.set(frame, offset);
              offset += qnode.byteLength;
            }
            sourcebuffer.appendBuffer(mp4buf);
            this.frame_queue.splice(0, this.frame_queue.length);
          }
        }
      }
    }.bind(this);

    this.ws.onclose = function (e) {
      console.log('websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean, e);
      this.MediaStatusTimer && clearInterval(this.MediaStatusTimer);
      this.MediaStatus.ReceiveFPS = '0';
      this.MediaStatus.ByteRate = '0KB/s';
      this.MediaStatusCallback && this.MediaStatusCallback(this.MediaStatus);

      this.wsClose && this.wsClose();
    }.bind(this);

    this.ws.onerror = function (e) {
      // console.log(e, 'error的e');
    };

    var open_media = function (media_description) {
      let video = document.getElementById(this.videomse);
      let mediasource = new MediaSource();
      const url = URL.createObjectURL(mediasource);  
      video.src = url; 
      this.startPlay && this.startPlay('264');
      mediasource.onsourceopen = function () {
        try {
          sourcebuffer = mediasource.addSourceBuffer('video/mp4; codecs=avc1.' + media_description);
          let pre_pos = 0;
          sourcebuffer.onupdateend = function () {
            let pos = video.currentTime;
            if (video.buffered.length > 0) {
              let start = video.buffered.start(video.buffered.length - 1);
              let end = video.buffered.end(video.buffered.length - 1);
              debug && console.log('pos=' + pos + ',start=' + start + ',end=' + end);
              if (pos < start) {
                debug &&
                  console.log(
                    'set video.currentTime pos=' + pos + ',start=' + start + ',end=' + end,
                  );
                video.currentTime = start;
              }

              if (pos > end) {
                debug && console.warn('chase frame pos=' + pos + ',start=' + start + ',end=' + end);
                video.currentTime = start;
              }

              if (pos - pre_pos != 0 && end - pos > 3) {
                debug &&
                  console.log(
                    'set end video.currentTime pos=' + pos + ',start=' + start + ',end=' + end,
                  );
                video.currentTime = end;
              }

              if (video.buffered.length > 1) {
                for (let i = 0; i < video.buffered.length - 1; i++) {
                  let prestart = video.buffered.start(i);
                  let preend = video.buffered.end(i);
                  if (!sourcebuffer.updating) {
                    sourcebuffer.remove(prestart, preend);
                  }
                }
              }

              if (pos - start > 10 && !sourcebuffer.updating) {
                debug &&
                  console.warn('remove start pos=' + pos + ',start=' + start + ',end=' + end);
                sourcebuffer.remove(0, pos - 3);
              }

              if (end - pos > 10 && !sourcebuffer.updating) {
                debug && console.warn('remove end pos=' + pos + ',start=' + start + ',end=' + end);
                sourcebuffer.remove(0, end - 3);
              }
            }
            pre_pos = pos; 
          };
        } catch (err) {
          console.log(err);
          // console.log(this.ws);
          callback && callback('视频流异常，请稍后重试刷新');
        }
      };
    }.bind(this);
  } catch (e) {
    console.log(e);
    callback && callback('视频流异常，请稍后重试刷新');
  }

  let mediastat = function () {
    let CostTime = (Date.now() - ReceiveStartTime) / 1000;
    //console.log("CostTime=" + CostTime + ",FrameCount=" + FrameCount);
    this.MediaStatus.ReceiveFPS = (FrameCount / CostTime).toFixed(2);
    this.MediaStatus.ByteRate = (FrameByteRate / CostTime / 1024).toFixed(2) + 'KB/s';
    this.MediaStatus.BufferSize = this.frame_queue.length;
    ReceiveStartTime = 0;
    CostTime = 0;
    FrameCount = 0;
    FrameByteRate = 0;
    this.MediaStatusCallback && this.MediaStatusCallback(this.MediaStatus);
    //console.log("this.MediaStatus.ReceiveFPS=" + this.MediaStatus.ReceiveFPS + ",ByteRate=" + this.MediaStatus.ByteRate + ",this.frame_queue.length=" + this.frame_queue.length);
    // console.log(123)
  }.bind(this);

  var updateCanvas = function (now, metadata) {
    do {
      if (this.sei_queue.length === 0) {
        break;
      }

      let seijson = this.sei_queue[0];
      //console.log("len=" + this.sei_queue.length + ",sei.pts=" + seijson.pts + ",video.ptr=" + metadata.mediaTime);

      if (seijson.pts - metadata.mediaTime > 0.1) {
        break;
      } else if (seijson.pts < metadata.mediaTime) {
        this.sei_queue.shift();
        while (seijson.pts < metadata.mediaTime && this.sei_queue.length !== 0) {
          seijson = this.sei_queue.shift();
        }
        this.sei_frame_callback && this.sei_frame_callback(seijson);
      } else {
        this.sei_frame_callback && this.sei_frame_callback(seijson);
        this.sei_queue.shift();
      }
    } while (false);
    video.requestVideoFrameCallback(updateCanvas);
  }.bind(this);
  video.requestVideoFrameCallback(updateCanvas);

  this.MediaStatus.Url = this.wsUrl;
  this.MediaStatusTimer && clearInterval(this.MediaStatusTimer);
  this.MediaStatusTimer = setInterval(mediastat, 1000);
};

vmplayer.prototype.onerror = function (callback) {
  if (callback && this.ws) {
    vmplayer.prototype.errorCallback = callback;
    this.ws.onerror = function (e) {
      // console.log(e);
      // console.log(e.target.readyState);
      // console.log('播放失败');
      if (e.target.readyState === 3) {
        // console.log(window.navigator.onLine);
        if (window.navigator.onLine) {
          callback('视频流地址不存在，请联系管理员');
        } else {
          callback('网络异常，请检查网络连接情况后重试播放');
        }
      }
    };
  }
};

vmplayer.prototype.close = function (e) {
  this.ws && this.ws.close();
  // console.log(this.MediaStatusTimer);
  this.MediaStatusTimer && clearInterval(this.MediaStatusTimer);
  this.DecodeWorker && this.DecodeWorker.terminate();
  this.SuperRender && this.SuperRender.SR_Destroy();
};

vmplayer.prototype.onStartPlay = function (callback) {
  this.startPlay = callback;
};
vmplayer.prototype.pause = function (callback) {
  console.log('暂停');
};

vmplayer.prototype.intelligence_frame_callback = function (callback) {
  this.sei_frame_callback = callback;
};

vmplayer.prototype.onMediaInfoChange = function (callback) {
  this.onMediaInfo = callback;
};

/** 为重连逻辑回调 */
vmplayer.prototype.onWsClose = function (callback) {
  this.wsClose = callback;
};

vmplayer.prototype.onMediaStatus = function (callback) {
  this.MediaStatusCallback = callback;
};

// console.log(Version);

console.log(
  `%c ${Version}`,
  `font-size: 14px;
   color: #317ef2;
   margin: 10px 10px 10px 16px ;
   padding: 12px 12px 12px 36px;
   border-radius: 6px;
   background:#eceff1  url(${icon})5px center no-repeat;
   background-size: 20px;`,
);

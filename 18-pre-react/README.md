# SmPlayer

SmPlayer播放器组件是在闪马组件库中，[gitlab地址](https://git.supremind.info/product/app/vmp/front/common/supremind-components/tree/2.0)，目前基于2.0分支进行迭代开发。


## 视音频基础

因为前端领域对视频领域的涉及场景不多，一个 ```<video />``` 标签就可以满足大部分场景，但是经历了这几年直播和短视频的爆发，视频的需求和功能也变得越来越复杂，在此先对视音频基础进行一个简单的介绍。

视频中我们通常说的视频的格式，比如 .mp4, .mov, .wmv, .m3u8, .flv 等等被称为 container。在一个视频文件中音频、视频数据是分开存储的，使用的压缩算法也不一样。其中container作为容器主要包含了video数据、audio数据、metadata（用于检索视音频payload格式等信息）。每个格式的封装格式不一样，比如FLV格式的基本单元是Tag，而MP4格式的基本单元是Box，辅助的meta信息用于检索找到对应的原始数据。

而平时听到的H.264, H.265等视频编码标准被称为 codec (COmpress and DECompress )。一个视频格式比如mp4可以使用任何标准化的压缩算法，这些信息都会被包含在一个视频文件的meta信息中来告诉播放器该用什么编解码算法来播放。

## Video标签

### muted

指定播放视频时是否静音。增加这个属性可以流畅播放。

### autoplay

布尔属性；声明该属性后，视频会尽快自动开始播放，不会停下来等待数据全部加载完成。

### playsInline

布尔属性，指明视频将内联（inline）播放，即在元素的播放区域内。即不全屏。

### loop

布尔属性；指定后，会在视频播放结束的时候，自动返回视频开始的地方，继续播放。

### crossorigin

该枚举属性指明是否使用 CORS（跨域资源共享）来获取相关视频。允许 CORS 的资源 可在 \<canvas\> 元素中被重用，而不会被污染。允许的值如下：


## Blob流媒体

自从HTML5提供了video标签，在网页中播放视频已经变成一个非常简单的事，只要一个video标签，src属性设置为视频的地址就完事了。由于src指向真实的视频网络地址，在早期一般网站资源文件不怎么通过referer设置防盗链，当我们拿到视频的地址后可以随意的下载或使用（每次放假回家，就会有亲戚找我帮忙从一些视频网站上下东西）。

目前的云存储服务商大部分都支持referer防盗链。其原理就是在访问资源时，请求头会带上发起请求的页面地址，判断其不存在（表示直接访问图片地址）或不在白名单内，即为盗链。

可是从某个时间开始我们打开调试工具去看各大视频网站的视频src会发现，它们统统变成了这样的形式。

其实这个Blob URL也不是什么新技术，国内外出来都有一阵子了，但是网上的相关的文章不多也不是很详细，今天就和大家一起分享学习一下。

### Blob和ArrayBuffer

最早是数据库直接用Blob来存储二进制数据对象，这样就不用关注存储数据的格式了。在web领域，Blob对象表示一个只读原始数据的类文件对象，虽然是二进制原始数据但是类似文件的对象，因此可以像操作文件对象一样操作Blob对象。播放器


## MediaSource

video标签src指向一个视频地址，视频播完了再将src修改为下一段的视频地址然后播放，这显然不符合我们无缝播放的要求。其实有了我们前面Blob URL的学习，我们可能就会想到一个思路，用Blob URL指向一个视频二进制数据，然后不断将下一段视频的二进制数据添加拼接进去。这样就可以在不影响播放的情况下，不断的更新视频内容并播放下去。

要实现这个功能我们要通过MediaSource来实现，MediaSource接口功能也很纯粹，作为一个媒体数据容器可以和HTMLMediaElement进行绑定。基本流程就是通过URL.createObjectURL创建容器的BLob URL，设置到video标签的src上，在播放过程中，我们仍然可以通过MediaSource.appendBuffer方法往容器里添加数据，达到更新视频内容的目的。

## 视频是什么

视频，其实就是一系列连续播放的图片，如果1s钟播放24张图片，那么人眼看到的就不再是一张张独立的图片，而是动起来的画面。其中一张图片称为一帧，1s播放的图片数称为帧率。常见的帧率有24帧/s，30帧/s,32帧/s。

视频是由图片构成的，图片是由像素构成的，假设尺寸为 1024*768。每个像素由RGB构成，每个8位，共24位。

假设帧率是30，那么每秒钟的视频的尺寸如下：

```js
30帧x1024x768x24=566231040Bits=70778880Bytes
```

一分钟视频的尺寸就是 4246732800Bytes已经是4个G了。

```js
1Byte=8bit
1MB=1024Byte(2^10)
1GB=1024MB(2^20Byte)
```

可以看到，这个数据量是很大的，不好进行网络传输以及存储，所以需要对视频进行压缩，也就是编码。

经过编码之后，视频由一帧帧的图片，变成了一串串让人看不懂的二进制代码，因为编码的方式(算法)的不同，所以就有了编码格式的区分。常见的编码格式有 H.264,MPEG-4,VP8等。

这里需要注意的一点是，因为编码格式是有版权问题的，所以不同的浏览器支持的编码格式不同，所以就会出现有些编码格式的视频在某些浏览器播放不了，或者只有声音没有画面的情况。

我们前端开发只需要记住一点，主流浏览器支持的视频编码格式是h264。

## 总结并补充一些概念

### 分辨率

屏幕是由一个个像素点组成的，我们常见的1080p，是指屏幕竖直方向有1080个像素，共有1920列，一共207万像素。2K，2560x1440，共369万像素。

```js
显示分辨率（屏幕分辨率）是屏幕图像的精密度，是指显示器所能显示的像素有多少。由于屏幕上的点、线和面都是由像素组成的，显示器可显示的像素越多，画面就越精细，同样的屏幕区域内能显示的信息也越多，所以分辨率是个非常重要的性能指标之一。可以把整个图像想象成是一个大型的棋盘，而分辨率的表示方式就是所有经线和纬线交叉点的数目。显示分辨率一定的情况下，显示屏越小图像越清晰，反之，显示屏大小固定时，显示分辨率越高图像越清晰。
```

分辨率对视频体积有一定影响，但是不是分辨率越大，视频越清晰，还要看码率。

### 帧率FPS

每秒显示的帧数，就是1s播放的图片数量(Frames per Second)。

```js
由于人类眼睛的特殊生理结构，如果所看画面之帧率高于24的时候，就会认为是连贯的，此现象称之为视觉暂留。这也就是为什么电影胶片是一格一格拍摄出来，然后快速播放的。
而对游戏，一般来说，第一人称射击游戏比较注重FPS的高低，如果FPS<30的话，游戏会显得不连贯。所以有一句有趣的话：“FPS（指FPS游戏）重在FPS（指帧率）。
每秒的帧数(fps)或者说帧率表示图形处理器处理场时每秒钟能够更新的次数。高的帧率可以得到更流畅、更逼真的动画。一般来说30fps就是可以接受的，但是将性能提升至60fps则可以明显提升交互感和逼真感，但是一般来说超过75fps一般就不容易察觉到有明显的流畅度提升了。如果帧率超过屏幕刷新率只会浪费图形处理的能力，因为监视器不能以这么快的速度更新，这样超过刷新率的帧率就浪费掉了。
```
### 码率（比特率）

码率，也叫比特率，帧率是1S播放多少帧，类比一下，比特率就是1s的视频有多少bit。

这个参数决定了视频是否清晰。

一个1080P的视频，大小可以为1G，也可以为4G，视频越大，说明1S存放的数据越多，比特率越高，压缩比越小，视频越清晰。

1080P，长度为100分钟，大小为1GB的视频的比特率是多少？

```js
总时间为
100分钟=100X60S=6000s
总数据量为
1GB=1024MB= 1024X1024KB=1024X1024X1024Byte=1024X1024X1024X8bit=8589934592bit
帧率为 (数据量/时间)
8589934592/6000 = 1.4Mbit/s
```

帧率和分辨率都可以影响视频体积，但是帧率是主要因素，在工作中如果看到一个很短的视频非常大，很大可能性是因为帧率很大，为了便于网络传输，需要降低帧率。一般来说主流视频平台的帧率在1Mbit/s左右。

## 相关API介绍

### 1.url

目前支持直播流（ws开头）、视频流（http开头）

### 2.
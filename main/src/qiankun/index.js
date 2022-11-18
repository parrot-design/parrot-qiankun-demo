import { rewriteRouter } from "./rewrite-router";
import { handleRouter } from "./handle-router";
let _apps=[];

export const registerMicroApps=(apps)=>{
    console.log(apps)
    _apps=apps;
}

export const getApp=()=>_apps;

export const start=()=>{
    //微前端的原理：
    //1、监听路由变化 
    rewriteRouter(); 

    handleRouter();
}
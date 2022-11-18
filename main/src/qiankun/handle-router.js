/**
 * 处理路由变化
 */

import { getApp } from ".";
import { importHTML } from "./import-html";

export const handleRouter=async ()=>{ 
    //2、匹配子应用 
    //2.1 获取当前的路由路径 
    //2.2 去apps里面查找 
    const apps=getApp();
    const app=apps.find(item=>window.location.pathname.startsWith(item.activeRule)); 

    if(!app) return;
    //3、加载子应用 
    const { template,getExternalScripts,execScripts }=await importHTML(app.entry);
    const container=document.querySelector(app.container);  
    container.appendChild(template);

    window.__POWERED_BY_QIANKUN__=true;

    const appExports=await execScripts();

    console.log(appExports)
    app.mount=appExports.mount;
    app.unmount=appExports.unmount;
    app.bootstrap=appExports.bootstrap;
    

    await bootstrap(app);
    await mount(app);
    // await unmount(app);
 

    // 请求获取子应用的资源
    // const html=await fetch(app.entry).then(res=>res.text());
    // console.log(html)
    

    // //1.客户端渲染需要通过执行js生成内容
    // //2.浏览器的安全考虑innerHTML中的script是不会加载执行的
    // container.innerHTML=html;

    //手动加载子应用的script
    //执行script中的代码

    
    //4、渲染子应用
}

const bootstrap=async (app)=>{
    app.bootstrap?.()
}
const unmount= async (app)=>{
    app.unmount?.({
        container:document.querySelector(app.container)
    })
}
const mount= async (app)=>{
    app.mount?.({
        container:document.querySelector(app.container)
    })
}
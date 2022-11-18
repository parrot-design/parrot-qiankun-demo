import { handleRouter } from "./handle-router";

let prevRoute='';//上一个路由
let nextRoute=window.location.pathname;//下一个路由
export const rewriteRouter = () => {
  //history.go、history.back、history.forward使用popstate
  //pushState、replaceState需要通过函数重写的方式进行劫持
  window.addEventListener("popstate", () => {
    handleRouter();
  });
  const rawPushState = window.history.pushState;
  window.history.pushState = (...args) => {
    rawPushState.apply(window.history, args);
    handleRouter();
  };
  const rawReplaceState = window.history.replaceState;
  window.history.replaceState = (...args) => {
    rawReplaceState.apply(window.history, args);
    handleRouter();
  };
};

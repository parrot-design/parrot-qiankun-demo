import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerMicroApps,start } from "qiankun";
import './index.css';
import App from './App'; 

//当匹配到activeRule时，请求获取entry资源，渲染到container中

registerMicroApps([
    {
        name:'react app',
        entry: '//localhost:5001',
        container: '#container',
        activeRule:'/pre-react'
    },
    {
        name:'vue2 app',
        entry: '//localhost:5002',
        container: '#container',
        activeRule:'/vue2'
    },
    {
        name:'vue3 app',
        entry: '//localhost:5003',
        container: '#container',
        activeRule:'/vue3'
    }
]);

start();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render( 
    <App /> 
);
 
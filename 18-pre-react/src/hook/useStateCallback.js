import React , { useEffect, useState,useRef } from "react";

export default function useStateCallback(initiaValue){

    const [value,setValue]=useState(initiaValue);

    const callbackFunc=useRef();

    const setValueWrapper=(changeValue,callback)=>{
        console.log("===setValueWrapper==>",changeValue,callback)
        callbackFunc.current=callback;
        setValue(changeValue);
    }

    useEffect(()=>{  
        callbackFunc.current?.(value);  
    },[value]);

    return [value,setValueWrapper]

}
import { fetchResource } from "./fetch-resource";

export const importHTML=async (url)=>{ 

    const html= await fetchResource(url);
    const template=document.createElement('div');
    template.innerHTML=html;

    const scripts=template.querySelectorAll('script');

    //获取所有script标签的代码：[代码，代码]
    const getExternalScripts=()=>{ 
        return Promise.all(Array.from(scripts).map(script=>{
            const src=script.getAttribute('src');
            if(!src){
                return Promise.resolve(script.innerHTML);
            }else{
                return fetchResource(
                    src.startsWith('http') ? src :`${url}${src}`
                )
            }
        })) 
    }

    //获取并执行所有的script代码
    const execScripts=async ()=>{
        const scripts=await getExternalScripts(); 
        //手动构造一个commonjs环境
        const module={exports:{}};
        const exports=module.exports;
        scripts.forEach(code=>{
            eval(code);
        })
        return module.exports;
    }

    return {
        template,
        getExternalScripts,
        execScripts
    }
}
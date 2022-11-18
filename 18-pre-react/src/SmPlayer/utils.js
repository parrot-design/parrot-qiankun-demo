export const isHttp=(url)=>{
    return url.slice(0, 4) === 'http' && url.slice(-4) === '.mp4'
}
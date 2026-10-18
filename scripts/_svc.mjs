import puppeteer from 'puppeteer-core';
import fs from 'fs';
const chrome=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
const b=await puppeteer.launch({executablePath:chrome,headless:'new'});
const sizes=[[375,667],[600,900],[768,1024],[820,1180],[912,1368],[1024,768],[1024,1366],[1180,820],[1280,800],[1440,900]];
const p=await b.newPage();
for(const [w,h] of sizes){
 await p.setViewport({width:w,height:h});
 await p.goto('http://localhost:3000/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,600));
 const r=await p.evaluate(()=>{
  const cards=[...document.querySelectorAll('.stack-card')];
  const out=cards.map(c=>({h:Math.round(c.offsetHeight),top:parseInt(getComputedStyle(c).top)}));
  const last=out[out.length-1];
  return {vh:innerHeight,out,lastBottom:last.top+last.h,fits:out.every(o=>o.top+o.h<=innerHeight)};
 });
 console.log(w+'x'+h,JSON.stringify(r));
}
await b.close();

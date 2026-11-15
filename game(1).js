(() => {
"use strict";
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
let W=innerWidth,H=innerHeight,DPR=1;
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}
addEventListener("resize",resize);resize();
const TILE=32,MAP_W=42,MAP_H=32;
const state={started:false,gender:"Laki-laki",x:MAP_W*TILE/2,y:MAP_H*TILE/2,dir:"down",moving:false,frame:0,day:1,money:100,stamina:100,region:"Yukimori",inside:false,affection:0,partner:false,married:false,children:0,plots:{},story:0};
const keys={up:false,down:false,left:false,right:false};
const seasons=["Musim Semi","Musim Panas","Musim Gugur","Musim Dingin"];
const season=()=>seasons[Math.floor((state.day-1)/7)%4];
const $=id=>document.getElementById(id);
function toast(t){const e=$("toast");e.textContent=t;e.style.display="block";clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.style.display="none",2300)}
function dialog(title,text){$("dialogTitle").textContent=title;$("dialogText").textContent=text;$("dialog").classList.remove("hidden")}
$("dialogClose").onclick=()=>$("dialog").classList.add("hidden");
function newGame(gender){Object.assign(state,{started:true,gender,x:MAP_W*TILE/2,y:MAP_H*TILE/2});$("start").classList.add("hidden");toast("Selamat datang di Yukimori, Hokkaido!")}
function continueGame(){try{const s=JSON.parse(localStorage.getItem("standfarm_save"));if(!s)return;Object.assign(state,s,{started:true});$("start").classList.add("hidden");toast("Save berhasil dimuat!")}catch(e){toast("Save tidak dapat dibaca.")}}
window.newGame=newGame;
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function drawCharacter(x,y,color,dir,frame){
 rect(x-7,y-5,14,13,color);rect(x-6,y-15,12,10,"#efc69b");rect(x-7,y-18,14,5,"#563b2a");
 const eyeX=dir==="left"?-5:dir==="right"?3:-3,eyeY=dir==="up"?-14:-10;
 if(dir!=="up")rect(x+eyeX,y+eyeY,2,2,"#202020");
 const leg=frame%2?2:0;rect(x-5,y+8,4,5+leg,"#493d35");rect(x+1,y+8,4,5-leg,"#493d35");
}
function drawWorld(){
 ctx.clearRect(0,0,W,H);
 const camX=state.x-W/2,camY=state.y-H/2;
 for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
  const sx=x*TILE-camX,sy=y*TILE-camY,edge=x<2||y<2||x>MAP_W-3||y>MAP_H-3;
  rect(sx,sy,TILE,TILE,edge?"#477b4b":"#79b85c");
  if((x*7+y*11)%9===0){rect(sx+7,sy+8,3,3,"#a4d77b");rect(sx+22,sy+24,3,3,"#a4d77b")}
 }
 // river and bridge
 rect(6*TILE-camX,0-camY,3*TILE,MAP_H*TILE,"#4a9dbd");
 rect(6*TILE-camX,14*TILE-camY,3*TILE,TILE,"#c7a477");
 // village road
 rect(9*TILE-camX,14*TILE-camY,19*TILE,2*TILE,"#c7a477");
 // house
 rect(17*TILE-camX,8*TILE-camY,5*TILE,2*TILE,"#8d493b");
 rect(18*TILE-camX,10*TILE-camY,3*TILE,3*TILE,"#d5a36a");
 rect(19*TILE-camX,11*TILE-camY,TILE,2*TILE,"#5b3c2a");
 // farm beds
 for(let y=0;y<3;y++)for(let x=0;x<4;x++)rect((16+x*1.2)*TILE-camX,(15+y*1.1)*TILE-camY,30,24,"#805332");
 // cherry tree
 rect(29*TILE-camX,8*TILE-camY,9,24,"#70472c");
 ctx.fillStyle=season()==="Musim Semi"?"#f4a8c7":"#3e8849";ctx.beginPath();ctx.arc(29*TILE-camX+4,8*TILE-camY,18,0,Math.PI*2);ctx.fill();
 // Mira NPC
 drawCharacter(24*TILE-camX,13*TILE-camY,"#d65b9d","down",0);
 // player
 drawCharacter(W/2,H/2,state.gender==="Laki-laki"?"#3e78d0":"#d65b9d",state.dir,state.frame);
 if(state.inside){
  rect(0,0,W,H,"#9a7048");rect(W*.12,H*.12,W*.76,H*.76,"#c59a67");
  rect(W*.18,H*.2,W*.64,H*.65,"#a47b50");rect(W*.32,H*.55,W*.35,H*.18,"#69452e");
  rect(W*.68,H*.2,W*.1,H*.12,"#6d4931");
  drawCharacter(W/2,H/2,state.gender==="Laki-laki"?"#3e78d0":"#d65b9d",state.dir,state.frame);
 }
 $("place").textContent=(state.inside?"Rumah Keluarga":state.region)+" • Hokkaido";
 $("day").textContent=state.day;$("season").textContent=season().replace("Musim ","");$("money").textContent=state.money;$("stamina").textContent=state.stamina;
}
function update(){
 if(state.started && $("dialog").classList.contains("hidden") && $("mapbox").classList.contains("hidden")){
  let dx=(keys.right?1:0)-(keys.left?1:0),dy=(keys.down?1:0)-(keys.up?1:0);
  state.moving=!!(dx||dy);
  if(state.moving){const n=Math.hypot(dx,dy);state.x=Math.max(TILE*3,Math.min((MAP_W-3)*TILE,state.x+dx/n*2.1));state.y=Math.max(TILE*3,Math.min((MAP_H-3)*TILE,state.y+dy/n*2.1));state.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up");state.frame=Math.floor(Date.now()/180)%2}
 }
 drawWorld();requestAnimationFrame(update);
}
requestAnimationFrame(update);
["up","down","left","right"].forEach(k=>{const el=$(k);el.onpointerdown=e=>{e.preventDefault();keys[k]=true};el.onpointerup=el.onpointerleave=el.onpointercancel=()=>keys[k]=false});
addEventListener("keydown",e=>{const m={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right"};if(m[e.key])keys[m[e.key]]=true});
addEventListener("keyup",e=>{const m={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right"};if(m[e.key])keys[m[e.key]]=false});
function interact(){
 if(state.inside){state.inside=false;toast("Kamu keluar dari rumah.");return}
 const houseX=19.5*TILE,houseY=11*TILE;
 if(Math.hypot(state.x-houseX,state.y-houseY)<95){state.inside=true;dialog("Rumah keluarga","Rumah kecil peninggalan keluargamu. Kelak kamu bisa memperluas dan menghiasnya.");return}
 const miraX=24*TILE,miraY=13*TILE;
 if(Math.hypot(state.x-miraX,state.y-miraY)<105){state.affection=Math.min(100,state.affection+5);dialog("Mira — Penduduk Yukimori","Mira: Selamat datang! Aku Mira, tabib desa. Senang bertemu denganmu. Kedekatan: "+state.affection+"/100.");return}
 dialog("Yukimori","Desa kecil di Hokkaido. Jelajahi rumah, sungai, ladang, dan temui penduduk desa.");
}
$("action").onclick=interact;
$("sleep").onclick=()=>{state.day++;state.stamina=100;toast("Hari baru dimulai. Stamina pulih!")};
$("save").onclick=()=>{try{localStorage.setItem("standfarm_save",JSON.stringify(state));toast("Permainan disimpan di perangkat.")}catch(e){toast("Penyimpanan browser gagal.")}};
$("map").onclick=()=>$("mapbox").classList.remove("hidden");
$("mapClose").onclick=()=>$("mapbox").classList.add("hidden");
document.querySelectorAll("[data-region]").forEach(b=>b.onclick=()=>{const r=b.dataset.region;if(r!=="Yukimori"){toast("Wilayah "+r+" masih dalam pengembangan.");return}state.region=r;state.inside=false;$("mapbox").classList.add("hidden");toast("Kamu berada di Yukimori.")});
try{if(localStorage.getItem("standfarm_save"))$("continueSlot").innerHTML='<button onclick="continueGame()">LANJUTKAN PERMAINAN</button>'}catch(e){}
window.continueGame=continueGame;
})();
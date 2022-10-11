class Risky{constructor(e={}){this.ladder=document.querySelector("#ladder"),this.ladderWrapper=document.querySelector("#ladder-wrapper"),this.tiles=ladder.querySelectorAll("li"),this.debugEnabled=!1,this.cooldown=!1,this.cooldownTimer=null,this.toggleTeaser=!1,this.blocked=!1,this.gameover=!1,this.levelIndex=1,this.level={0:{active:14,prev:14,win:14,loose:14,amount:0},1:{active:13,prev:14,win:12,loose:14,amount:15},2:{active:12,prev:13,win:11,loose:14,amount:30},3:{active:11,prev:12,win:10,loose:14,amount:60},4:{active:10,prev:11,win:9,loose:14,amount:120},5:{active:9,prev:10,win:8,loose:14,amount:240},6:{active:8,prev:14,win:8,loose:8,amount:"PLAYOUT"},7:{active:7,prev:8,win:6,loose:14,amount:400},8:{active:6,prev:7,win:5,loose:7,amount:800},9:{active:5,prev:6,win:4,loose:6,amount:1200},10:{active:4,prev:5,win:3,loose:5,amount:2e3},11:{active:3,prev:4,win:2,loose:4,amount:3200},12:{active:2,prev:3,win:1,loose:3,amount:5200},13:{active:1,prev:2,win:0,loose:2,amount:8400},14:{active:0,prev:1,win:0,loose:0,amount:14e3}},this.sounds={toggle:"./assets/audio/toggle.mp3",teaseOne:"./assets/audio/tease-one.mp3",teaseTwo:"./assets/audio/tease-two.mp3",levelUp:"./assets/audio/level-up.mp3",levelDown:"./assets/audio/level-down.mp3",gameover:"./assets/audio/gameover.mp3",playout:"./assets/audio/playout.mp3",restart:"./assets/audio/restart.mp3",win:"./assets/audio/win.mp3"},this.soundsEnabled=!1,this.gameTimer=null,this.chance=800,this.initialize()}initialize(){this.timer(),this.controls(),this.debugTimer(),this.disableScrolling(),this.toggleSound()}timer(){this.gameTimer=setInterval((()=>{switch(this.focus(),this.setState("select",this.level[this.levelIndex].active),this.tease(this.level[this.levelIndex]),this.debugEnabled?this.chance=1:this.chance=this.random(0,1100),this.levelIndex){case 14:this.blocked=!0,this.setState("select",0),clearInterval(this.gameTimer),this.status("show","You won"),this.playSound("win");break;case 6:clearInterval(this.gameTimer),this.playout(),this.playSound("playout");break;case 0:this.gameover=!0,this.blocked=!0,this.setState("select",14),clearInterval(this.gameTimer),this.status("show","Game over"),this.playSound("gameover")}}),300)}playout(){this.ladderWrapper.scrollTo(0,0),this.blocked=!0,this.animation(2)}animation(e){if(0==e)return this.random(0,100)>85?this.levelIndex=this.random(7,13):this.levelIndex=7,this.timer(),void(this.blocked=!1);for(let e=0;e<9;e++)setTimeout((()=>{this.setState("select",8-e)}),50*e);setTimeout((()=>{for(let e=0;e<9;e++)setTimeout((()=>{this.setState("unselect",8-e)}),50*e)}),300),setTimeout((()=>e*this.animation(e-1)),600)}setState(e,t){switch(e){case"select":this.tiles[t].classList.add("active");break;case"unselect":this.tiles[t].classList.remove("active")}}debugTimer(){this.debugEnabled&&setInterval((()=>{document.querySelector("#dbg-current-level").innerHTML=this.level[this.levelIndex].active+"("+this.level[this.levelIndex].amount+")",document.querySelector("#dbg-current-index").innerHTML=this.levelIndex,document.querySelector("#dbg-level-info").innerHTML=`[ W: ${this.level[this.levelIndex].win}, L: ${this.level[this.levelIndex].loose}, P: ${this.level[this.levelIndex].prev} ]`,document.querySelector("#dbg-cooldown").innerHTML=this.cooldown,document.querySelector("#dbg-tease").innerHTML=this.toggleTeaser,document.querySelector("#dbg-blocked").innerHTML=this.blocked,document.querySelector("#dbg-chance").innerHTML=this.chance}),50)}debug(){this.debugEnabled=!0,document.querySelector("#debug").style.display="block",this.debugTimer(),console.log("Debug enabled")}tease(e){this.toggleTeaser?(this.setState("select",e.loose),this.setState("unselect",e.win),this.toggleTeaser=!1,this.playSound("teaseTwo")):(this.setState("select",e.win),this.setState("unselect",e.loose),this.toggleTeaser=!0,this.playSound("teaseOne"))}status(e,t){var s=document.querySelector("#status"),i=document.querySelector("#statusText"),l=document.querySelector("#statusButton");switch(e){case"hide":s.style.marginLeft="-100%";break;case"show":s.style.marginLeft="0",i.innerText=t,l.onclick=()=>{this.restart()}}}focus(){this.ladderWrapper.scrollTo(0,40*this.level[this.levelIndex].active)}restart(){clearInterval(this.gameTimer),this.playSound("restart"),this.levelIndex=1,this.blocked=!1,this.gameover=!1,this.status("hide",""),this.timer()}random(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1)+e)}controls(){window.onkeydown=function(e){return!(32==e.keyCode&&e.target==document.body)},document.addEventListener("keydown",(e=>{if(" "==e.key&&!this.cooldown)return this.gameover?this.restart():void(this.blocked||(clearTimeout(this.cooldownTimer),this.cooldown=!0,this.cooldownTimer=setTimeout((()=>{this.cooldown=!1}),400),this.setState("unselect",this.level[this.levelIndex].active),this.setState("unselect",this.level[this.levelIndex].prev),this.setState("unselect",this.level[this.levelIndex].loose),this.setState("unselect",this.level[this.levelIndex].win),this.logic()))}))}disableScrolling(){var e=function(e){return e.stopPropagation(),e.preventDefault(),!1};this.ladderWrapper.addEventListener("scroll",e,!1),this.ladderWrapper.addEventListener("touchmove",e,!1),this.ladderWrapper.addEventListener("wheel",e,!1)}logic(){this.random(0,1e3)>this.chance?(this.levelIndex++,this.playSound("levelUp")):(14==this.level[this.levelIndex].loose?this.levelIndex=0:this.levelIndex--,this.playSound("levelDown"))}playSound(e){if(!this.soundsEnabled)return;let t=new Audio(this.sounds[e]);t.volume=.1,t.play(),setTimeout((()=>{t=null}),300)}toggleSound(){var e=document.querySelector("#toggleSound");this.playSound("toggle"),e.addEventListener("click",(()=>{this.soundsEnabled?(this.soundsEnabled=!1,e.style.backgroundImage="url('../assets/img/mute.svg')"):(this.soundsEnabled=!0,e.style.backgroundImage="url('../assets/img/unmute.svg')")}))}}const RISKY=new Risky;
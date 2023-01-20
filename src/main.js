import {Deck,freshDeck} from './deck.js'
//import {CARD_COLOR_SUIT,CARD_WILD_SUIT,CARD_COLOR_VALUE,CARD_WILD_VALUE} from './deck.js'
import {hit,play,selectColorAct,selectColorActAI,actCheck,applyAct} from './actions.js'
import {Player} from './player.js'
import {avaCheck} from './rule.js'
import {getOpt} from './AI_Strategies.js'
//import {getCardPos} from './card_position.js'
import { renderMainDeck } from './web_render.js'
import { rejectCardAni } from './animation.js'


//player list (Fix)
let playerSeatList = ["Player","AI-1","AI-2","AI-3"];
export let webSeatList = ['.player-bot','.player-left','.player-top','.player-right']
export let webSeatMain = ['.main-deck','.discard-pile']

//Initial Setting
let mainDeck = new Deck(freshDeck(),webSeatMain);

let p1 = new Player(playerSeatList[0],webSeatList[0]);
let p2 = new Player(playerSeatList[1],webSeatList[1],false);
let p3 = new Player(playerSeatList[2],webSeatList[2],false);
let p4 = new Player(playerSeatList[3],webSeatList[3],false);
let playerDecks=[p1,p2,p3,p4];
let direction = {path:"Clockwise"};
let toggleDeck = true;
let toggleMainDeck = true;
const delay = ms => new Promise(res => setTimeout(res, ms));
let turnDuration= 1000;
let isPause = false;
const initialHits = 7;
let currentIndex=0
let winner
//set sound effect slots Max 10 at same time
let seList = [];
for (let i=0;i<10;i++){
  const audioElement = document.createElement("audio");
  document.body.appendChild(audioElement);
	seList.push({
		dom:audioElement,
		finishTime:0
	});
}
//Global Sound effect
export const SE = {
  deal: {
    path: 'audio/card-delt.mp3',
    type: 'audio/mpeg',
    duration: 500,
    volume: 1,
  },
  play: {
    path: 'audio/card-play.mp3',
    type: 'audio/mpeg',
    duration: 500,
    volume: 1,
  },
  action: {
    path: 'audio/card-action.mp3',
    type: 'audio/mpeg',
    duration: 500,
    volume: 1,
  },
  reject: {
    path: 'audio/card-reject.mp3',
    type: 'audio/mpeg',
    duration: 500,
    volume: 1,
  },
	call: {
    path: 'audio/uno-call.mp3',
    type: 'audio/mpeg',
    duration: 500,
    volume: 0.5,
  },
  gameOver: {
    path: 'audio/game-win.mp3',
    type: 'audio/mpeg',
    duration: 2000,
    volume: 1,
  }
};

export const broadcastSE = (se)=>{
	const now = new Date().getTime();
	const potentialDom = seList.find((item) => item.finishTime < now);
	if (potentialDom) {
		potentialDom.dom.setAttribute('src', se.path);
		potentialDom.dom.setAttribute('type', se.type);
		if(volume.value/100<0.05){
			potentialDom.dom.volume = 0
		}else{
			potentialDom.dom.volume = se.volume;
		}
		potentialDom.finishTime = now + se.duration;
		setTimeout(() => potentialDom.dom.play(), 0);
	}else{
		console.log("Unable to play",se.path)
	}
}
//Global BGM
const bgm = document.querySelector("#bgm")
let volume = document.querySelector(".volume-slider")
let bgmStarted= false;
const startPlayBGM=()=>{
	if(bgmStarted) return;
	bgmStarted=true;
	bgm.volume=volume.value/100
	bgm.play();
	volume.addEventListener("change", function(e) {
		bgm.volume = e.currentTarget.value/ 100;
		if(bgm.volume<0.05){
			bgm.pause()
		}else{
			bgm.play();
		}
	})
	volume.addEventListener("input", function(e) {
		bgm.volume = e.currentTarget.value/ 100;
		if(bgm.volume<0.05){
			bgm.pause()
		}else{
			bgm.play();
		}
	})
	document.querySelector(".start").removeEventListener("click",startPlayBGM);
}

//Game-Board btn initial
document.querySelector(".start").addEventListener("click",startPlayBGM);
document.querySelector(".start").addEventListener("click",start);
document.querySelector(".setting").addEventListener("click",settingMenu);
document.querySelector(".resume").addEventListener("click",resumeInit);
document.querySelector(".rule").addEventListener("click",rule);
document.querySelector(".exit").addEventListener("click",backMenu);
document.querySelector(".music").addEventListener("click",toggleSlider);
//Game turn
export async function turnStart(){
	if(isPause) await pauseEvent();
	//await delay(turnDuration)
	//Winner check
	let status = playerDecks.map(player=>{
		if(player.status=="Winner"){
			bgm.pause()
			broadcastSE(SE.gameOver)
			winner=player.name
			return "hasWinner";
		}else{
			return "None"
		}
	})
	await delay(turnDuration)
	if(!status.includes("hasWinner")){
		let action = await applyAct(mainDeck,playerDecks[currentIndex]);
		if(action){
			await delay(turnDuration)
		}
		//remove all action divs
		let divs = document.querySelectorAll("div.action,div.apply-action");
		divs?divs.forEach(div=>div.remove()):divs;
		//console.log(playerDecks[currentIndex])
		playerDecks[currentIndex].getWeb().previousElementSibling.classList.add("highlighted")
		if(playerDecks[currentIndex].isHuman){
			//await turnAI();
			turnHuman();
		}else{
			await delay(turnDuration);
			await turnAI();
		}
	}else{
		alert(winner+' Wins');
		backMenu()
		//alert("Game Over");
	}
}

//Next - Use when player's turn is over, change player
export function next() {
	if(direction.path=="Clockwise"){
		if (currentIndex === playerSeatList.length - 1) {
			currentIndex = 0;
		} else {
			currentIndex++;
		}
	}else if(direction.path=="CounterClockwise"){
		if (currentIndex === 0) {
			currentIndex = playerSeatList.length - 1;
		} else {
			currentIndex--;
		}
	}
  
}

//Create Personal Info
function createPersonalInfo(){
	playerDecks.forEach(deck=>{
		let img = document.createElement("div");
		let pName = document.createElement("div");
		let pickIndex=Math.floor(Math.random()*11);
		
		img.style.backgroundImage="url(./img/avatar_photo/avatar_"+pickIndex+".svg)";
		pName.innerText=deck.name;
		deck.getWeb().parentElement.children[0].append(pName,img)
	})
}

//Inital setup
async function initial(){
	mainDeck.shuffle();
	//Script event - Deal cards to each player
	for(let deck of playerDecks){
		await hit(mainDeck,deck,initialHits);
	}
	do{
		await hit(mainDeck,mainDeck,1,true);
	}while(mainDeck.getBot().suit=="Wild")
	//turnStart();
}


//Turn - Human
function turnHuman(){
	let deck = playerDecks[currentIndex];
	let deckWeb = deck.getWeb();
	
	//console.log("Human turn start=> ",playerSeatList[currentIndex])
	deckWeb.childNodes.forEach(card=>card.firstElementChild.classList.add("card-highlighted"));
	//Case 1 - When player has playable card on the deck
	toggleCardClick(deck,deckWeb);
	//Case 2 - When player need to draw a card from main deck
	toggleMainDeckClick(deck,deckWeb);
}

//Turn - AI
async function turnAI(){
	//turnAI.isEnd=false;
	let deckAI = playerDecks[currentIndex];
	let deckWeb = deckAI.getWeb();
	let options = getOpt(deckAI,mainDeck)
	
	//console.log('AI turn start=> ',playerSeatList[currentIndex])
	//Case 1 -No card to play
	if(options.length==0){
		let hitCard = mainDeck.getTop()
		await hit(mainDeck,deckAI);
		//await delay(1500)
		//console.log("AI draw card => ",hitCard.suit ,hitCard.value)
		if(avaCheck(deckAI.getBot(),mainDeck)){
			let playCard = deckAI.getCard(deckAI.length-1);
			await play(deckAI,mainDeck,deckAI.length-1)
			//await delay(1500)
			//console.log("AI play => ",playCard.suit,playCard.value)
			if(playCard.suit=="Wild"){

				selectColorActAI(deckAI);
			}else{
				actCheck(playCard,deckAI);
				next();
				turnStart();
			}
		}else{
			//console.log("AI Keep card => ",hitCard.suit ,hitCard.value);
			
			actCheck(hitCard,deckAI,false);
			next();
			turnStart();
		}
		
	//Case 2 -Select card to play
	}else{
		let cardIndex= options[Math.floor(Math.random()*options.length)];
		let playCard = deckAI.getCard(cardIndex);
		await play(deckAI,mainDeck,cardIndex);
		//await delay(1500)
		//console.log("AI play => ",playCard.suit,playCard.value);
		if(playCard.suit=="Wild"){
			selectColorActAI(deckAI);
		}else{
			actCheck(playCard,deckAI);
			next();
			turnStart();
		}
		
	}

}


//Toggle Events
//Draw Card from player deck
function toggleCardClick(deck,deckWeb) {
  let cardList = deckWeb.childNodes;
  let myHandler = async function(card) {
    if(!toggleDeck){
			let cardIndex=Array.prototype.indexOf.call(card.currentTarget.parentNode.childNodes, card.currentTarget);
			let selectCard = deck.cards[cardIndex];
			if(avaCheck(selectCard,mainDeck)){
				toggleCardClick(deck,deckWeb);
				let playCard = deck.getCard(cardIndex);
				await play(deck,mainDeck,cardIndex);
				//await delay(1500)
				//console.log("Play card => ",playCard.suit,playCard.value);
				if(playCard.suit=="Wild"){
					selectColorAct();
				}else{
					actCheck(playCard,deck);
					next();
					turnStart();
				}
			}else{
				let rejectCardWeb = card.currentTarget;
				rejectCardAni(rejectCardWeb);
			}
		}
  }
  if(toggleDeck) {
    cardList.forEach(async card=>card.addEventListener('click', myHandler, false));
    toggleDeck = false;
  } else {
		cardList.forEach(async card=>card.removeEventListener('click', myHandler, false));
		toggleMainDeck = true;
    toggleDeck = true;
  }
}
//Draw Card from Main Deck
function toggleMainDeckClick(deck,deckWeb) {
  
  let myHandler = async function(card) {
    if(!toggleMainDeck){
			//draw card

			toggleMainDeckClick(deck,deckWeb);
			let hitCard = mainDeck.getTop();
			await hit(mainDeck,deck);
			
			//console.log("Human draw card => ",hitCard.suit,hitCard.value)
			if(avaCheck(deck.getBot(),mainDeck)){
				let div = document.createElement("div");
				let playbtn = document.createElement("div");
				let keepbtn = document.createElement("div");
				await delay(1000)
				div.classList.add("play-keep-btn");
				playbtn.classList.add("play-btn");
				keepbtn.classList.add("keep-btn");
				playbtn.innerText="PLAY";
				keepbtn.innerText="KEEP";
				div.append(playbtn,keepbtn);
				let count = deckWeb.childElementCount
				let gap
				if(count<10){
					gap=30/10
				}else{
					gap=(180/(count-4))/10
				}
				let moveToCenterX = -(Math.floor(count/2)*gap)
				deckWeb.lastChild.append(div);	
				deckWeb.lastChild.style.right="0";
				deckWeb.lastChild.style.transform=`translate(${moveToCenterX}rem,6rem)`;
				deckWeb.lastChild.style.zIndex=20;
				playbtn.addEventListener("click",async e=>{
					//match and play
					let playCard = deck.getCard(deck.length-1);
					await play(deck,mainDeck,deck.length-1)
					//await delay(1500)
					//console.log("Play card => ",playCard.suit,playCard.value)
					//If play Wild card
					if(playCard.suit=="Wild"){
						let buttonList=document.querySelectorAll(".play-keep-btn");
						buttonList.forEach(e=>e.remove());
						selectColorAct();
					}else{
						let buttonList=document.querySelectorAll(".play-keep-btn");
						buttonList.forEach(e=>e.remove());
						actCheck(playCard,deck);
						next();
						turnStart();
					}
				})
				keepbtn.addEventListener("click",e=>{
					//match and keep card
					let buttonList=document.querySelectorAll(".play-keep-btn");
					buttonList.forEach(e=>e.remove());
					//console.log("Human Keep card => ",hitCard.suit,hitCard.value)
					deckWeb.lastChild.style.transform="";
					actCheck(hitCard,deck,false);
					next();
					turnStart();
				})			
					
			}else{
				deckWeb.lastChild.style.transform="";
				actCheck(hitCard,deck,false);
				next();
				turnStart();
			}
			
		}
  }
  if(toggleMainDeck) {
    mainDeck.getWeb().addEventListener('click', myHandler, false);
    toggleMainDeck = false;
  } else {
		mainDeck.getWeb().removeEventListener('click', myHandler, false);
		toggleDeck = true;
    toggleMainDeck = true;
  }
}

//menu events

async function start(){
	document.querySelector(".model-menu").style.display="none";
	document.querySelector(".game-board").style.display="grid";
	renderMainDeck()
	createPersonalInfo();
	await initial();
	//console.log("turn start")
	turnStart();
}
function rule(){
	let newDiv = document.createElement("div");
	newDiv.innerHTML='<object style="width:100%" type="text/html" data="./src/rule.html" ></object>';
	newDiv.style.objectFit="cover"
	newDiv.style.display="flex";
	newDiv.style.width="100%";
	newDiv.style.height="80%";
	newDiv.style.border=".3rem solid";
	newDiv.style.borderRadius=".5rem";
	let backBtn = document.createElement("div");
	backBtn.innerText="Back to Menu"
	backBtn.classList.add("back-btn");
	document.querySelector(".model-setting .model-content").append(newDiv,backBtn)
	document.querySelector(".model-content-setting").style.display="none";
	document.querySelector(".model-setting .model-content").style.display="flex";

	backBtn.addEventListener("click",e=>{
		document.querySelector(".model-setting .model-content").remove()
		let div = document.createElement("div")
		div.classList.add("model-content")
		//console.log(div)
		document.querySelector(".model-setting").appendChild(div)
		//document.querySelector(".model-setting .model-content").style.display="none";
		document.querySelector(".model-content-setting").style.display="flex";
		//document.querySelector(".model-setting .model-content").childNodes.forEach(e=>console.log(e));
	})
	
}
//music
function toggleSlider(){
	let slider = document.querySelector(".volume-slider")
	if(slider.style.display==="none"){
		slider.style.display="inline"
	}else{
		slider.style.display="none"
	}
}
//setting
function settingMenu(){
	isPause=true;
	turnDuration=0;
	document.querySelector(".setting").removeEventListener("click",settingMenu);
	document.querySelector(".model-setting").style.display="flex";
}

function resumeInit(){
	document.querySelector(".model-setting").style.display="none";
	document.querySelector(".setting").addEventListener("click",settingMenu);
	isPause=false;
}

function pauseEvent(){
	return new Promise(res=>{
		let resume = function(){
			document.querySelector(".model-setting").style.display="none";
			document.querySelector(".setting").addEventListener("click",settingMenu);
			document.querySelector(".resume").removeEventListener("click",resume)
			isPause=false;
      res();
		}
		document.querySelector(".resume").addEventListener("click",resume)
	})
}


function backMenu(){
	location.reload();
}

export{playerDecks,mainDeck,currentIndex,playerSeatList,direction}




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




//let currentIndex=Math.floor(Math.random()*(playerDecks.length));
let currentIndex=0


//Menu btn initial
let selectIndex=0
let prevButton = document.querySelector(".previous");
prevButton.addEventListener( 'mouseover', function() {
	selectIndex--
	rotate(selectIndex);
});


let nextButton = document.querySelector(".next");
nextButton.addEventListener( 'mouseover', function() {
	selectIndex++
	rotate(selectIndex);
});

document.querySelector(".start").addEventListener("click",start);
document.querySelector(".model-menu .rule").addEventListener("click",rule);
document.querySelector(".menu-setting").addEventListener("click",menuSetting);
document.querySelector(".back-home").addEventListener("click",backHome);

let backBtn = document.createElement("div");
backBtn.innerText="Back to Menu"
backBtn.classList.add("back-btn");
//back button
backBtn.addEventListener("click",e=>{
	document.querySelector(".model-menu .model-content").style.display="none";
	document.querySelector(".model-content-menu").style.display="flex";
	document.querySelector(".next").style.display="flex";
	document.querySelector(".previous").style.display="flex";
	document.querySelector(".model-menu .model-content").childNodes.forEach(e=>e.remove());
})


//Game-Board Setting btn initial
document.querySelector(".setting").addEventListener("click",settingMenu);
document.querySelector(".resume").addEventListener("click",resumeInit);
document.querySelector(".exit").addEventListener("click",backMenu);
// createPersonalInfo();

// initial();






//Game turn
export async function turnStart(){
	if(isPause) await pauseEvent();
	//Winner check
	await delay(1000)
	let status = playerDecks.map(player=>{
		if(player.status=="Winner"){
			alert(player.name+' Wins');
			return "hasWinner";
		}else{
			return "None"
		}
	})
	
	if(!status.includes("hasWinner")){
		
		let action = applyAct(mainDeck,playerDecks[currentIndex]);
		if(action){
			await delay(1000)
		}
		
		//remove all action divs
		let divs = document.querySelectorAll("div.action,div.apply-action");
		divs?divs.forEach(div=>div.remove()):divs;
		console.log(playerDecks[currentIndex])
		playerDecks[currentIndex].getWeb().previousElementSibling.classList.add("highlighted")
		if(playerDecks[currentIndex].isHuman){
			//turnAI();
			turnHuman();
			
		}else{
			await delay(turnDuration);
			turnAI();
			
		}
	}else{
		alert("Game Over");
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
		
		img.style.backgroundImage="url(./avatar_photo/avatar_"+pickIndex+".svg)";
		pName.innerText=deck.name;
		deck.getWeb().parentElement.children[0].append(pName,img)
	})
	

}

//reset
function resetAll(){
	mainDeck.clear();
	playerDecks.forEach(deck=>deck.clear());
	mainDeck.addBot(freshDeck());
	mainDeck.shuffle();
	direction = {path:"Clockwise"};
	toggleDeck = true;
	toggleMainDeck = true;
	currentIndex=Math.floor(Math.random*playerDecks.length);
	document.querySelector(".discard-pile").childNodes.forEach(e=>e.remove());
	document.querySelectorAll(".player").forEach(player=>player.childNodes.forEach(e=>e.remove()));
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
	
	console.log("Human turn start=> ",playerSeatList[currentIndex])
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
	
	console.log('AI turn start=> ',playerSeatList[currentIndex])
	//Case 1 -No card to play
	if(options.length==0){
		let hitCard = mainDeck.getTop()
		hit(mainDeck,deckAI);
		await delay(1500)
		console.log("AI draw card => ",hitCard.suit ,hitCard.value)
		if(avaCheck(deckAI.getBot(),mainDeck)){
			let playCard = deckAI.getCard(deckAI.length-1);
			play(deckAI,mainDeck,deckAI.length-1)
			await delay(1500)
			console.log("AI play => ",playCard.suit,playCard.value)
			if(playCard.suit=="Wild"){

				selectColorActAI(deckAI);
			}else{
				actCheck(playCard,deckAI);
				next();
				turnStart();
			}
		}else{
			console.log("AI Keep card => ",hitCard.suit ,hitCard.value);
			
			actCheck(hitCard,deckAI,false);
			next();
			turnStart();
		}
		
	//Case 2 -Select card to play
	}else{
		let cardIndex= options[Math.floor(Math.random()*options.length)];
		let playCard = deckAI.getCard(cardIndex);
		play(deckAI,mainDeck,cardIndex);
		await delay(1500)
		console.log("AI play => ",playCard.suit,playCard.value);
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
				play(deck,mainDeck,cardIndex);
				await delay(1500)
				console.log("Play card => ",playCard.suit,playCard.value);
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
			hit(mainDeck,deck);
			await delay(1500)
			console.log("Human draw card => ",hitCard.suit,hitCard.value)
			if(avaCheck(deck.getBot(),mainDeck)){
				let div = document.createElement("div");
				let playbtn = document.createElement("div");
				let keepbtn = document.createElement("div");
				div.classList.add("play-keep-btn");
				playbtn.classList.add("play-btn");
				keepbtn.classList.add("keep-btn");
				playbtn.innerText="PLAY";
				keepbtn.innerText="KEEP";
				div.append(playbtn,keepbtn);
				deckWeb.lastChild.append(div);	
				deckWeb.lastChild.style.right="0";
				deckWeb.lastChild.style.transform="translate(-14vw,13vh)";
				deckWeb.lastChild.style.zIndex=20;
				playbtn.addEventListener("click",async e=>{
					//match and play
					let playCard = deck.getCard(deck.length-1);
					play(deck,mainDeck,deck.length-1)
					await delay(1500)
					console.log("Play card => ",playCard.suit,playCard.value)
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
					console.log("Human Keep card => ",hitCard.suit,hitCard.value)
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


function rotate(index) {
	let carousel = document.querySelector(".model-content-menu");
	let angle = -(360 / carousel.childElementCount)*(index);
	carousel.style.transform = `translateZ(-150px) rotateY(${angle}deg)`;
	carousel.style.transition = "transform 3s"
}
function start(){
	document.querySelector(".model-menu").style.display="none";
	document.querySelector(".game-board").style.display="grid";
	
	renderMainDeck()
	createPersonalInfo();
	initial();
	turnStart();
}
function rule(){
	let newDiv = document.createElement("div");
	newDiv.innerHTML='<object style="width:100%" type="text/html" data="rule.html" ></object>';
	newDiv.style.objectFit="cover"
	newDiv.style.display="flex";
	newDiv.style.width="100%";
	newDiv.style.height="80%";
	newDiv.style.border="3px solid";
	newDiv.style.borderRadius="5px";
	document.querySelector(".model-menu .model-content").append(newDiv,backBtn)
	document.querySelector(".model-content-menu").style.display="none";
	document.querySelector(".next").style.display="none";
	document.querySelector(".previous").style.display="none";
	document.querySelector(".model-menu .model-content").style.display="flex"
	
}

function menuSetting(){
	let newDiv = document.createElement("div");
	newDiv.innerText="Work in Progress"
	document.querySelector(".model-menu .model-content").append(newDiv,backBtn)
	document.querySelector(".model-content-menu").style.display="none";
	document.querySelector(".next").style.display="none";
	document.querySelector(".previous").style.display="none";
	document.querySelector(".model-menu .model-content").style.display="flex"
}

function backHome(){
	location.href = "http://www.google.com";
}
  

//setting
function settingMenu(){
	isPause=true;
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




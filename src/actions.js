import { webSeatList, webSeatMain } from "./main.js";
import {next,turnStart,direction} from "./main.js"
import {cardWebShown} from "./web_events.js"
import { mainDeck, playerDecks} from "./main.js";
import {playCardAni, hitCardAni} from "./animation.js"
import { renderPlayerDeck } from "./web_render.js";
import { SE,broadcastSE } from './main.js'
let imgClockwise=document.querySelector('.clockwise');

//let imgCounterClockwise=document.querySelector('.counter-clockwise')
const delayAni = ms => new Promise(res => setTimeout(res, ms));
let playCardTime =1000
let playCardDuration=200

//hit card from deck
export async function hit(main,playerDeck,count=1,isDiscard=false) {
  main.recycle();
  
  let cardList = main.getHit(count);
  playerDeck.addBot(cardList);
  for(let card of cardList){
    
    if(isDiscard){
      cardWebShown(card,main.getWeb(1),false);
      hitCardAni(main.getWeb(1).firstElementChild,playCardTime);
    }else{
      cardWebShown(card,playerDeck.getWeb(),true);
      hitCardAni(playerDeck.getWeb().lastElementChild,playCardTime);
    }
    await delayAni(playCardDuration);
  }

};
//play card
export async function play(playerDeck,main,index,removeCard=true) {
  
  let card = playerDeck.detCard(index);
  main.addBot(card);
  
  cardWebShown(card,main.getWeb(1),false);
  playCardAni(playerDeck.getWeb().childNodes[index],main,playCardTime);
  
  if(removeCard){
    playerDeck.getWeb().childNodes[index].remove()
    renderPlayerDeck(playerDeck.getWeb())
  }
  await delayAni(playCardDuration);
}

export function actCheck(card,deck,play=true){
  //console.log(card,deck)
	deck.updateStatus();
  if(deck.status=="UNO"){
    broadcastSE(SE.call)
  }
	
	//Check if play action card
	
	if(play){
    let symbol = document.createElement("div");
    symbol.classList.add("action");
    switch(card.value){
      case "Skip":
        
        symbol.style.backgroundImage = "url('./img/symbols/skip_black.svg')";
        symbol.style.backgroundSize = "300%";
        mainDeck.getWeb(1).parentElement.prepend(symbol);
        broadcastSE(SE.action)
        card.setPenalty(true);
        break;
      case "Reverse":
        
        symbol.style.backgroundImage = "url('./img/symbols/reverse_black.svg')";
        symbol.style.backgroundSize = "200%";
        mainDeck.getWeb(1).parentElement.prepend(symbol);
        broadcastSE(SE.action)
        direction.path = reverseAct(direction);
        break;
      case "Draw Two":
        
        symbol.style.backgroundImage = "url('./img/symbols/draw_two_black.svg')";
        symbol.style.backgroundSize = "190%";
        mainDeck.getWeb(1).parentElement.prepend(symbol);
        broadcastSE(SE.action)
        card.setPenalty(true);
        break;
      case "Draw Four":
        
        symbol.style.backgroundImage = "url('./img/symbols/draw_four_black.svg')";
        symbol.style.backgroundSize = "190%";
        mainDeck.getWeb(1).parentElement.prepend(symbol);
        broadcastSE(SE.action)
        card.setPenalty(true);
        break;
      default:
        
    }
  }
	//turn glow removed
	let highlightedClass = document.querySelectorAll(".card-highlighted,.highlighted");
	if(highlightedClass){
    highlightedClass.forEach(e=>{
      e.classList.remove("card-highlighted");
      e.classList.remove("highlighted");
    })
  }
  
	
}

export async function applyAct(mainDeck,deck){
  // let actDiv = document.querySelectorAll(".action")
  // actDiv?actDiv.forEach(div=>div.remove()):actDiv;

	if(mainDeck.getBot().hasPenalty){
    let symbol = document.createElement("div")
		let actCard=mainDeck.getBot();
		symbol.classList.add("apply-action")
    
    if(actCard.value==="Skip"){
      
      symbol.style.backgroundImage = "url('./img/symbols/skip_white.svg')";
      symbol.style.width="12rem";
      symbol.style.height="12rem";
      symbol.style.backgroundSize = "200%";
      deck.getWeb().parentElement.prepend(symbol);
      await delayAni(1000)
      next()
      mainDeck.getBot().setPenalty(false);
      return true
    }
		if(actCard.value==="Draw Two"){
      symbol.style.backgroundImage = "url('./img/symbols/draw_two_number_white.svg')";
      symbol.style.backgroundSize = "190%";
      deck.getWeb().parentElement.prepend(symbol);
      await delayAni(1000)
			await hit(mainDeck,deck,2);
      //await delayAni(1000)
			next()
      mainDeck.getBot().setPenalty(false);
      return true
		}
		if(actCard.value==="Draw Four"){
      symbol.style.backgroundImage = "url('./img/symbols/draw_four_number_white.svg')";
      symbol.style.backgroundSize = "190%";
      deck.getWeb().parentElement.prepend(symbol);
      await delayAni(1000)
			await hit(mainDeck,deck,4);
      //await delayAni(1000)
			next()
      mainDeck.getBot().setPenalty(false);
      return true
		}
		//mainDeck.getBot().setPenalty(false);
	}

	
}


//Card Action - Reverse
export function reverseAct(direction) {
  if(direction.path=="Clockwise"){
    imgClockwise.classList.remove("clockwise")
    imgClockwise.classList.add("counter-clockwise");
    return "CounterClockwise";
  }else if (direction.path=="CounterClockwise"){
    imgClockwise.classList.remove("counter-clockwise");
    imgClockwise.classList.add("clockwise");
    return "Clockwise"
  }
}

//Select color when playing draw 4 or wild -human
export function selectColorAct() {
  const Wild_Color_POSITION={
    "Red":{
      "trueColor":"#ff5555",
      "posWild":"99.298% 1%",
      "posDrawFour":"99.298% 57%"
    },
    "Blue":{
      "trueColor":"#5555ff",
      "posWild":"99.298% 15%",
      "posDrawFour":"99.298% 71%"
    },
    "Yellow":{
      "trueColor":"#ffaa00",
      "posWild":"99.298% 29%",
      "posDrawFour":"99.298% 85%"
    },
    "Green":{
      "trueColor":"#55aa55",
      "posWild":"99.298% 43%",
      "posDrawFour":"99.298% 99%"
    }
  }
  let wildCardWeb = mainDeck.getWeb(1).firstElementChild
  let selectList = ["Red","Blue","Yellow","Green"];
  let container = document.createElement("div");
  container.classList.add("selectColor")
  selectList.forEach(color=>{
    let setColor = document.createElement("div");
    setColor.classList.add("color");
    container.append(setColor)
    setColor.style.backgroundColor = Wild_Color_POSITION[color].trueColor;
    switch (color){
      case "Red":
        setColor.style.borderRadius = "50% 0 0 0";
        break;
      case "Blue":
        setColor.style.borderRadius = "0 50% 0 0";
        break;
      case "Yellow":
        setColor.style.borderRadius = "0 0 0 50%";
        break;
      case "Green":
        setColor.style.borderRadius = "0 0 50% 0";
        break;
    }
     
    wildCardWeb.parentElement.parentElement.append(container);
    setColor.addEventListener("click",e=>{
      
      setWildCard(mainDeck,color);
      document.querySelector(".selectColor").remove();
      actCheck(mainDeck.getBot(),playerDecks[0]);
      next();
      turnStart();
    })
  })
}
//AI select Wild color
export function selectColorActAI(deck){
	
	let colorList = deck.getMaxSuit()
	let selectColor=null;
	let selectIndex = Math.floor(Math.random()*colorList.length);
	selectColor = colorList[selectIndex];
	if(selectColor==="Wild" || selectColor===undefined){
		let randomColor = ["Red","Blue","Green","Yello"];
		selectIndex = Math.floor(Math.random()*randomColor.length);
		selectColor=randomColor[selectIndex];
	}
		
	console.log("select color = ",selectColor);
	setWildCard(mainDeck,selectColor);

	actCheck(mainDeck.getBot(),deck);
  next();
  turnStart();
}

export function setWildCard(mainDeck,color){
  const Wild_Color_POSITION={
    "Red":{
      "trueColor":"#ff5555",
      "posWild":"99.298% 1%",
      "posDrawFour":"99.298% 57%"
    },
    "Blue":{
      "trueColor":"#5555ff",
      "posWild":"99.298% 15%",
      "posDrawFour":"99.298% 71%"
    },
    "Yellow":{
      "trueColor":"#ffaa00",
      "posWild":"99.298% 29%",
      "posDrawFour":"99.298% 85%"
    },
    "Green":{
      "trueColor":"#55aa55",
      "posWild":"99.298% 43%",
      "posDrawFour":"99.298% 99%"
    }
  }
	let wildCardWeb = mainDeck.getWeb(1).firstElementChild.firstElementChild;
  
	let card = mainDeck.getBot();
	card.setWildColor(color);
	delayAni(500)
	wildCardWeb.style.backgroundImage = "url('./img/cards/UNO_cards_deck_wild.svg')";
	if(card.value=="Wild"){
		wildCardWeb.style.backgroundPosition = Wild_Color_POSITION[color].posWild;
	}else if(card.value=="Draw Four"){
		wildCardWeb.style.backgroundPosition = Wild_Color_POSITION[color].posDrawFour;
	}
	

}

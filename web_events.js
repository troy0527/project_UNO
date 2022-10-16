import {getCardPos} from './card_position.js'
import { renderPlayerDeck } from './web_render.js';




export function cardWebShown(card,deckWeb,append=true){
	let cardFront=document.createElement("div");
	let cardBack=document.createElement("div");
	let cardWeb = document.createElement("div");
	
	cardFront.classList.add("card-front");
	cardBack.classList.add("card-back");
	cardWeb.classList.add("card");

	cardFront.style.backgroundPosition = getCardPos(card);
	cardWeb.append(cardFront,cardBack);
  //cardWeb.style.display="none"
  if(append){
    deckWeb.append(cardWeb);
		renderPlayerDeck(deckWeb);
		for(let i=0;i<deckWeb.childElementCount;i++){
			deckWeb.childNodes[i].style.zIndex = i;
		}
  }else{
    deckWeb.prepend(cardWeb);
		if(deckWeb.childElementCount>=10){
			deckWeb.lastElementChild.remove();
		}
		let rotateDeg = Math.floor(Math.random()*360);
		let moveX = Math.floor(Math.random()*20)-10;
		let moveY = Math.floor(Math.random()*20)-10;
		
		deckWeb.firstElementChild.style.transform = `translateX(${moveX}px) translateY(${moveY}px) rotate(${rotateDeg}deg)`;
		let zdex = -10
		for(let i=0;i<deckWeb.childElementCount;i++){
			deckWeb.childNodes[i].style.zIndex = zdex;
			zdex--
		}
  }
  return cardWeb

}









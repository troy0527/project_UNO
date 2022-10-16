
export function renderMainDeck(){
  let mainCardDeck = document.querySelector(".main-deck .card-back");
  let layer =20
  let x=-1;
  let y=1;
  let str=""
  for(let i=0;i<layer;i++){
    let strPart=x+"px "+y+"px var(--card-border-color)"
    if(i!==layer-1){
      strPart+=",";
    }
    x--,y++,str+=strPart;
  }
  
  mainCardDeck.style.boxShadow = str;
  
}

export function renderPlayerDeck(deckWeb){
  let count = deckWeb.childElementCount
  let cardWidth =70
  //for Human Deck
  let maxLength = 250
  let cardGap = cardWidth-(maxLength-cardWidth)/(count-1)
 
  let classList= deckWeb.classList
  let isHuman = Array.prototype.includes.call(classList,"player-bot")
  if(!isHuman){
    if(count<14){
      deckWeb.childNodes.forEach(card=>{
        card.style.marginLeft=`-40px`;
      });
      deckWeb.style.marginLeft=`-40px`;
    }else{
      deckWeb.childNodes.forEach(card=>{
        card.style.marginLeft=`-${cardGap}px`;
      });
      deckWeb.style.marginLeft=`-${cardGap/2}px`;
    }
    
  }else{
    if(count<14){
      deckWeb.childNodes.forEach(card=>card.style.marginLeft=`-40px`);
      deckWeb.style.marginLeft=`-40px`;
    }else{
      deckWeb.childNodes.forEach(card=>card.style.marginLeft=`-${cardGap}px`);
      deckWeb.style.marginLeft=`-${cardGap/2}px`;
    }
    
  }
  
  
}










export function renderMainDeck(){
  let mainCardDeck = document.querySelector(".main-deck .card-back.card-deck");
  let mainDeckTop = document.createElement("div")

  let layer =20
  let x=-1;
  let y=1;
  let str=""
  for(let i=0;i<layer;i++){
    let strPart= (x/10)+"rem "+(y/10)+"rem var(--card-border-color)"
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
  let cardGap = ((maxLength-cardWidth)/(count-4))/10
 
  let classList= deckWeb.classList
  let isHuman = Array.prototype.includes.call(classList,"player-bot")
  let isLeftAI = Array.prototype.includes.call(classList,"player-left")
  let isRightAI = Array.prototype.includes.call(classList,"player-right")
  if(!isHuman){
    if(isLeftAI){
      if(count<10){
        deckWeb.childNodes.forEach(card=>{
          card.style.marginTop=`-3rem`;
        });
        deckWeb.style.marginTop=`-3rem`;
      }else{
        deckWeb.childNodes.forEach(card=>{
          card.style.marginTop=`-${cardGap}rem`;
        });
        deckWeb.style.marginTop=`-${cardGap/2}rem`;
      }
    }else if(isRightAI){
      if(count<10){
        deckWeb.childNodes.forEach(card=>{
          card.style.marginBottom=`3rem`;
        });
        deckWeb.style.marginBottom=`3rem`;
      }else{
        deckWeb.childNodes.forEach(card=>{
          card.style.marginBottom=`${cardGap}rem`;
        });
        deckWeb.style.marginBottom=`${cardGap/2}rem`;
      }
    }else{
      if(count<10){
        deckWeb.childNodes.forEach(card=>{
          card.style.marginLeft=`-3rem`;
        });
        deckWeb.style.marginLeft=`-3rem`;
      }else{
        deckWeb.childNodes.forEach(card=>{
          card.style.marginLeft=`-${cardGap}rem`;
        });
        deckWeb.style.marginLeft=`-${cardGap/2}rem`;
      }
    }
    
  }else{
    if(count<10){
      deckWeb.childNodes.forEach(card=>card.style.marginLeft=`-3rem`);
      deckWeb.style.marginLeft=`-3rem`;
    }else{
      deckWeb.childNodes.forEach(card=>card.style.marginLeft=`-${cardGap}rem`);
      deckWeb.style.marginLeft=`-${cardGap/2}rem`;
    }
    
  }
  
  
}









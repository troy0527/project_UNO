
//main deck card to player deck or discard-pile
export function hitCardAni(targetCardWeb,time){
  
  let mainCardObject = document.querySelector(".main-deck .card-back").getBoundingClientRect();
  let mainX = mainCardObject.x+(mainCardObject.width/2)
  let mainY = mainCardObject.y+(mainCardObject.height/2)
  let targetObj = targetCardWeb.getBoundingClientRect();
  let targetX = targetObj.x+(targetObj.width/2);
  let targetY = targetObj.y+(targetObj.height/2)
  
  
  let moveX= mainX-targetX;
  let moveY= mainY-targetY;
  let classList = targetCardWeb.parentElement.classList
  
  let isMan = Array.prototype.includes.call(classList,"player-bot");
  let isDiscard = Array.prototype.includes.call(classList,"discard-pile");
  let manCardDeg = 0;
  //show card front face
  if(isMan||isDiscard){
    manCardDeg = 180;
  }
  let playKeyFrames =[
    {transform: `translate(${moveX}px, ${moveY}px) rotateX(60deg) rotateZ(-45deg) rotateY(${manCardDeg}deg)`},
    {transform:`translate(${moveX}px, ${moveY}px) translateX(100px) translateY(-50px) rotateX(60deg) rotateZ(-45deg) rotateY(${manCardDeg}deg)`,offset:0.2},
    {transform:""}
  ];
  // let testplayKeyFrames =[
  //   {transform: `translate(50px, 50px) `},
  //   {transform:`translate(0) rotateX(0) rotateZ(0)`}
  // ];
  let timingEffect={
    duration:time,
    easing:"ease-out"
  }
  
  targetCardWeb.style.transformStyle="preserve-3d";
  
  targetCardWeb.animate(playKeyFrames,timingEffect);
  
}
//player deck to discard pile(main deck bottom)
export function playCardAni(oriCardWeb,main,time){
  
  let discardObject = document.querySelector(".discard-pile").firstElementChild.getBoundingClientRect();
  let discardX = discardObject.x+(discardObject.width/2)
  let discardY = discardObject.y+(discardObject.height/2)
  let oriObj = oriCardWeb.getBoundingClientRect();
  let oriX = oriObj.x+(oriObj.width/2);
  let oriY = oriObj.y+(oriObj.height/2)
  
  let moveX= oriX-discardX;
  let moveY= oriY-discardY;
  let classList = oriCardWeb.parentElement.classList
  
  let isMan = Array.prototype.includes.call(classList,"player-bot");
  
  let CardDeg = 180;
  if(isMan){
    CardDeg = 0;
  }
  let playKeyFrames =[
    {transform: `translate(${moveX}px, ${moveY}px) rotateY(${CardDeg}deg)`},
    
    {transform:""}
  ];
  let timingEffect={
    duration:time,
    easing:"ease-out"
  }
  
  
  main.getWeb(1).style.transformStyle="preserve-3d";
  main.getWeb(1).firstElementChild.animate(playKeyFrames,timingEffect);

}

export function rejectCardAni(cardWeb){
  let time = 200
  let shakeMove = 5
  let Obj = cardWeb.getBoundingClientRect();
  let X = Obj.x+(Obj.width/2);
  let Y = Obj.y+(Obj.height/2)
  let keyFrames =[
    {transform:`translateY(-40px)`,offset:0},
    {transform: `translateY(-40px) translateX(${shakeMove}px)`,offset:0.25},
    {transform: `translateY(-40px) translateX(-${shakeMove}px)`,offset:0.5},
    {transform: `translateY(-40px) translateX(${shakeMove}px)`,offset:0.75},
    {transform:`translateY(-40px)`,offset:1}
  ];
  let timingEffect={
    duration:time
  }
  cardWeb.animate(keyFrames,timingEffect);
}





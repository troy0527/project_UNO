import { SE,broadcastSE } from './main.js'
//main deck card to player deck or discard-pile
export function hitCardAni(targetCardWeb,time){
  
  let mainCardObject = document.querySelector(".main-deck .card-back").getBoundingClientRect();
  let mainX = mainCardObject.x+(mainCardObject.width/2)
  let mainY = mainCardObject.y+(mainCardObject.height/2)
  let targetObj = targetCardWeb.getBoundingClientRect();
  let targetX = targetObj.x+(targetObj.width/2);
  let targetY = targetObj.y+(targetObj.height/2)
  let moveX,moveY
  if(mainX>targetX){
    moveX= mainX-targetX;
  }else{
    moveX= -(targetX-mainX);
  }
  if(mainY>targetY){
    moveY= mainY-targetY;
  }else{
    moveY= -(targetY-mainY);
  }
  let classList = targetCardWeb.parentElement.classList
  let isMan = Array.prototype.includes.call(classList,"player-bot");
  let isDiscard = Array.prototype.includes.call(classList,"discard-pile");
  let manCardDeg = 0;
  //show card front face
  if(isMan||isDiscard){
    manCardDeg = 180;
  }
  let playKeyFrames =[
    {transform: `translate3d(${moveX/10}rem, ${moveY/10}rem, 10rem) rotateX(60deg) rotateZ(-45deg) rotateY(${manCardDeg}deg)`},
    {transform:`translate3d(${(moveX+50)/10}rem, ${(moveY+50)/10}rem, 10rem) rotateX(60deg) rotateZ(-45deg) rotateY(${manCardDeg}deg)`,offset:0.4},
    {transform:"translate3d(0, 0, 10rem)" ,offset:0.8},
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
  broadcastSE(SE.deal)
  
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
    {transform: `translate3d(${moveX/10}rem, ${moveY/10}rem, 10rem) rotateY(${CardDeg}deg)`},
    {transform:"translate3d(0, 0, 10rem)" ,offset:0.5},
    {transform:""}
  ];
  let timingEffect={
    duration:time,
    easing:"ease-out"
  }
  
  
  main.getWeb(1).style.transformStyle="preserve-3d";
  main.getWeb(1).firstElementChild.animate(playKeyFrames,timingEffect);
  broadcastSE(SE.play)

}

export function rejectCardAni(cardWeb){
  let time = 200
  let shakeMove = 5
  let Obj = cardWeb.getBoundingClientRect();
  let X = Obj.x+(Obj.width/2);
  let Y = Obj.y+(Obj.height/2)
  let keyFrames =[
    {transform:`translateY(-4rem)`,offset:0},
    {transform: `translateY(-4rem) translateX(${shakeMove/10}rem)`,offset:0.25},
    {transform: `translateY(-4rem) translateX(-${shakeMove/10}rem)`,offset:0.5},
    {transform: `translateY(-4rem) translateX(${shakeMove/10}rem)`,offset:0.75},
    {transform:`translateY(-4rem)`,offset:1}
  ];
  let timingEffect={
    duration:time
  }
  cardWeb.animate(keyFrames,timingEffect);
  broadcastSE(SE.reject)
}








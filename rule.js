//Availability check
export function avaCheck(card,main) {
  if(main.length!==0){
    //check wild card
    if(card.suit=="Wild"){
      return true
    }
    //check color
    if (card.suit == main.getBot().suit || card.suit == main.getBot().wildColor) {
      return true
    }
    //check value
    if (card.value == main.getBot().value) {
      return true
    }
  }
  return false
  
}
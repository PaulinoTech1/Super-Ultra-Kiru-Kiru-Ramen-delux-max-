export function makeDeck(random = Math.random) {
 const deck = ['♠','♥','♦','♣'].flatMap(suit=>Array.from({length:13},(_,i)=>({suit,rank:i+2,label:i+2<=10?String(i+2):['J','Q','K','A'][i-9]})));
 for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;
}
export function drawRound(deck){if(deck.length<2)throw new Error('Not enough cards');const[player,chef,...remaining]=deck;return{player,chef,remaining,winner:player.rank===chef.rank?(remaining.length?'tie':'draw'):player.rank>chef.rank?'player':'chef'};}
export function openingReply(n){return ["Welcome in. What are you craving tonight? I've got a feeling you're going to like the ramen.","I think you want ramen. Let's try ramen today.","Pizza? Burgers? Look at the sign. It says RAMEN.","Friend, I didn't simmer this broth all day for you to ask for a burger.","Last chance. Don't make me tap the ramen sign again.","THAT'S IT. RAMEN. You're having ramen. I've updated the menu for you."][Math.min(5,Math.max(0,n))];}

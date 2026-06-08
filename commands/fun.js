const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😂",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "I'm reading a book about anti-gravity. It's impossible to put down.",
  "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
  "Why can't you give Elsa a balloon? Because she'll let it go.",
  "What do you call fake spaghetti? An impasta!",
  "I would tell you a joke about construction, but I'm still working on it.",
  "Why did the bicycle fall over? Because it was two-tired!",
  "What do you call cheese that isn't yours? Nacho cheese!",
];

const quotes = [
  "\"The only way to do great work is to love what you do.\" — Steve Jobs",
  "\"In the middle of every difficulty lies opportunity.\" — Albert Einstein",
  "\"It does not matter how slowly you go as long as you do not stop.\" — Confucius",
  "\"Life is what happens when you're busy making other plans.\" — John Lennon",
  "\"The future belongs to those who believe in the beauty of their dreams.\" — Eleanor Roosevelt",
  "\"Success is not final, failure is not fatal: it is the courage to continue that counts.\" — Winston Churchill",
  "\"You miss 100% of the shots you don't take.\" — Wayne Gretzky",
  "\"Whether you think you can or you think you can't, you're right.\" — Henry Ford",
  "\"The only impossible journey is the one you never begin.\" — Tony Robbins",
  "\"Don't watch the clock; do what it does. Keep going.\" — Sam Levenson",
];

const roasts = [
  "You're not stupid, you just have bad luck thinking.",
  "I'd agree with you but then we'd both be wrong.",
  "You have your entire life to be an idiot. Why not take today off?",
  "I'm not saying you're dumb, but you'd have to study hard to become an idiot.",
  "Somewhere out there, a tree is producing oxygen for you. You owe that tree an apology.",
  "You're the reason they put instructions on shampoo bottles.",
  "If laughter is the best medicine, your face must be curing diseases.",
  "You're not the dumbest person in the world, but you better hope they don't die.",
  "I'd roast you harder but my mum said I'm not allowed to burn trash.",
  "You have miles to go before you reach mediocre.",
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  joke: () => random(jokes),
  quote: () => random(quotes),
  roast: () => random(roasts),
};

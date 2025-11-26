// src/utils/handRecognitionLogic.js

// ---- Constants ----
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export const SUITS = ["H", "D", "C", "S"];

const HAND_RANKS = {
  "High Card": 1,
  "One Pair": 2,
  "Two Pair": 3,
  "Three of a Kind": 4,
  Straight: 5,
  Flush: 6,
  "Full House": 7,
  "Four of a Kind": 8,
  "Straight Flush": 9,
  "Royal Flush": 10,
};

// Export the list of hand types so the UI can use it too if needed
export const HAND_TYPES = Object.keys(HAND_RANKS);

// ---- Pure random deck (no bias here) ----
export function generateDeck() {
  const deck = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push(`${rank}${suit}`); // e.g. "AH", "10D"
    }
  }

  // Fisher–Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// ---- All 5-card combinations from a set of cards ----
function generateCombinations(cards) {
  function combinations(arr, k) {
    const result = [];
    if (k === 1) return arr.map((card) => [card]);
    arr.forEach((current, index) => {
      const smaller = combinations(arr.slice(index + 1), k - 1);
      smaller.forEach((combo) => {
        result.push([current, ...combo]);
      });
    });
    return result;
  }

  return combinations(cards, 5);
}

// ---- Analyze a 5-card hand and return its type ----
function analyzeHand(hand) {
  function rankValue(rank) {
    return RANKS.indexOf(rank);
  }

  const ranks = hand.map((card) => rankValue(card.slice(0, -1)));
  const suits = hand.map((card) => card.slice(-1));

  ranks.sort((a, b) => a - b);

  const flush = suits.every((suit) => suit === suits[0]);
  const groups = RANKS.map((_, i) => ranks.filter((rank) => rank === i).length)
    .sort((a, b) => b - a);

  const straight =
    new Set(ranks).size === 5 &&
    (ranks[4] - ranks[0] === 4 || ranks.join("") === "01234"); // includes wheel A2345

  if (flush && straight) {
    return ranks.includes(12) ? "Royal Flush" : "Straight Flush";
  }
  if (groups[0] === 4) return "Four of a Kind";
  if (groups[0] === 3 && groups[1] === 2) return "Full House";
  if (flush) return "Flush";
  if (straight) return "Straight";
  if (groups[0] === 3) return "Three of a Kind";
  if (groups[0] === 2 && groups[1] === 2) return "Two Pair";
  if (groups[0] === 2) return "One Pair";

  return "High Card";
}

// ---- Determine best 5-card hand from a 7-card hand ----
export function determineBestHand(cards) {
  const possibleHands = generateCombinations(cards);
  let bestHand = null;
  let bestRank = 0;
  let bestHandName = "High Card";

  possibleHands.forEach((hand) => {
    const handType = analyzeHand(hand);
    const rank = HAND_RANKS[handType] || 0;
    if (rank > bestRank) {
      bestRank = rank;
      bestHand = hand;
      bestHandName = handType;
    }
  });

  return { bestHand, bestHandName };
}

// ---- Helper: generate 7 random cards ----
function generateRandom7Cards() {
  const deck = generateDeck();
  return deck.slice(0, 7);
}

// ---- NEW: generate a 7-card hand whose BEST hand is a specific type ----
export function generateHandWithTargetType(targetType, maxTries = 200000) {
  let tries = 0;

  while (tries < maxTries) {
    const cards = generateRandom7Cards();
    const { bestHandName } = determineBestHand(cards);

    // Treat Royal Flush as its own distinct type
    if (targetType === "Royal Flush") {
      if (bestHandName === "Royal Flush") {
        return { cards, bestHandName };
      }
    } else {
      // For all other types, we want an exact match of the label
      if (bestHandName === targetType) {
        return { cards, bestHandName };
      }
    }

    tries++;
  }

  // Fallback: if for some reason we didn't hit it, just return a random hand
  const cards = generateRandom7Cards();
  const { bestHandName } = determineBestHand(cards);
  return { cards, bestHandName };
}

// ---- NEW: generate a uniform random hand type, then find a 7-card hand with that type ----
export function generateUniformHandByType() {
  const types = HAND_TYPES; // ["High Card", "One Pair", ..., "Royal Flush"]
  const targetType = types[Math.floor(Math.random() * types.length)];
  return generateHandWithTargetType(targetType);
}

// ---- Card code -> PNG filename mapping ----
export function cardToImage(card) {
  const rank = card.slice(0, card.length - 1);
  const suit = card.slice(-1);

  let fileRank = rank;

  // Your PNGs use lowercase for faces & A
  if (rank === "A") fileRank = "a";
  if (rank === "K") fileRank = "k";
  if (rank === "Q") fileRank = "q";
  if (rank === "J") fileRank = "j";

  return `${fileRank}${suit}`;
}

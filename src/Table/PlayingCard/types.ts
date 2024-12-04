export enum Rank {
  TWO = "two",
  THREE = "three",
  FOUR = "four",
  FIVE = "five",
  SIX = "six",
  SEVEN = "seven",
  EIGHT = "eight",
  NINE = "nine",
  TEN = "ten",
  JACK = "jack",
  QUEEN = "queen",
  KING = "king",
  ACE = "ace",
}

export enum Suit {
  DIAMONDS = "diamonds",
  CLUBS = "clubs",
  HEARTS = "hearts",
  SPADES = "spades",
}

export enum Turn {
  BET,
  DEALER,
  PAYOUT,
  PLAYER,
  SPLIT,
}

export enum Result {
  BLACKJACK,
  WIN,
  TIE,
  LOSE,
}

export interface CardType {
  id: string;
  rank: Rank;
  suit: Suit;
  faceUp: boolean;
}

export interface Score {
  score: number;
  isSoft: boolean;
}

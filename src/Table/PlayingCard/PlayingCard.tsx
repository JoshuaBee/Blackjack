import { CardType } from "./types";
import "./playing-card.css";

export default function Card({ card }: { card: CardType }) {
  return (
    <img
      className="playing-card"
      src={
        card.faceUp
          ? `./images/icons/${card.rank}-of-${card.suit}.svg`
          : "./images/icons/back.svg"
      }
      alt={
        card.faceUp ? `${card.rank} of ${card.suit}` : "face down playing card"
      }
    />
  );
}

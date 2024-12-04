import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  InlineStack,
  Layout,
  Modal,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { SettingsIcon } from "@shopify/polaris-icons";
import PlayingCard from "./PlayingCard/PlayingCard";

import "./styles.css";
import { Turn, CardType, Rank, Result, Score, Suit } from "./PlayingCard/types";

export default function Table() {
  function getCardScore(card: CardType): number {
    switch (card.rank) {
      case Rank.TWO:
        return 2;
      case Rank.THREE:
        return 3;
      case Rank.FOUR:
        return 4;
      case Rank.FIVE:
        return 5;
      case Rank.SIX:
        return 6;
      case Rank.SEVEN:
        return 7;
      case Rank.EIGHT:
        return 8;
      case Rank.NINE:
        return 9;
      case Rank.TEN:
        return 10;
      case Rank.JACK:
        return 10;
      case Rank.QUEEN:
        return 10;
      case Rank.KING:
        return 10;
      case Rank.ACE:
        return 11;
    }
  }

  function shuffle(cards: CardType[]) {
    let currentIndex;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    currentIndex = cards.length;
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = cards[currentIndex];
      cards[currentIndex] = cards[randomIndex];
      cards[randomIndex] = temporaryValue;
    }

    return cards;
  }

  const [shoe, setShoe] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [splitHand, setSplitHand] = useState<CardType[]>([]);
  const [dealerScore, setDealerScore] = useState<Score>({
    score: 0,
    isSoft: false,
  });
  const [playerScore, setPlayerScore] = useState<Score>({
    score: 0,
    isSoft: false,
  });
  const [splitScore, setSplitScore] = useState<Score>({
    score: 0,
    isSoft: false,
  });
  const [initialBet, setInitialBet] = useState<string>("10");
  const [playerBet, setPlayerBet] = useState<number>(0);
  const [splitBet, setSplitBet] = useState<number>(0);
  const [playerWinnings, setPlayerWinnings] = useState<number>(0);
  const [splitWinnings, setSplitWinnings] = useState<number>(0);
  const [chips, setChips] = useState<number>(100);
  const [turn, setTurn] = useState<Turn>(Turn.BET);
  const [decksInShoe, setDecksInShoe] = useState<number>(6);
  const [decksInShoeTemp, setDecksInShoeTemp] = useState<string>("6");
  const [showHandScore, setShowHandScore] = useState<boolean>(true);
  const [showHandScoreTemp, setShowHandScoreTemp] = useState<boolean>(true);
  const [showShoeCount, setShowShoeCount] = useState<boolean>(false);
  const [showShoeCountTemp, setShowShoeCountTemp] = useState<boolean>(false);
  const [dealerHitsSoft17, setDealerHitsSoft17] = useState<boolean>(true);
  const [dealerHitsSoft17Temp, setDealerHitsSoft17Temp] =
    useState<boolean>(true);
  const [allowDoubleAfterSplit, setAllowDoubleAfterSplit] =
    useState<boolean>(true);
  const [allowDoubleAfterSplitTemp, setAllowDoubleAfterSplitTemp] =
    useState<boolean>(true);
  const [optionsModalOpen, setOptionsModalOpen] = useState<boolean>(false);

  const ranks = useMemo(() => {
    return [
      Rank.TWO,
      Rank.THREE,
      Rank.FOUR,
      Rank.FIVE,
      Rank.SIX,
      Rank.SEVEN,
      Rank.EIGHT,
      Rank.NINE,
      Rank.TEN,
      Rank.JACK,
      Rank.QUEEN,
      Rank.KING,
      Rank.ACE,
    ];
  }, []);

  const suits = useMemo(() => {
    return [Suit.CLUBS, Suit.DIAMONDS, Suit.HEARTS, Suit.SPADES];
  }, []);

  const cards = useMemo(() => {
    const cards: CardType[] = [];
    for (let deckIndex = 0; deckIndex < decksInShoe; deckIndex++) {
      ranks.forEach((rank) => {
        suits.forEach((suit) => {
          cards.push({
            id: `${rank}-${suit}-${deckIndex}`,
            faceUp: true,
            rank,
            suit,
          });
        });
      });
    }

    return cards;
  }, [decksInShoe, ranks, suits]);

  useEffect(() => {
    setShoe(shuffle(cards));
  }, [cards]);

  useEffect(() => {
    if (turn === Turn.PAYOUT && shoe.length < 20) {
      setShoe(shuffle(cards));
    }
  }, [cards, shoe, turn]);

  const getHandScore = useCallback((hand: CardType[]): Score => {
    let score: number = 0;
    let isSoft: boolean = false;
    const faceUpCards = hand.filter((card) => card.faceUp);

    if (faceUpCards.length > 0) {
      score = faceUpCards.reduce(
        (score, card) => score + getCardScore(card),
        0,
      );

      const aceCount = faceUpCards.filter(
        (card) => card.rank === Rank.ACE,
      ).length;
      if (score > 21) {
        for (let i = 1; i <= aceCount; i++) {
          score -= 10;

          if (score <= 21) {
            isSoft = i < aceCount;
            break;
          }
        }
      } else {
        isSoft = aceCount > 0;
      }
    }

    return {
      score,
      isSoft,
    };
  }, []);

  const getResult = useCallback(
    (hand: CardType[], score: number): Result => {
      const isBlackjack = score === 21 && hand.length === 2;
      const isDealerBlackjack =
        dealerScore.score === 21 && dealerHand.length === 2;

      if (isBlackjack && isDealerBlackjack) {
        return Result.TIE;
      }

      if (isBlackjack) {
        return Result.BLACKJACK;
      }

      if (score > 21) {
        return Result.LOSE;
      }

      if (dealerScore.score > 21) {
        return Result.WIN;
      }

      if (score > dealerScore.score) {
        return Result.WIN;
      } else if (score < dealerScore.score) {
        return Result.LOSE;
      }

      return Result.TIE;
    },
    [dealerHand, dealerScore],
  );

  useEffect(() => {
    setDealerScore(getHandScore(dealerHand));
  }, [dealerHand, getHandScore]);

  useEffect(() => {
    setPlayerScore(getHandScore(playerHand));
  }, [getHandScore, playerHand]);

  useEffect(() => {
    setSplitScore(getHandScore(splitHand));
  }, [getHandScore, splitHand]);

  useEffect(() => {
    if (playerScore.score > 21) {
      setTurn(splitHand.length > 0 ? Turn.SPLIT : Turn.DEALER);
    }
  }, [playerScore, splitHand]);

  useEffect(() => {
    if (splitScore.score > 21) {
      setTurn(Turn.DEALER);
    }
  }, [splitScore]);

  useEffect(() => {
    if (turn === Turn.DEALER) {
      const newShoe = [...shoe];
      const newDealerHand = [...dealerHand];

      // flip cards face up
      newDealerHand.map((card) => (card.faceUp = true));

      let dealerScore = getHandScore(newDealerHand);

      while (
        dealerScore.score < 17 ||
        (dealerHitsSoft17 && dealerScore.score === 17 && dealerScore.isSoft)
      ) {
        newDealerHand.push(newShoe.pop()!);
        dealerScore = getHandScore(newDealerHand);
      }

      setDealerHand(newDealerHand);
      setDealerScore(dealerScore);
      setShoe(newShoe);
      setTurn(Turn.PAYOUT);
    }
  }, [dealerHand, dealerHitsSoft17, getHandScore, shoe, turn]);

  useEffect(() => {
    if (turn === Turn.PAYOUT) {
      let newPlayerWinnings = 0;
      switch (getResult(playerHand, playerScore.score)) {
        case Result.BLACKJACK:
          newPlayerWinnings += Math.floor(2.5 * playerBet);
          break;
        case Result.WIN:
          newPlayerWinnings += 2 * playerBet;
          break;
        case Result.TIE:
          newPlayerWinnings += playerBet;
      }

      let newSplitWinnings = 0;
      if (splitHand.length > 0) {
        switch (getResult(splitHand, splitScore.score)) {
          case Result.BLACKJACK:
            newSplitWinnings += Math.floor(2.5 * splitBet);
            break;
          case Result.WIN:
            newSplitWinnings += 2 * splitBet;
            break;
          case Result.TIE:
            newSplitWinnings += splitBet;
        }
      }

      setPlayerWinnings(newPlayerWinnings - playerBet);
      setSplitWinnings(newSplitWinnings - splitBet);
      setChips((c) => c + newPlayerWinnings + newSplitWinnings);
    }
  }, [
    dealerHand,
    getResult,
    playerBet,
    playerHand,
    playerScore,
    splitBet,
    splitHand,
    splitScore,
    turn,
  ]);

  function nextHand() {
    if (Number(initialBet) > chips) {
      setInitialBet(String(chips));
    }
    setDealerHand([]);
    setPlayerHand([]);
    setSplitHand([]);
    setTurn(Turn.BET);
  }

  function bet() {
    const newShoe = [...shoe];

    const dealerCard1 = newShoe.pop()!;
    const dealerCard2 = newShoe.pop()!;
    const dealerScore = getHandScore([dealerCard1, dealerCard2]);
    dealerCard2.faceUp = dealerScore.score === 21;
    setDealerHand([dealerCard1, dealerCard2]);

    const playerCard1 = newShoe.pop()!;
    const playerCard2 = newShoe.pop()!;
    setPlayerHand([playerCard1, playerCard2]);

    const bet = Math.min(Math.max(Number(initialBet), 0), chips);

    setShoe(newShoe);
    setTurn(Turn.PLAYER);
    setPlayerBet(bet);
    setSplitBet(0);
    setChips((c) => c - bet);
  }

  function hit() {
    const newShoe = [...shoe];

    if (turn === Turn.PLAYER) {
      setPlayerHand([...playerHand, newShoe.pop()!]);
    } else if (turn === Turn.SPLIT) {
      setSplitHand([...splitHand, newShoe.pop()!]);
    }

    setShoe(newShoe);
  }

  function stand() {
    endTurn();
  }

  function endTurn() {
    if (turn === Turn.SPLIT || splitHand.length === 0) {
      setTurn(Turn.DEALER);
    } else {
      setTurn(Turn.SPLIT);
    }
  }

  function double() {
    setChips((c) => c - Number(initialBet));

    if (turn === Turn.PLAYER) {
      setPlayerBet((b) => b + Number(initialBet));
    } else if (turn === Turn.SPLIT) {
      setSplitBet((b) => b + Number(initialBet));
    }

    hit();
    endTurn();
  }

  function split() {
    const newShoe = [...shoe];

    setPlayerHand([playerHand[0], newShoe.pop()!]);
    setSplitHand([playerHand[1], newShoe.pop()!]);
    setShoe(newShoe);

    setChips((c) => c - Number(initialBet));
    setSplitBet(Number(initialBet));
  }

  function reset() {
    setDealerHand([]);
    setPlayerHand([]);
    setSplitHand([]);
    setChips((c) => c + playerBet + splitBet);
    setPlayerBet(0);
    setSplitBet(0);
    setTurn(Turn.BET);
  }

  function getScoreName(hand: CardType[], score: Score) {
    if (hand.length === 2 && score.score === 21) {
      return "Blackjack";
    }

    return `${score.isSoft ? "Soft " : ""}${score.score}`;
  }

  return (
    <div className="table">
      <Box position="absolute" insetBlockStart="500" insetInlineEnd="500">
        <Button
          icon={SettingsIcon}
          onClick={() => {
            setDecksInShoeTemp(String(decksInShoe));
            setShowHandScoreTemp(showHandScore);
            setShowShoeCountTemp(showShoeCount);
            setDealerHitsSoft17Temp(dealerHitsSoft17);
            setAllowDoubleAfterSplitTemp(allowDoubleAfterSplit);
            setOptionsModalOpen(true);
          }}
          accessibilityLabel="Open options"
        />
      </Box>
      <Page>
        <Layout>
          <BlockStack gap="800" inlineAlign="center">
            {dealerHand.length > 0 ? (
              <Card>
                <BlockStack inlineAlign="center" gap="200">
                  <Text as="p" variant="headingXl">
                    {`Dealers hand${showShoeCount ? ` - ${shoe.length}` : ""}`}
                  </Text>
                  <InlineStack align="center" blockAlign="center" gap="300">
                    {dealerHand.map((dealerCard) => {
                      return (
                        <PlayingCard key={dealerCard.id} card={dealerCard} />
                      );
                    })}
                  </InlineStack>
                  {showHandScore ? (
                    <Text as="p" variant="headingLg">
                      {`Score: ${getScoreName(dealerHand, dealerScore)}`}
                    </Text>
                  ) : null}
                </BlockStack>
              </Card>
            ) : null}

            <InlineStack gap="500" wrap={false}>
              {playerHand.length > 0 ? (
                <Card
                  background={
                    splitHand.length > 0 && turn === Turn.PLAYER
                      ? "bg-surface-success"
                      : undefined
                  }
                >
                  <BlockStack inlineAlign="center" gap="200">
                    <Text as="p" variant="headingXl">
                      Players hand
                    </Text>
                    <InlineStack align="center" blockAlign="center" gap="300">
                      {playerHand.map((playerCard) => {
                        return (
                          <PlayingCard key={playerCard.id} card={playerCard} />
                        );
                      })}
                    </InlineStack>
                    <InlineStack align="center" blockAlign="center" gap="800">
                      {showHandScore ? (
                        <Text as="p" variant="headingLg">
                          {`Score: ${getScoreName(playerHand, playerScore)}`}
                        </Text>
                      ) : null}
                      {turn !== Turn.PAYOUT ? (
                        <Text as="p" variant="headingLg">
                          {`Bet: ${playerBet}`}
                        </Text>
                      ) : null}
                      {turn === Turn.PAYOUT ? (
                        <Text
                          as="p"
                          variant="headingLg"
                          tone={playerWinnings < 0 ? "critical" : "magic"}
                        >
                          {`${playerWinnings < 0 ? "Lost" : "Won"}: ${Math.abs(playerWinnings)}`}
                        </Text>
                      ) : null}
                    </InlineStack>
                  </BlockStack>
                </Card>
              ) : null}

              {splitHand.length > 0 ? (
                <Card
                  background={
                    splitHand.length > 0 && turn === Turn.SPLIT
                      ? "bg-surface-success"
                      : undefined
                  }
                >
                  <BlockStack inlineAlign="center" gap="200">
                    <Text as="p" variant="headingXl">
                      Split hand
                    </Text>
                    <InlineStack align="center" blockAlign="center" gap="300">
                      {splitHand.map((splitCard) => {
                        return (
                          <PlayingCard key={splitCard.id} card={splitCard} />
                        );
                      })}
                    </InlineStack>
                    <InlineStack align="center" blockAlign="center" gap="800">
                      {showHandScore ? (
                        <Text as="p" variant="headingLg">
                          {`Score: ${getScoreName(splitHand, splitScore)}`}
                        </Text>
                      ) : null}
                      {turn !== Turn.PAYOUT ? (
                        <Text as="p" variant="headingLg">
                          {`Bet: ${splitBet}`}
                        </Text>
                      ) : null}
                      {turn === Turn.PAYOUT ? (
                        <Text
                          as="p"
                          variant="headingLg"
                          tone={splitWinnings < 0 ? "critical" : "magic"}
                        >
                          {`${splitWinnings < 0 ? "Lost" : "Won"}: ${Math.abs(splitWinnings)}`}
                        </Text>
                      ) : null}
                    </InlineStack>
                  </BlockStack>
                </Card>
              ) : null}
            </InlineStack>

            <Card>
              <BlockStack inlineAlign="center" gap="200">
                {turn === Turn.BET ? (
                  <BlockStack inlineAlign="center" gap="200">
                    <TextField
                      label="Initial bet"
                      type="number"
                      value={initialBet}
                      onChange={setInitialBet}
                      autoComplete="off"
                      min={0}
                      max={chips}
                    />
                    <Button onClick={bet} disabled={chips === 0}>
                      Bet
                    </Button>
                  </BlockStack>
                ) : null}
                {turn === Turn.PLAYER || turn === Turn.SPLIT ? (
                  <InlineStack align="center" blockAlign="center" gap="300">
                    <Button onClick={hit}>Hit</Button>
                    <Button onClick={stand}>Stand</Button>
                    <Button
                      onClick={double}
                      disabled={
                        chips < Number(initialBet) ||
                        (!allowDoubleAfterSplit && splitHand.length > 0)
                      }
                    >
                      Double
                    </Button>
                    <Button
                      onClick={split}
                      disabled={
                        playerHand.length > 2 ||
                        splitHand.length > 0 ||
                        playerHand[0].rank !== playerHand[1].rank ||
                        chips < Number(initialBet)
                      }
                    >
                      Split
                    </Button>
                  </InlineStack>
                ) : null}
                {turn === Turn.PAYOUT ? (
                  <BlockStack inlineAlign="center" gap="200">
                    <Button onClick={nextHand}>Next hand</Button>
                  </BlockStack>
                ) : null}
                <Text as="p" variant="headingLg">
                  {`Chips: ${chips}`}
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
          <Modal
            open={optionsModalOpen}
            title="Options"
            onClose={() => setOptionsModalOpen(false)}
            primaryAction={{
              content: "Done",
              onAction: () => {
                setDecksInShoe(Number(decksInShoeTemp));
                setShowHandScore(showHandScoreTemp);
                setShowShoeCount(showShoeCountTemp);
                setDealerHitsSoft17(dealerHitsSoft17Temp);
                setAllowDoubleAfterSplit(allowDoubleAfterSplitTemp);
                setOptionsModalOpen(false);
                reset();
              },
            }}
            secondaryActions={[
              {
                content: "Close",
                onAction: () => setOptionsModalOpen(false),
              },
            ]}
          >
            <Modal.Section>
              <BlockStack gap="200">
                <TextField
                  label="Decks in shoe"
                  type="number"
                  value={decksInShoeTemp}
                  onChange={setDecksInShoeTemp}
                  autoComplete="off"
                  min={1}
                  max={8}
                />
                <Checkbox
                  label="Show hand score"
                  checked={showHandScoreTemp}
                  onChange={setShowHandScoreTemp}
                />
                <Checkbox
                  label="Show shoe count"
                  checked={showShoeCountTemp}
                  onChange={setShowShoeCountTemp}
                />
                <Checkbox
                  label="Dealer hits on soft 17"
                  checked={dealerHitsSoft17Temp}
                  onChange={setDealerHitsSoft17Temp}
                />
                <Checkbox
                  label="Allow double after split"
                  checked={allowDoubleAfterSplitTemp}
                  onChange={setAllowDoubleAfterSplitTemp}
                />
              </BlockStack>
            </Modal.Section>
          </Modal>
        </Layout>
      </Page>
    </div>
  );
}

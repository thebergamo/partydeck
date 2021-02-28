import { useState } from 'react';

function asMap(deck = []) {
  const map = new Map();
  deck.forEach((block, index) => {
    map.set(index, block);
  });
  return map;
}

export function useDeckEditor(initialDeck = []) {
  const [added, setAdded] = useState(new Map());
  const [modified, setModified] = useState(new Map());
  const [deleted, setDeleted] = useState(new Set());
  const [deck, setDeck] = useState(asMap(initialDeck));
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1);

  return {
    deck,
    added,
    modified,
    deleted,
    addCard(value) {
      const key = Math.max(...deck.keys()) + 1;
      setFocusedCardIndex(deck.size); // the deck size will increase, and the new index will equal the current deck size
      setDeck(map => new Map(map.set(key, value)));
      setAdded(map => new Map(map.set(key, value)));
    },
    modifyCard(key, value) {
      if (added.has(key)) {
        setAdded(map => new Map(map.set(key, value)));
      } else {
        setModified(map => new Map(map.set(key, value)));
      }
      setDeck(map => new Map(map.set(key, value)));
    },
    deleteCard(key) {
      if (added.has(key)) {
        setAdded(map => {
          const newMap = new Map(map);
          newMap.delete(key);
          return newMap;
        });
      } else {
        setDeleted(set => set.add(key));
      }
      setDeck(map => {
        const newMap = new Map(map);
        newMap.delete(key);
        return newMap;
      });
    },
    // focus utilities
    focusedCardIndex,
    setFocusedCardIndex,
    clearFocus() {
      setFocusedCardIndex(-1);
    },
    next() {
      setFocusedCardIndex(i => ++i);
    },
  };
}

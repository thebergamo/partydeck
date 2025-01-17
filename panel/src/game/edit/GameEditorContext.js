import { createContext, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthContext } from '../../auth/AuthContext';
import { useDeckEditor } from './useDeckEditor';

const GameEditorContext = createContext();

export function useGameEditorContext() {
  return useContext(GameEditorContext);
}

const GameEditorContextProvider = ({
  children,
  questions: initialQuestions = [],
  answers: initialAnswers = [],
  isPrivate: initialIsPrivate = false,
  name: initialName = '',
  author,
  lng: initialLng = 'en',
}) => {
  const { user } = useAuthContext();
  const isGameNew = !!!initialName; // if a title does not exist, the game is new.
  const isEditable = user?._id === author?._id || isGameNew;
  const [name, setName] = useState(initialName);
  const [isPrivate, setPrivate] = useState(initialIsPrivate);
  const [lng, setLng] = useState(initialLng);
  const questions = useDeckEditor(initialQuestions, 3);
  const answers = useDeckEditor(initialAnswers, 12);

  const questionsAreChanged = (card, key) => card !== initialQuestions?.[key];
  const answersAreChanged = (card, key) => card !== initialAnswers?.[key];
  const isChanged =
    name !== initialName ||
    isPrivate !== initialIsPrivate ||
    [...questions.deck.values()].some(questionsAreChanged) ||
    [...answers.deck.values()].some(answersAreChanged) ||
    questions.deck.size !== initialQuestions?.length ||
    answers.deck.size !== initialAnswers?.length;

  const clearState = () => {
    questions.clearFocus();
    questions.clearState();
    answers.clearFocus();
    answers.clearState();
    if (isGameNew) {
      setLng(initialLng);
      setName(initialName);
      setPrivate(initialIsPrivate);
    }
  };

  return (
    <GameEditorContext.Provider
      value={{
        isEditable,
        isGameNew,
        isChanged,
        name,
        setName,
        isPrivate,
        setPrivate,
        lng,
        setLng,
        questions,
        answers,
        author: isGameNew ? user : author,
        clearState,
      }}
    >
      {children}
    </GameEditorContext.Provider>
  );
};

export default GameEditorContextProvider;

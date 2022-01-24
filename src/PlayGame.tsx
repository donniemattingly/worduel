import React, {
    createContext, Dispatch,
    ReactChild,
    ReactNode,
    SyntheticEvent,
    useContext,
    useEffect,
    useReducer,
    useState
} from 'react';
import clsx from 'clsx';
import {words} from './dictionary';
import {Keyboard, KeyboardContext, KeyboardState, KeyEntryAction, LetterStatus} from './Keyboard';
import {Link, useParams} from 'react-router-dom';
import {doc, getDoc} from 'firebase/firestore';
import {db} from './index';

type LetterState = 'active' | 'incorrect' | 'partial' | 'correct';
export const GameRowLetter = (props: { letterState: LetterState, letter: string, index: number }) => {
    const {letterState, letter, index} = props;
    return <span
        className={clsx({
                'border-4 border-white': letterState === 'active',
                'bg-stone-600': letterState === 'incorrect',
                'bg-yellow-600': letterState === 'partial',
                'bg-emerald-600': letterState === 'correct',
                'pop': letter !== ' ',
                'inactive': letterState !== 'active',
                'i0': index === 0,
                'i1': index === 1,
                'i2': index === 2,
                'i3': index === 3,
                'i4': index === 4,
            },
            "rounded-md w-full h-full text-4xl uppercase font-bold leading-9 text-center p-3  inline-flex justify-center items-center")}>
        <span>{letter.length === 1 ? letter : ' '}</span>
    </span>
}

const getLetterDisplayState = (rowNum: number, charNum: number, state: KeyEntryState): LetterState => {
    if (rowNum >= getCurrentGuess(state.guesses)) {
        return 'active';
    } else {
        const guess = state.guesses[rowNum]
        if (guess[charNum] === state.word[charNum]) {
            return 'correct'
        } else if (state.word.includes(guess[charNum])) {
            return 'partial'
        } else {
            return 'incorrect';
        }
    }
}

const GameRow = (props: { rowNum: number }): JSX.Element => {
    const {rowNum} = props;
    const [state, dispatch] = useContext(KeyEntryContext);
    const isCurrentGuess = getCurrentGuess(state.guesses) === rowNum;
    return <div
        className={clsx({'invalid-guess': state.selectedInvalidWord && isCurrentGuess}, "grid grid-cols-5 gap-1")}>
        {[0, 1, 2, 3, 4].map(it => <GameRowLetter
            key={it}
            index= {it}
            letterState={getLetterDisplayState(rowNum, it, state)}
            letter={state?.guesses?.[rowNum]?.[it] ?? ' '}/>)}
    </div>
}

const GameBoard = (props: { guesses: { [k: number]: string[] } }): JSX.Element => {
    return <div className="grid grid-rows-6 gap-1 w-[346px] h-[414px] md:w-[375px] md:h-[450px] mx-auto select-none">
        {[0, 1, 2, 3, 4, 5].map(it => <GameRow key={it} rowNum={it}/>)}
    </div>
}


export const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
const KeyEntryContext = createContext<[KeyEntryState, React.Dispatch<KeyEntryAction>]>([{
    guesses: [],
    modalActive: false,
    word: 'ouija'.split(''),
    letterStatuses: {}
}, () => {
}])

const compilerMadeHappy: KeyboardContext = KeyEntryContext as unknown as KeyboardContext;

export interface KeyEntryState extends KeyboardState {
    guesses: { [k: number]: string[] }
    modalActive: boolean
    selectedInvalidWord?: boolean
    word: string[];
    id?: string;
    lost?: boolean
}

export interface AppAction {
    type: string;
    word?: string;
    id?: string;
}

interface AddWordAction extends AppAction {
    type: 'SET_WORD'
    word: string;
}

const getCurrentGuess = (guesses: { [k: number]: string[] }): number => {
    const guessKeys = Object.keys(guesses).map((k) => parseInt(k, 10))
    return Math.max(...guessKeys);
}

const checkForEnd = (state: KeyEntryState): { end: boolean, won: boolean } => {
    const current = getCurrentGuess(state.guesses);
    const won = state.guesses[current].join('') === state.word.join('');

    return {
        end: won || getCurrentGuess(state.guesses) === 5,
        won: won
    }
}

const EndModal = (props: { clear: () => void, endState: KeyEntryState }) => {
    const {clear, endState} = props;
    const [copied, setCopied] = useState(false);

    const share = async () => {
        const emoji = {
            'correct': '🟩',
            'incorrect': '⬜',
            'partial': '🟨',
            'active': '⬜'
        }

        const wordIndices = lettersToIndex(endState.word)
        const resultsStr = `Worduel ${endState.lost ? 'x' : getCurrentGuess(endState.guesses)}/6`
        const emojiStr = Object.values(endState.guesses).map((guess, row) => guess.map((it, idx) => {
            return emoji[getLetterDisplayState(row, idx, endState)]
        }).join('')).join('\n')

        const finalStr = `${resultsStr}\n${emojiStr}`

        if (navigator.share) {
            navigator.share({
                title: resultsStr,
                url: `https://worduel.app/${endState.id}`,
                text: finalStr
            }).then(() => {
                console.log('Thanks for sharing!');
            })
                .catch(console.error);
        } else {
            await navigator.clipboard.writeText(finalStr)
            setCopied(true)
        }
    }

    const clicked = async (event: React.MouseEvent<HTMLElement>) => {
        if ((event.target as HTMLElement).tagName !== 'BUTTON') {
            clear();
        }
    }

    return <div className="absolute top-0 w-full h-full bg-stone-500/50 grid place-items-center" onClick={clicked}>
        <div className="p-10 bg-stone-500 rounded-xl flex flex-col items-center" onClick={() => {
        }}>
            <h1 className="text-6xl font-bold"> You {endState.lost ? 'Lost.' : 'Won!'} </h1>
            {endState.lost
                ? <p> Word was {endState.word.join('')} </p>
                : null
            }
            {!copied
                ? <button className="rounded-lg bg-white text-stone-900 p-4 mt-8" onClick={share}> share</button>
                : <p> Copied to clipboard! </p>
            }
            <Link className="underline" to={'/'}>Create your own puzzle</Link>
        </div>
    </div>
}

const lettersToIndex = (arr: string[]): Record<string, number> => arr.reduce((acc, val, idx) => ({
    ...acc,
    [val]: idx
}), {})
const getLetterStatuses = (state: KeyEntryState): Record<string, LetterStatus> => {
    const wordLettersToIndex = lettersToIndex(state.word)
    const letterGuessesByIndex = Object.values(state.guesses).map(it => lettersToIndex(it)).flatMap(it => Object.entries(it));

    return letterGuessesByIndex.reduce((acc, [letter, idx]) => {
        if (wordLettersToIndex[letter] === idx) {
            return {...acc, [letter]: 'correct'}
        } else if (!!wordLettersToIndex[letter]) {
            return {...acc, [letter]: 'partial'}
        } else {
            return {...acc, [letter]: 'incorrect'}
        }
    }, {})
}

export function PlayGame() {
    const params = useParams();
    const [end, setEnd] = useState(false);
    const [modalDismissed, setModalDismissed] = useState(false);
    const [state, dispatch] = useReducer<(state: KeyEntryState, action: KeyEntryAction | AppAction) => KeyEntryState>((state, action) => {
        const currentIdx = getCurrentGuess(state.guesses);
        if ('key' in action) {
            if (end) {
                return state;
            }
            if (action.key.toLowerCase() === 'escape' && state.modalActive) {
                return {
                    ...state,
                    modalActive: false
                }
            }
            if (currentIdx === -Infinity && !action.key.toLowerCase().includes('back') && letters.includes(action.key.toLowerCase())) {
                return {
                    ...state,
                    guesses: [[action.key]]
                }
            } else {
                const current = state.guesses[currentIdx]
                if (action.key.toLowerCase().includes('back')) {
                    return {
                        ...state,
                        selectedInvalidWord: false,
                        guesses: {
                            ...state.guesses,
                            [currentIdx]: current.slice(0, -1)
                        }
                    }
                } else if (current?.length < 5 && letters.includes(action.key.toLowerCase())) {
                    return {
                        ...state,
                        guesses: {
                            ...state.guesses,
                            [currentIdx]: [...current, action.key]
                        }
                    }
                } else if (current?.length === 5 && action.key.toLowerCase() === 'enter') {
                    if (words.includes(current.join(''))) {
                        const endCheck = checkForEnd(state)
                        setEnd(endCheck.end);
                        return {
                            ...state,
                            lost: !endCheck.won,
                            letterStatuses: getLetterStatuses(state),
                            guesses: {
                                ...state.guesses,
                                [currentIdx + 1]: []
                            }
                        }
                    } else {
                        return {
                            ...state,
                            selectedInvalidWord: true
                        }
                    }
                }
            }
        }
        if ('type' in action) {
            if (action.type === 'TOGGLE_MODAL') {
                return {
                    ...state,
                    modalActive: !state.modalActive
                }
            } else if (action.type === 'SET_WORD') {
                return {
                    ...state,
                    id: action.id,
                    word: action?.word?.split('') ?? []
                }
            }
        }
        return state;
    }, {guesses: [], word: 'aloof'.split(''), modalActive: false, letterStatuses: {}})


    useEffect(() => {
        if(params.id){
            getDoc(doc(db, "words", params.id))
                .then(snapshot => {
                    if(snapshot.exists()){
                        dispatch({type: 'SET_WORD', word: snapshot.data().word, id: params.id})
                    }
                })
        }
    }, [])

    return (
        <KeyEntryContext.Provider value={[state, dispatch]}>
            <div
                className="bg-stone-900 text-slate-50 flex flex-col justify-between items-center bottom-0 h-device-full">
                <div>
                    <h1 className="text-3xl md:text-6xl w-full text-center md:p-4 font-bold"> Worduel </h1>
                    {state.selectedInvalidWord
                        ? <div className="flex flex-col items-center">
                            <div
                                className="text-center bg-stone-50 text-stone-900 text-2xl p-2 md:my-8 my-2 rounded-lg">
                                {state.selectedInvalidWord ? 'Not in word list' : null}
                            </div>
                        </div>
                        : null
                    }
                </div>
                <GameBoard guesses={state.guesses}/>
                <Keyboard context={compilerMadeHappy}/>
                {end && !modalDismissed
                    ? <EndModal endState={state} clear={() => setModalDismissed(true)}/>
                    : null}
            </div>
        </KeyEntryContext.Provider>
    );
}

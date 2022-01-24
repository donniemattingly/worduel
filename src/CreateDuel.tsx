import {Keyboard, KeyboardContext, KeyboardState, KeyEntryAction} from './Keyboard';
import React, {createContext, Dispatch, useContext, useReducer, useState} from 'react';
import clsx from 'clsx';
import {GameRowLetter, letters} from './PlayGame';
import {words} from './dictionary';
import {collection, addDoc} from "firebase/firestore";
import {db} from './index';

const CreateDuelContext = createContext<[CreateDuelState, Dispatch<KeyEntryAction>]>([{
    letterStatuses: {},
    word: ''
}, () => {
}])

interface CreateDuelState extends KeyboardState {
    word: string
    invalidWord?: boolean
}

interface CreateDuelAction {
    type: string;
}

const makeCompilerHappy = CreateDuelContext as unknown as KeyboardContext;

const WordEntry = () => {
    const [state, dispatch] = useContext(CreateDuelContext);

    return <div className={"grid grid-rows-6 gap-1 w-[346px] h-[69px] md:w-[375px] md:h-[75px] mx-auto select-none"}>
        <div
            className={clsx({'invalid-guess': state.invalidWord}, "grid grid-cols-5 gap-1 h-[69px] md:h-[75px]")}>
            {[0, 1, 2, 3, 4].map(it => <GameRowLetter
                key={it}
                index={it}
                letterState={'active'}
                letter={state.word[it] ?? ' '}
            />)
            }
        </div>
    </div>
}

export const CreateDuel = () => {
    const [loading, setLoading] = useState(false);
    const [id, setId] = useState<string | null>(null);
    const [state, dispatch] = useReducer<(state: CreateDuelState, action: KeyEntryAction | CreateDuelAction) => CreateDuelState>((state, action) => {
        console.log(action);
        if ('key' in action) {
            if (letters.includes(action.key.toLowerCase()) && state.word.length <= 5) {
                return {
                    ...state,
                    word: state.word + action.key,
                    invalidWord: false
                }
            } else if (action.key.toLowerCase().includes('back')) {
                return {
                    ...state,
                    word: state.word.slice(0, -1),
                    invalidWord: false
                }
            }
        } else if ('type' in action) {
            if (action.type === 'INVALID_WORD') {
                return {
                    ...state,
                    invalidWord: true
                }
            }
        }
        return state;
    }, {letterStatuses: {}, word: ''});

    const createWord = async () => {
        const normalizedWord = state.word.toLowerCase();
        if (!words.includes(normalizedWord)) {
            dispatch({type: 'INVALID_WORD'})
        } else {
            setLoading(true);
            const docRef = await addDoc(collection(db, "words"), {
                word: normalizedWord
            });
            console.log("Document written with ID: ", docRef.id);
            setLoading(false);
            setId(docRef.id);
        }
    }

    const [copied, setCopied] = useState(false);
    const share = async () => {
        const url = `https://worduel.app/${id}`;
        await navigator.clipboard.writeText(url)
        setCopied(true)
    }

    return <CreateDuelContext.Provider value={[state, dispatch]}>
        <div
            className="bg-stone-900 text-slate-50 flex flex-col justify-between items-center bottom-0 h-device-full">
            <div>
                <h1 className="text-3xl md:text-6xl w-full text-center md:p-4 font-bold"> Worduel </h1>
            </div>
            <div>
                <p> Generate a custom word puzzle to share</p>
            </div>
            {state.invalidWord
                ? <div className="flex flex-col items-center">
                    <div
                        className="text-center bg-stone-50 text-stone-900 text-2xl p-2 md:my-8 my-2 rounded-lg">
                        Not in word list
                    </div>
                </div>
                : null
            }
            <WordEntry/>
            {id === null
                ? <div>
                    <button
                        onClick={createWord}
                        className={clsx("bg-stone-500 font-bold text-4xl p-4 rounded-lg active:bg-stone-200", {
                            'bg-white': state.word.length === 5,
                            'text-emerald-600': state.word.length === 5,
                            'text-stone-400': state.word.length !== 5,
                        })}>
                        {loading
                            ? <i className="fas fa-spinner fa-spin"/>
                            : 'Generate'
                        }
                    </button>
                </div>
                : <div>
                    {!copied
                        ?
                        <div onClick={share}
                             className="bg-white text-stone-900 text-center font-bold text-4xl p-4 rounded-lg active:bg-stone-200">
                            Share <i className="fas fa-share"/>
                        </div>
                        : <div
                            className="bg-white text-stone-900 text-center font-bold text-4xl p-4 rounded-lg active:bg-stone-200">
                            Copied to Clipboard!
                        </div>
                    }
                    <p> Or you can give them the url: https://worduel.app/{id}</p>
                </div>
            }
            <Keyboard context={makeCompilerHappy}/>
        </div>
    </CreateDuelContext.Provider>
}
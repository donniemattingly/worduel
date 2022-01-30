import {AppAction, GameBoard, getCurrentGuess, KeyEntryState, letters} from "./PlayGame";
import {Keyboard, KeyboardContext, KeyEntryAction} from "./Keyboard";
import React, {createContext, useReducer} from "react";
import {words} from "./dictionary";

const KeyEntryContext = createContext<[KeyEntryState, React.Dispatch<KeyEntryAction>]>([{
    guesses: [],
    modalActive: false,
    word: 'ouija'.split(''),
    letterStatuses: {}
}, () => {
}])

interface StrategyAction {
    type: string;
}

const compilerMadeHappy: KeyboardContext = KeyEntryContext as unknown as KeyboardContext;

export const StrategySimulation = (props: any) => {
    const [state, dispatch] = useReducer<(state: KeyEntryState, action: KeyEntryAction | AppAction) => KeyEntryState>((state, action) => {
        console.log(state);
        const currentIdx = getCurrentGuess(state.guesses);
        if ('key' in action) {
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
                        return state
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
            } else if (action.type === 'LOAD_STATE') {
                return {
                    ...state,
                    ...action.newState
                }
            }
        }
        return state;
    }, {guesses: [], word: 'aloof'.split(''), modalActive: false, letterStatuses: {}})

    return <KeyEntryContext.Provider value={[state, dispatch]}>
        <GameBoard guesses={state.guesses}/>
        <Keyboard context={compilerMadeHappy}/>
    </KeyEntryContext.Provider>

}
import React, {useContext, useEffect, useReducer} from 'react';
import clsx from 'clsx';
import {letters} from './PlayGame';

export type LetterStatus = 'correct' | 'partial' | 'incorrect' | 'unused';

export interface KeyboardState {
    letterStatuses: { [k: string]: LetterStatus };
}

export interface KeyEntryAction {
    key: string;
}

const KeyboardKey = (props: { keyName: string, context: KeyboardContext }) => {
    const {keyName, context} = props;
    const [state, dispatch] = useContext(context);
    console.log(state.letterStatuses[keyName])
    return <div onClick={() => dispatch({key: keyName})}
                className={clsx(
                    "text-md md:text-2xl active:bg-stone-500 py-4 px-[2.5vw] md:px-4 m-[.2rem]",
                    "rounded-md touch-manipulation min-w-[30px] inline-flex justify-center items-center"
                    , {
                        'bg-stone-800': state.letterStatuses[keyName] === 'incorrect',
                        'bg-yellow-600': state.letterStatuses[keyName] === 'partial',
                        'bg-emerald-600': state.letterStatuses[keyName] === 'correct',
                        'bg-stone-600': !state.letterStatuses[keyName],
                        'uppercase': keyName.length === 1
                    },)}>
        {keyName}
    </div>
}

const KeyboardRow = (props: { row: string[], context: KeyboardContext }) => {
    const {row, context} = props;
    return <div className="flex flex-row">
        {row.map(it => <KeyboardKey context={context} key={it} keyName={it}/>)}
    </div>
}

export type KeyboardContext = React.Context<[KeyboardState, React.Dispatch<KeyEntryAction>]>
export const Keyboard = (props: { context: KeyboardContext }): JSX.Element => {
    const r1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
    const r2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
    const r3 = ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'back'];

    const {context} = props;
    const [state, dispatch] = useContext(context);

    useEffect(() => {
        window.addEventListener("keydown", onKeyPressHandler);
        return () => {
            window.removeEventListener("keydown", onKeyPressHandler);
        };
    }, []);

    const onKeyPressHandler = (event: KeyboardEvent) => {
        dispatch(event)
    }

    return <div className="flex flex-col w-full items-center mb-2 sm:mb-10 select-none">
        <KeyboardRow context={context} row={r1}/>
        <KeyboardRow context={context} row={r2}/>
        <KeyboardRow context={context} row={r3}/>
    </div>
}
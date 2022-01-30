import clsx from "clsx";
import React, {useContext} from "react";
import {useParams} from "react-router-dom";

const GameRowLetter = (props: { letter: string, index: number }) => {
    const {letter, index} = props;
    const color = getBgColorFromChar(letter);
    const colorStr = `bg-${color}-600`;
    console.log(colorStr)
    return <span
        className={clsx({[colorStr]: true},
            `text-white rounded-md w-full h-full text-4xl uppercase font-bold leading-9 text-center p-3  inline-flex justify-center items-center`)}>
        <span>{letter.length === 1 ? letter : ' '}</span>
    </span>
}
const colors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']

const getBgColorFromChar = (char: string) => {
    const charCode = char.charCodeAt(0);
    return colors[Math.floor((charCode - 48) * 0.27)]
}

const GameRow = (props: { rowNum: number, row: string[] }): JSX.Element => {
    const {rowNum, row} = props;
    return <div
        className={clsx("grid grid-cols-5 gap-1")}>
        {[0, 1, 2, 3, 4].map(it => <GameRowLetter
            key={it}
            index={it}
            letter={row[it]}
        />)
        }
    </div>
}

const GameCodeBoard = (props: { code: string }): JSX.Element => {
    const {code} = props;
    const array = code.split('');
    const chunks: string[][] = []
    let i, j, chunk = 5;
    for (i = 0, j = array.length; i < j; i += chunk) {
        chunks.push(array.slice(i, i + chunk));
    }

    return <div className="grid grid-rows-4 gap-1 w-[346px] h-[276px] md:w-[375px] md:h-[300px] mx-auto select-none">
        {[0, 1, 2, 3].map(it => <GameRow key={it} rowNum={it} row={chunks[it]}/>)}
    </div>
}


export const OpenGraphImage = () => {
    const params = useParams();
    const code = params.id ?? ''
    const padded = code.padEnd(20)
    return <div className="flex flex-row h-full justify-around items-center">
        <div className="text-white text-center">
            <h1 className="text-9xl font-bold">
                Worduel
            </h1>
            <p className="text-4xl text-white text-center">
                Create and share word puzzles
            </p>
        </div>
        <div className="h-full grid place-items-center">
            <GameCodeBoard code={padded}/>
        </div>
    </div>
}
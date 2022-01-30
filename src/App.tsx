import {
    Routes,
    Route,
} from "react-router-dom";
import {PlayGame} from './PlayGame';
import {CreateDuel} from './CreateDuel';
import {StrategySimulation} from "./StrategySimulation";

export const App = () => {
    return <Routes>
        <Route path="/" element={<CreateDuel/>}/>
        <Route path="/strategy" element={<StrategySimulation/>}/>
        <Route path="/:id" element={<PlayGame/>}/>
    </Routes>
}
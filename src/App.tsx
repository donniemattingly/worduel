import {
    Routes,
    Route,
} from "react-router-dom";
import {PlayGame} from './PlayGame';
import {CreateDuel} from './CreateDuel';
import {StrategySimulation} from "./StrategySimulation";
import {OpenGraphImage} from "./OpenGraphImage";

export const App = () => {
    return <Routes>
        <Route path="/" element={<CreateDuel/>}/>
        <Route path="/strategy" element={<StrategySimulation/>}/>
        <Route path="/:id" element={<PlayGame/>}/>
        <Route path="/og-image/:id" element={<OpenGraphImage/>}/>
    </Routes>
}
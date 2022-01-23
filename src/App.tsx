import {
    Routes,
    Route,
} from "react-router-dom";
import {PlayGame} from './PlayGame';
import {CreateDuel} from './CreateDuel';

export const App = () => {
    return <Routes>
        <Route path="/" element={<CreateDuel/>}/>
        <Route path="/:id" element={<PlayGame/>}/>
    </Routes>
}
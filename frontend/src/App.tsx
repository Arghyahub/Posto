import {useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
import {Greet} from "../wailsjs/go/main/App";
import PermanentDrawerLeft from './components/permanent-drawer';

function App() {
    const [resultText, setResultText] = useState("Please enter your name below 👇");
    const [name, setName] = useState('');
    const updateName = (e: any) => setName(e.target.value);
    const updateResultText = (result: string) => setResultText(result);

    function greet() {
        Greet(name).then(updateResultText);
    }

    return (
        <div id="App" className='flex flex-col h-[100svh] bg-zinc-800 border-zinc-600' >
            <PermanentDrawerLeft/>
            <div className="flex flex-col w-full h-full">ok</div>
        </div>
    )
}

export default App

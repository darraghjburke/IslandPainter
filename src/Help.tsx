import { useState } from "react";

export default function Help() {
    const [visible, setVisible] = useState(false);
    return <>
        {visible ?
        <div id="help-box">
            <h1>Island Painter</h1>
            <p>Powered by <a href="https://babylonjs.com/">Babylon.js</a></p>
            <p>Created by <a href="https://twitter.com/DarraghBurke13">Darragh Burke</a></p>
            <p>Get the source at <a href="https://github.com/darraghjburke/IslandPainter">GitHub</a> </p>
            <p>Networking using <a href="https://www.colyseus.io/">Colyseus</a></p>
            <p>Assets by <a href="https://kaylousberg.itch.io/kaykit-medieval-builder-pack">Kay Lousberg</a> - check out their work!</p>
            <p>Hex coordinate conversions by <a href="https://www.redblobgames.com/grids/hexagons">RedBlobGames</a></p>
            <p>Hand drawn CSS from <a href="https://codemyui.com/hand-drawn-border-buttons-css/">CodeMyUI</a></p>
            <button onClick={() => setVisible(false)}>X</button>
        </div>
        : <></> }
        <button onClick={() => setVisible(!visible)} id="help-button">?</button>
    </>;
}
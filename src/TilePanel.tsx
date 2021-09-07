import { useEffect, useState } from 'react';
import { Tile } from './schema/MyRoomState';
import { terrainTypes, buildingTypes } from './schema/WorldObjects';


interface TilePanelProps {
    tile: Tile;
    demolishBuilding: () => void;
    buildBuilding: (type: number) => void;
    setTerrainType: (type: number) => void;
    setHeight: (height: number) => void;
    setRotation: (rotation: number) => void;
}

export default function TilePanel(props: TilePanelProps) {
    const [rotation,setRotationLocal] = useState(0);
    const [height,setHeightLocal] = useState(0);

    useEffect(() => {
        setHeightLocal(props.tile ? props.tile.height : 0);
        if (props.tile && props.tile.building) {
            setRotationLocal(props.tile.building.rotation);
        }
    }, [props.tile]);

    const updateHeight = (height : number) => {
        setHeightLocal(height);
        props.setHeight(height);
    }

    const updateRotation = (rotation: number) => {
        setRotationLocal(rotation);
        props.setRotation(rotation);
    }

    return <div id="tile-panel" className={!props.tile ? "hide" : ""}>
        {
        !props.tile ? <></> :
        <>
            <div id="terrain-type">
                {terrainTypes.map((type, index) => <button key={index} onClick={() => props.setTerrainType(index)} className={props.tile.terrainType == index ? "terrain selected" : "terrain" } style={{backgroundColor: type.color}}></button>)}
                <h3>{terrainTypes[props.tile.terrainType].name}</h3>
            </div>
            <div id = "height">
                <div><label htmlFor="height">Height</label></div>
                <input type="range" step="0.05" min="0" max="2" value={height} onChange={ev => updateHeight(parseFloat(ev.target.value))} id="height"/>
            </div>
            <div className="hr"/>
            {!(props.tile.building) ?
                <div id="no-building">
                    <h3>Build</h3>
                    {buildingTypes.map((type, index) => type.terrainTypes.includes(props.tile.terrainType) ? <button key={type.name} onClick={() => props.buildBuilding(index)}>{type.name}</button> : <></>)}
                </div>
                :
                <div id="building">
                    <h3>{buildingTypes[props.tile.building.type].name}</h3>
                    <div><label htmlFor="rotation">Rotation</label></div>
                    <input type="range" min="0" max={2*Math.PI} step={0.1} value={rotation} onChange={ev => updateRotation(parseFloat(ev.target.value))} id="rotation"/>
                    <button onClick={props.demolishBuilding}>Demolish</button>
                </div>
            }
        </>
        }
    </div>;
}
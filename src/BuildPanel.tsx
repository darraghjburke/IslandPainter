import { buildingTypes } from './schema/WorldObjects';

export default function BuildPanel(props: {setBuildType: (type : number) => void}) {
    return <div id="build-panel">
        <h3>Build</h3>
        {buildingTypes.map((type, index) => <button key={type.name} onClick={() => props.setBuildType(index)}>{type.name}</button>)}
    </div>
}
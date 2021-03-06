import React, { useState } from "react";
import * as Colyseus from "colyseus.js"; // not necessary if included via <script> tag.
import {  Vector3, HemisphericLight, Scene, Mesh, TransformNode, Animation, SceneLoader, PointerEventTypes, Node, AssetsManager, ArcRotateCamera, StateCondition, PBRMaterial, Color3 } from "@babylonjs/core";
import SceneComponent from "./SceneComponent"; // uses above component in same directory
import { MyRoomState, Player, Tile } from './schema/MyRoomState';
import "./App.css";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import TilePanel from './TilePanel';
import { Nullable } from "@babylonjs/core/types";
import Chat from "./Chat";
import { buildingTypes, terrainTypes } from "./schema/WorldObjects";
import Help from "./Help";
import BuildPanel from "./BuildPanel";
import { AssetContainer } from "@babylonjs/core/assetContainer";

class GameObject {
    assetContainer : AssetContainer;
    // buildMesh: Mesh;

    constructor(folder: string, glb: string, assetManager: AssetsManager) {
        const task = assetManager.addContainerTask("task", "", `${process.env.PUBLIC_URL}/assets/${folder}/`, `${glb}.glb`);
        task.onSuccess = (task) => {
            this.assetContainer = task.loadedContainer;
            // this.buildMesh = this.parentMesh.clone(`build${this.parentMesh.name}`, null);
            // this.buildMesh.getChildMeshes().forEach(mesh => {
            //     mesh.material = mesh.material.clone("");
            //     mesh.material.alpha = 0.5;
            //     (mesh.material as PBRMaterial).alpha = 0.1;
            //     (mesh.material as PBRMaterial).alphaMode = 1;
            // })
        }
    }
}

function updateTileBorder(tile: Tile, transformNode: TransformNode) {
    const col3 = new Color3(0,0,0);
    // average the colors of the players who are focusing
    tile.focusing.forEach(player => {
        col3.r += player.color.r / tile.focusing.length;
        col3.g += player.color.g / tile.focusing.length;
        col3.b += player.color.b / tile.focusing.length;
    })
    transformNode.getChildMeshes().forEach(mesh => {
        if (tile.focusing.length == 0) {
            mesh.renderOutline = false;
        } else {
            mesh.renderOutline = true;
            mesh.outlineColor = col3;
            mesh.outlineWidth = 0.05;
        }
    })
}

export default () => {
    const [focusedKey, setFocusedKey] = useState(-1);
    const [roomState, setRoomState] = useState(new MyRoomState());
    const [state, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const [room, setRoom] = useState<Nullable<Colyseus.Room>>(null);
    const terrains : GameObject[] = [];
    const buildings : GameObject[] = [];
    // let buildType = 0;
    // let buildMesh : Mesh = null;


    async function loadGameData(scene: Scene) {
        const assetManager = new AssetsManager(scene);
        terrainTypes.forEach(type => {
            terrains.push(new GameObject("tiles", type.asset, assetManager));
        })
        buildingTypes.forEach(type => {
            buildings.push(new GameObject("buildings", type.asset, assetManager));
        })
        await assetManager.loadAsync();
    };

    // thanks to RedBlobGames
    function getCoords(key: number, width: number) : [x: number, y: number] {
        return getPixelFromAxial(...getAxialFromKey(key, width));
    }

    function getAxialFromKey(key: number, width: number) : [r: number, q: number] {
        return [key % width, Math.floor(key / width)];
    }

    function getPixelFromAxial(col: number, row: number) : [x: number, y: number] {
        const sz = 1.1;
        return [sz * (Math.sqrt(3) * col + Math.sqrt(3) /2 * row), sz * 3/2 * row];
    }

    function connect(scene: Scene) {
        var client = new Colyseus.Client('wss://mamawn.us-west-1.colyseus.dev'); // for colyseus arena
        // const client = new Colyseus.Client('ws://localhost:2567'); // for local dev
        client.joinOrCreate("my_room").then(room => {
            setRoom(room);
            console.log(room.sessionId, "joined", room.name);
            room.onStateChange((state : any) => {
                setRoomState(state);
                forceUpdate();
            });
            const state = (room.state as MyRoomState);
            const [cx, cy] = getPixelFromAxial(25 / 2, 25 / 2);
            (scene.cameras[0] as ArcRotateCamera).target.set(cx,2,cy);
            (scene.cameras[0] as ArcRotateCamera).radius = 40;
            
            state.tiles.onAdd = (tile: Tile, key: number) => {
                const [x,y] = getCoords(key, state.width);
                let transformNode  = new TransformNode(`${key}`, scene);
                transformNode.position.set(x, tile.height, y);
                transformNode.metadata = {key};
                let terrainMesh = terrains[tile.terrainType].assetContainer.instantiateModelsToScene().rootNodes[0];
                terrainMesh.setParent(transformNode);
                let buildingNode : TransformNode = null;
                let buildingMesh : TransformNode = null;
                tile.listen("building", (currentValue, previousValue) => {
                    if (previousValue) {
                        const animation = Animation.CreateAndStartAnimation("build",  buildingNode, "position.y", 60, 10, 1, 0);
                        animation.loopAnimation = false;
                        animation.onAnimationEndObservable.add((eventData) => {eventData.target.dispose();});
                    }
                    if (currentValue) {
                        buildingNode = new TransformNode("building", scene);
                        buildingNode.parent = transformNode;
                        buildingMesh = buildings[currentValue.type].assetContainer.instantiateModelsToScene().rootNodes[0];
                        buildingMesh.setParent(buildingNode);
                        buildingMesh.position.set(0,0,0);
                        const animation = Animation.CreateAndStartAnimation("build", buildingNode, "position.y", 60, 10, 0, 1);
                        animation.loopAnimation = false;
                        tile.building.listen("rotation", (currentValue, previousValue) => {
                            buildingNode.rotation.y = tile.building.rotation;
                        })
                        updateTileBorder(tile, transformNode);
                    }
                })
                tile.listen("terrainType", (currentValue, previousValue) => {
                    if (previousValue !== null) {
                        terrainMesh.dispose();
                    }
                    if (currentValue !== null) {
                        terrainMesh = terrains[tile.terrainType].assetContainer.instantiateModelsToScene().rootNodes[0];
                        terrainMesh.setParent(transformNode);
                        terrainMesh.position.set(0,0,0);
                        updateTileBorder(tile, transformNode);
                    }
                })
                tile.listen("height", (currentValue, previousValue) => {
                    transformNode.position.y = tile.height;
                })
                tile.listen("focusing", () => {
                    updateTileBorder(tile, transformNode);
                });
            }
            scene.onPointerObservable.add((pointerInfo) => {
                let key = -1;
                if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
                    const mesh = pointerInfo.pickInfo.pickedMesh;
                    let keyNode : Node = mesh;
                    while(!keyNode.metadata || !keyNode.metadata.key) {
                        keyNode = keyNode.parent;
                        if (!keyNode) return;
                    }
                    key = keyNode.metadata.key;
                }
                if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                    if (key == -1 || state.tiles[key].focusing.length == 0) {
                        setFocusedKey(key);
                        room.send("focus", {key});
                    }
                } /* else if (buildType != -1) {
                    if (key == -1) {
                        if (buildMesh != null) {
                            buildMesh.dispose();
                            buildMesh = null;
                        }
                    } else {
                        if (buildMesh == null) {
                            const nm = buildings[buildType].buildMesh.clone("build", null);
                            buildMesh = nm;
                        }
                        const [x,y] = getCoords(key, state.width);
                        buildMesh.position.x = x;
                        buildMesh.position.z = y;
                        buildMesh.position.y = state.tiles[key].height;
                        console.log(buildMesh.position.toString())
                    }
                } */
            })
            
        }).catch(e => {
            alert("Couldn't connect to the server, it may be in the middle of redeployment. Please refresh the page in a few minutes.");
            console.log("JOIN ERROR", e);
        });
    }
    const onSceneReady = (scene : Scene) => {
        loadGameData(scene)
            .then(() => connect(scene));
    
      // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera(
            "camera",
            0,
            Math.PI / 3,
            10,
            new Vector3(0, 0, 0),
            scene
        );
    
      // This targets the camera to scene origin
      camera.setTarget(Vector3.Zero());

      camera.lowerRadiusLimit = 4;
      camera.upperRadiusLimit = 100;
      camera.useBouncingBehavior = true;
      camera.useAutoRotationBehavior = true;
      camera.autoRotationBehavior.idleRotationWaitTime = 30000;
      camera._useCtrlForPanning = false;
      camera.panningAxis = Vector3.Zero();

    
      const canvas = scene.getEngine().getRenderingCanvas();
    
      // This attaches the camera to the canvas
      camera.attachControl(canvas, true);
    
      // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
      var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    
      // Default intensity is 1. Let's dim the light a small amount
      light.intensity = 0.7;
    
    };

    /**
 * Will run on every frame render. 
 */
const onRender = (scene : Scene) => {};

  return <div>
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
    <TilePanel
        tile={roomState.tiles[focusedKey]}
        demolishBuilding={() => room.send("demolish", {key: focusedKey})}
        buildBuilding={type => room.send("build", {key: focusedKey, type})}
        setTerrainType={type => room.send("changeTerrainType", {key: focusedKey, type})}
        setHeight={height => room.send("setHeight", {key: focusedKey, height})}
        setRotation={rotation => room.send("setRotation", {key: focusedKey, rotation})}
    />
    <Chat
        players={roomState.players}
        sendMessage={(message) => room.send("message", {message})}
        messages={roomState.messages}
    />
    <h1 id="world-name">{roomState.name}</h1>
    {/* <BuildPanel setBuildType={type => buildType = type}/> */}
    <Help/>
  </div>
};

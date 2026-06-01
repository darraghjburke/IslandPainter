"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = void 0;
const colyseus_1 = require("colyseus");
const MyRoomState_1 = require("./schema/MyRoomState");
const WorldObjects_1 = require("./schema/WorldObjects");
const names_1 = require("../names");
// thanks to RedBlobGames
function axialToCube(coord) {
    var x = coord.q;
    var z = coord.r;
    var y = -x - z;
    return { x, y, z };
}
function cubeDistance(a, b) {
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}
function axialDistance(a, b) {
    return cubeDistance(axialToCube(a), axialToCube(b));
}
class MyRoom extends colyseus_1.Room {
    isValidTileKey(key) {
        return typeof key === "number"
            && Number.isInteger(key)
            && key >= 0
            && key < this.state.tiles.length;
    }
    onCreate(options) {
        this.setState(new MyRoomState_1.MyRoomState());
        this.state.name = names_1.getLocation();
        const center = { r: this.state.width / 2, q: this.state.height / 2 };
        for (let row = 0; row < this.state.height; row++) {
            for (let col = 0; col < this.state.width; col++) {
                const t = new MyRoomState_1.Tile();
                t.height = (10 - axialDistance({ r: row, q: col }, center)) / 5 + Math.random() * 0.2 - Math.random() * 0.2;
                if (t.height < 0) {
                    t.height = 0;
                    t.terrainType = 1;
                }
                else if (t.height < 0.25) {
                    t.terrainType = 2;
                }
                else {
                    t.terrainType = 0;
                }
                WorldObjects_1.buildingTypes.forEach((type, index) => {
                    if (t.building != null)
                        return;
                    if (type.terrainTypes.includes(t.terrainType)) {
                        if (Math.random() < type.probability) {
                            t.building = new MyRoomState_1.Building();
                            t.building.type = index;
                            t.building.rotation = Math.random() * Math.PI * 2;
                        }
                    }
                });
                this.state.tiles.push(t);
            }
        }
        this.onMessage("click", (client, message) => {
            if (!this.isValidTileKey(message.key))
                return;
            this.state.tiles[message.key].building = this.state.tiles[message.key].building ? null : new MyRoomState_1.Building();
        });
        this.onMessage("demolish", (client, message) => {
            if (!this.isValidTileKey(message.key))
                return;
            this.state.tiles[message.key].building = null;
        });
        this.onMessage("build", (client, message) => {
            if (!this.isValidTileKey(message.key))
                return;
            if (typeof message.type !== "number" || !Number.isInteger(message.type)
                || message.type < 0 || message.type >= WorldObjects_1.buildingTypes.length)
                return;
            const build = new MyRoomState_1.Building();
            build.type = message.type;
            this.state.tiles[message.key].building = build;
        });
        this.onMessage("changeTerrainType", (client, message) => {
            if (!this.isValidTileKey(message.key))
                return;
            if (typeof message.type !== "number" || !Number.isInteger(message.type)
                || message.type < 0 || message.type >= WorldObjects_1.terrainTypes.length)
                return;
            const tile = this.state.tiles[message.key];
            tile.terrainType = message.type;
            if (tile.building && !WorldObjects_1.buildingTypes[tile.building.type].terrainTypes.includes(tile.terrainType)) {
                tile.building = null;
            }
        });
        this.onMessage("setHeight", (client, message) => {
            if (!this.isValidTileKey(message.key))
                return;
            if (typeof message.height !== "number" || !Number.isFinite(message.height))
                return;
            const clampedHeight = Math.max(0, Math.min(2, message.height));
            this.state.tiles[message.key].height = clampedHeight;
        });
        this.onMessage("setRotation", (client, message) => {
            if (!this.isValidTileKey(message.key))
                return;
            if (typeof message.rotation !== "number" || !Number.isFinite(message.rotation))
                return;
            if (this.state.tiles[message.key].building) {
                this.state.tiles[message.key].building.rotation = message.rotation;
            }
        });
        this.onMessage("message", (client, message) => {
            if (typeof message.message !== "string")
                return;
            const MAX_MESSAGE_LENGTH = 500;
            const sanitizedMessage = message.message.slice(0, MAX_MESSAGE_LENGTH);
            if (sanitizedMessage.length === 0)
                return;
            const player = this.state.players.find(pl => pl.id == client.sessionId);
            if (player) {
                const msg = new MyRoomState_1.Message();
                msg.name = `${player.name}: `;
                msg.color = player.color;
                msg.message = sanitizedMessage;
                this.state.messages.push(msg);
                console.log(client.sessionId, player.name, "said", msg.message);
            }
        });
        this.onMessage("focus", (client, message) => {
            if (!this.isValidTileKey(message.key) && message.key !== -1)
                return;
            const player = this.state.players.find(pl => pl.id == client.sessionId);
            if (player) {
                this.state.tiles.forEach((tile, index) => {
                    const includes = tile.focusing.includes(player);
                    if (index === message.key && !includes) {
                        tile.focusing = [...tile.focusing, player];
                    }
                    else if (index !== message.key && includes) {
                        tile.focusing = tile.focusing.filter(pl => pl != player);
                    }
                });
            }
        });
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
        const newPlayer = new MyRoomState_1.Player();
        newPlayer.name = names_1.getCharacter();
        newPlayer.id = client.sessionId;
        const color = new MyRoomState_1.Color3();
        color.r = 0.5 + Math.random() * 0.5;
        color.g = 0.5 + Math.random() * 0.5;
        color.b = 0.5 + Math.random() * 0.5;
        newPlayer.color = color;
        this.state.players.push(newPlayer);
        const msg = new MyRoomState_1.Message();
        msg.name = newPlayer.name;
        msg.color = newPlayer.color;
        msg.message = " joined.";
        this.state.messages.push(msg);
    }
    onLeave(client, consented) {
        console.log(client.sessionId, "left!");
        const idx = this.state.players.findIndex(player => player.id == client.sessionId);
        if (idx == -1)
            return;
        const msg = new MyRoomState_1.Message();
        msg.name = this.state.players[idx].name;
        msg.color = this.state.players[idx].color;
        msg.message = " left.";
        this.state.messages.push(msg);
        this.state.tiles.forEach(tile => {
            tile.focusing = tile.focusing.filter(pl => pl != this.state.players[idx]);
        });
        this.state.players.deleteAt(idx);
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
exports.MyRoom = MyRoom;

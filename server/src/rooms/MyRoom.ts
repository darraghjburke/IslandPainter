import { Room, Client } from "colyseus";
import { Building, Color3, Message, MyRoomState, Player, Tile } from "./schema/MyRoomState";
import { buildingTypes, terrainTypes } from './schema/WorldObjects';
import { getCharacter, getLocation } from "../names";

interface AxialCoord {
  q: number;
  r: number;
}

interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

// thanks to RedBlobGames
const axialDirections : AxialCoord[] = [
  {r: +1, q: 0}, {r: +1, q: -1}, {r: 0, q: -1},
  {r: -1, q: 0}, {r: -1, q: +1}, {r: 0, q: +1}
]

function axialToCube(coord: AxialCoord) : CubeCoord {
    var x = coord.q;
    var z = coord.r;
    var y = -x-z;
    return {x,y,z};
}

function cubeDistance(a: CubeCoord, b: CubeCoord) {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2
}

function axialDistance(a: AxialCoord, b: AxialCoord) {
  return cubeDistance(axialToCube(a),axialToCube(b));
}

function getKeyFromAxial(coord: AxialCoord, width: number) : number {
  return width * coord.q + coord.r;
}

function setTileTerrainType(tile: Tile, type: number) {
  tile.terrainType = type;
    if (tile.building && !buildingTypes[tile.building.type].terrainTypes.includes(tile.terrainType)) {
      tile.building = null;
    }
}

function carveRiver(state: MyRoomState, startPoint: AxialCoord) {
  let riverCarve = {q: startPoint.q, r: startPoint.r};
  while(true) {
    console.log(riverCarve);
    const tile = state.tiles[getKeyFromAxial(riverCarve, state.width)];
    if (tile.terrainType == 1) break;
    setTileTerrainType(tile, 1);
    tile.height = Math.max(0, tile.height - 0.3);
    // Optional : create river banks
    // axialDirections.forEach(dir => {
    //   const bank = {r: riverCarve.r + dir.r, q: riverCarve.q + dir.q};
    //   const bankTile = this.state.tiles[getKeyFromAxial(bank, this.state.width)];
    //   if (bankTile.terrainType == 0) {
    //     setTileTerrainType(bankTile, 3);
    //     bankTile.height = tile.height + 0.05;
    //   }
    // })
    let next : AxialCoord = riverCarve;
    while(axialDistance(next, startPoint) <= axialDistance(riverCarve, startPoint)) {
      const dir = axialDirections[Math.floor(Math.random() * axialDirections.length)];
      next = {r: riverCarve.r + dir.r, q: riverCarve.q + dir.q};
    }
    riverCarve = next;
  }
}

export class MyRoom extends Room<MyRoomState> {

  private isValidTileKey(key: unknown): key is number {
    return typeof key === "number"
        && Number.isInteger(key)
        && key >= 0
        && key < this.state.tiles.length;
  }

  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.state.name = getLocation();
    const center = {r: Math.floor(this.state.width / 2), q: Math.floor(this.state.height / 2)};
    for(let row = 0; row < this.state.height; row++) {
      for(let col = 0; col < this.state.width; col++) {
        const t = new Tile();
        t.height = (10 - axialDistance({r: row, q: col}, center)) / 5 + Math.random() * 0.2 - Math.random() * 0.2;
        if (t.height < 0) {
          t.height = 0;
          t.terrainType = 1;
        } else if (t.height < 0.25) {
          t.terrainType = 2;
        }
        else {
          t.terrainType = 0;
        }
        buildingTypes.forEach((type, index) => {
          if (t.building != null) return;
          if (type.terrainTypes.includes(t.terrainType)) {
            if (Math.random() < type.probability) {
              t.building = new Building();
              t.building.type = index;
              t.building.rotation = Math.random() * Math.PI * 2;
            }
          }
        })
        this.state.tiles.push(t);
      }
    }
    for(let i = 0; i < 2; i++) {
      carveRiver(this.state, center);
      center.r++;
    }

    this.onMessage("click", (client, message) => {
      if (!this.isValidTileKey(message.key)) return;
      this.state.tiles[message.key].building = this.state.tiles[message.key].building ? null : new Building();
    })
    this.onMessage("demolish", (client, message) => {
      if (!this.isValidTileKey(message.key)) return;
      this.state.tiles[message.key].building = null;
    })
    this.onMessage("build", (client, message) => {
      if (!this.isValidTileKey(message.key)) return;
      if (typeof message.type !== "number" || !Number.isInteger(message.type)
          || message.type < 0 || message.type >= buildingTypes.length) return;
      const build = new Building();
      build.type = message.type;
      this.state.tiles[message.key].building = build;
    })
    this.onMessage("changeTerrainType", (client, message) => {
      if (!this.isValidTileKey(message.key)) return;
      if (typeof message.type !== "number" || !Number.isInteger(message.type)
          || message.type < 0 || message.type >= terrainTypes.length) return;
      setTileTerrainType(this.state.tiles[message.key], message.type);
    })
    this.onMessage("setHeight", (client, message) => {
      if (!this.isValidTileKey(message.key)) return;
      if (typeof message.height !== "number" || !Number.isFinite(message.height)) return;
      const clampedHeight = Math.max(0, Math.min(2, message.height));
      this.state.tiles[message.key].height = clampedHeight;
    })
    this.onMessage("setRotation", (client, message) => {
      if (!this.isValidTileKey(message.key)) return;
      if (typeof message.rotation !== "number" || !Number.isFinite(message.rotation)) return;
      if (this.state.tiles[message.key].building) {
        this.state.tiles[message.key].building.rotation = message.rotation;
      }
    })
    this.onMessage("message", (client, message) => {
      if (typeof message.message !== "string") return;
      const MAX_MESSAGE_LENGTH = 500;
      const sanitizedMessage = message.message.slice(0, MAX_MESSAGE_LENGTH);
      if (sanitizedMessage.length === 0) return;
      const player = this.state.players.find(pl => pl.id == client.sessionId);
      if (player) {
        const msg = new Message();
        msg.name = `${player.name}: `;
        msg.color = player.color;
        msg.message = sanitizedMessage;
        this.state.messages.push(msg);
        console.log(client.sessionId, player.name, "said", msg.message);
      }
    })
    this.onMessage("focus", (client, message) => {
      if (!this.isValidTileKey(message.key) && message.key !== -1) return;
      const player = this.state.players.find(pl => pl.id == client.sessionId);
      if (player) {
        this.state.tiles.forEach((tile, index) => {
          const includes = tile.focusing.includes(player);
          if (index === message.key && !includes) {
            tile.focusing = [...tile.focusing, player];
          } else if ( index !== message.key && includes) {
            tile.focusing = tile.focusing.filter(pl => pl != player);
          }
        })
      }
    })

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const newPlayer = new Player();
    newPlayer.name = getCharacter();
    newPlayer.id = client.sessionId;
    const color = new Color3();
    color.r = 0.5 + Math.random() * 0.5;
    color.g = 0.5 + Math.random() * 0.5;
    color.b = 0.5 + Math.random() * 0.5;
    newPlayer.color = color;
    this.state.players.push(newPlayer);
    const msg = new Message();
    msg.name = newPlayer.name;
    msg.color = newPlayer.color;
    msg.message = " joined.";
    this.state.messages.push(msg);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    const idx = this.state.players.findIndex(player => player.id == client.sessionId);
    
    if (idx == -1) return;
    const msg = new Message();
    msg.name = this.state.players[idx].name;
    msg.color = this.state.players[idx].color;
    msg.message = " left.";
    this.state.messages.push(msg);
    this.state.tiles.forEach(tile => {
      tile.focusing = tile.focusing.filter(pl => pl != this.state.players[idx]);
    })
    this.state.players.deleteAt(idx);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}

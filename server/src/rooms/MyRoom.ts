import { Room, Client } from "colyseus";
import { Building, Color3, Message, MyRoomState, Player, Tile } from "./schema/MyRoomState";
import { buildingTypes } from './schema/WorldObjects';
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


export class MyRoom extends Room<MyRoomState> {
  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.state.name = getLocation();
    const center = {r: this.state.width / 2, q: this.state.height / 2};
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

    this.onMessage("click", (client, message) => {
      console.log(message);
      this.state.tiles[message.key].building = this.state.tiles[message.key].building ? null : new Building();
    })
    this.onMessage("demolish", (client, message) => {
      this.state.tiles[message.key].building = null;
    })
    this.onMessage("build", (client, message) => {
      const build = new Building();
      build.type = message.type;
      this.state.tiles[message.key].building = build;
    })
    this.onMessage("changeTerrainType", (client, message) => {
      const tile = this.state.tiles[message.key];
      tile.terrainType = message.type;
      if (tile.building && !buildingTypes[tile.building.type].terrainTypes.includes(tile.terrainType)) {
        tile.building = null;
      }
    })
    this.onMessage("setHeight", (client, message) => {
      this.state.tiles[message.key].height = message.height;
    })
    this.onMessage("setRotation", (client, message) => {
      if (this.state.tiles[message.key].building) {
        this.state.tiles[message.key].building.rotation = message.rotation;
      }
    })
    this.onMessage("message", (client, message) => {
      const player = this.state.players.find(pl => pl.id == client.sessionId);
      if (player) {
        const msg = new Message();
        msg.name = `${player.name}: `;
        msg.color = player.color;
        msg.message = message.message;
        this.state.messages.push(msg);
        console.log(client.sessionId, player.name, "said", msg.message);
      }
    })
    this.onMessage("focus", (client, message) => {
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

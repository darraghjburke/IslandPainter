import { Schema, type, ArraySchema } from "@colyseus/schema";

export class Vector3 extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
}

export class Color3 extends Schema {
  @type("number") r: number = 0;
  @type("number") g: number = 0;
  @type("number") b: number = 0;
}

export class Player extends Schema {
  @type("string") id: string;
  @type(Color3) color: Color3;
  @type("string") name: string;
}

export class Building extends Schema {
  @type("number") type: number = 0;
  @type("number") rotation: number = 0;
}

export class Tile extends Schema {
  @type("number") terrainType: number = 0;
  @type("number") height: number = 0;
  @type(Building) building : Building = null;
}

export class Message extends Schema {
  @type("string") name: string = "";
  @type(Color3) color: Color3;
  @type("string") message : string = "";
}

export class MyRoomState extends Schema {
  @type([Player]) players = new ArraySchema<Player>();
  @type("number") width: number = 25;
  @type("number") height: number = 25;
  @type([Tile]) tiles = new ArraySchema<Tile>();
  @type("string") name: String = "";
  @type([Message]) messages = new ArraySchema<Message>();
}

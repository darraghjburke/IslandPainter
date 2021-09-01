"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoomState = exports.Message = exports.Tile = exports.Building = exports.Player = exports.Color3 = exports.Vector3 = void 0;
const schema_1 = require("@colyseus/schema");
class Vector3 extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}
__decorate([
    schema_1.type("number")
], Vector3.prototype, "x", void 0);
__decorate([
    schema_1.type("number")
], Vector3.prototype, "y", void 0);
__decorate([
    schema_1.type("number")
], Vector3.prototype, "z", void 0);
exports.Vector3 = Vector3;
class Color3 extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.r = 0;
        this.g = 0;
        this.b = 0;
    }
}
__decorate([
    schema_1.type("number")
], Color3.prototype, "r", void 0);
__decorate([
    schema_1.type("number")
], Color3.prototype, "g", void 0);
__decorate([
    schema_1.type("number")
], Color3.prototype, "b", void 0);
exports.Color3 = Color3;
class Player extends schema_1.Schema {
}
__decorate([
    schema_1.type("string")
], Player.prototype, "id", void 0);
__decorate([
    schema_1.type(Color3)
], Player.prototype, "color", void 0);
__decorate([
    schema_1.type("string")
], Player.prototype, "name", void 0);
exports.Player = Player;
class Building extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.type = 0;
        this.rotation = 0;
    }
}
__decorate([
    schema_1.type("number")
], Building.prototype, "type", void 0);
__decorate([
    schema_1.type("number")
], Building.prototype, "rotation", void 0);
exports.Building = Building;
class Tile extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.terrainType = 0;
        this.height = 0;
        this.building = null;
    }
}
__decorate([
    schema_1.type("number")
], Tile.prototype, "terrainType", void 0);
__decorate([
    schema_1.type("number")
], Tile.prototype, "height", void 0);
__decorate([
    schema_1.type(Building)
], Tile.prototype, "building", void 0);
exports.Tile = Tile;
class Message extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.name = "";
        this.message = "";
    }
}
__decorate([
    schema_1.type("string")
], Message.prototype, "name", void 0);
__decorate([
    schema_1.type(Color3)
], Message.prototype, "color", void 0);
__decorate([
    schema_1.type("string")
], Message.prototype, "message", void 0);
exports.Message = Message;
class MyRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.ArraySchema();
        this.width = 25;
        this.height = 25;
        this.tiles = new schema_1.ArraySchema();
        this.name = "";
        this.messages = new schema_1.ArraySchema();
    }
}
__decorate([
    schema_1.type([Player])
], MyRoomState.prototype, "players", void 0);
__decorate([
    schema_1.type("number")
], MyRoomState.prototype, "width", void 0);
__decorate([
    schema_1.type("number")
], MyRoomState.prototype, "height", void 0);
__decorate([
    schema_1.type([Tile])
], MyRoomState.prototype, "tiles", void 0);
__decorate([
    schema_1.type("string")
], MyRoomState.prototype, "name", void 0);
__decorate([
    schema_1.type([Message])
], MyRoomState.prototype, "messages", void 0);
exports.MyRoomState = MyRoomState;

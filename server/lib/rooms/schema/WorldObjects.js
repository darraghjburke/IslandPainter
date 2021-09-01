"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildingTypes = exports.terrainTypes = void 0;
exports.terrainTypes = [
    {
        name: "Grass",
        color: "#3F9C74",
        asset: "hex_forest"
    },
    {
        name: "Water",
        color: "#3EB2BB",
        asset: "hex_water"
    },
    {
        name: "Sand",
        color: "#B69169",
        asset: "hex_sand"
    },
    {
        name: "Dirt",
        color: "#A76F52",
        asset: "hex_rock"
    }
];
exports.buildingTypes = [
    {
        name: "Forest",
        terrainTypes: [0],
        asset: "forest1",
        probability: 0.2
    },
    {
        name: "Forest with Rock",
        terrainTypes: [0],
        asset: "forest2",
        probability: 0.2
    },
    {
        name: "Rocks",
        terrainTypes: [0, 2, 3],
        asset: "rocks_small",
        probability: 0.1
    },
    {
        name: "Mountain",
        terrainTypes: [0, 2, 3],
        asset: "mountain",
        probability: 0.02
    },
    {
        name: "House",
        terrainTypes: [0, 2],
        asset: "house",
        probability: 0.02
    },
    {
        name: "Farm",
        terrainTypes: [0],
        asset: "farm_plot",
        probability: 0.02
    },
    {
        name: "Mine",
        terrainTypes: [0, 2, 3],
        asset: "mine",
        probability: 0.01
    },
    {
        name: "Market",
        terrainTypes: [0, 2, 3],
        asset: "market",
        probability: 0.01
    },
    {
        name: "Windmill",
        terrainTypes: [0, 2, 3],
        asset: "mill",
        probability: 0.005
    },
    {
        name: "Lumbermill",
        terrainTypes: [0],
        asset: "lumbermill",
        probability: 0.01
    },
    {
        name: "Barracks",
        terrainTypes: [0, 2, 3],
        asset: "barracks",
        probability: 0.01
    },
    {
        name: "Archery Range",
        terrainTypes: [0, 2, 3],
        asset: "archeryrange",
        probability: 0.01
    },
    {
        name: "Watchtower",
        terrainTypes: [0, 2, 3],
        asset: "watchtower",
        probability: 0.01
    },
    {
        name: "Castle",
        terrainTypes: [0, 2, 3],
        asset: "castle",
        probability: 0.0005
    },
    {
        name: "Bridge",
        terrainTypes: [1],
        asset: "bridge",
        probability: 0
    }
];

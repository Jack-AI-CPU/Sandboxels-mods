// Sandboxels Custom Mod: Magic & Alchemy

// 1. Define the Mana Crystal (Solid)
elements.mana_crystal = {
    color: ["#4da6ff", "#0080ff", "#0059b3"], // Array allows randomized pixel shades
    behavior: behaviors.SOLID,               // Standard solid physics
    category: "solids",                       // Appears in the "Solids" tab
    state: "solid",
    density: 2500,
    tempHigh: 500,                            // Melting point temperature
    stateHigh: "liquid_mana",                // Turns into this when melted
    glow: true                                // Gives the element a glowing visual effect
};

// 2. Define the Liquid Mana (Liquid)
elements.liquid_mana = {
    color: "#1a8cff",
    behavior: behaviors.LIQUID,              // Standard liquid physics
    category: "liquids",
    state: "liquid",
    density: 900,                             // Lower density than water so it floats or sits on top
    viscosity: 10,                            // How fast it flows (lower is faster)
    tempLow: 100,                             // Freezing point temperature
    stateLow: "mana_crystal",                 // Hardens back into crystal
    glow: true
};

// 3. Define a Magic Reaction
// This checks if liquid mana interacts with standard gold, triggering a transmutation effect
if (!elementGrid) { var elementGrid = {}; } // Safety check for older engine versions

elements.liquid_mana.reactions = {
    "gold": { 
        elem1: "liquid_mana",                 // What happens to liquid mana
        elem2: "gold",                        // What happens to the gold it touches
        chance: 0.1,                          // 10% chance per frame of reacting
        effect: function(pixel1, pixel2) {
            // Custom script effect: transform nearby stone elements into gold!
            var neighbors = [
                [-1, 0], [1, 0], [0, -1], [0, 1]
            ];
            for (var i = 0; i < neighbors.length; i++) {
                var nx = pixel1.x + neighbors[i][0];
                var ny = pixel1.y + neighbors[i][1];
                if (isEmpty(nx, ny, true)) continue;
                var neighborPixel = pixelMap[nx][ny];
                if (neighborPixel.element === "stone") {
                    changePixel(neighborPixel, "gold");
                }
            }
        }
    }
};

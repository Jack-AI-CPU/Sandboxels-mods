// Sandboxels Custom Mod: Magic & Alchemy (Expanded)

// --- BASE ELEMENTS (From Part 1) ---
elements.mana_crystal = {
    color: ["#4da6ff", "#0080ff", "#0059b3"],
    behavior: behaviors.SOLID,
    category: "solids",
    state: "solid",
    density: 2500,
    tempHigh: 500,
    stateHigh: "liquid_mana",
    glow: true
};

elements.liquid_mana = {
    color: "#1a8cff",
    behavior: behaviors.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 900,
    viscosity: 10,
    tempLow: 100,
    stateLow: "mana_crystal",
    glow: true
};

// --- NEW EXPANSION ELEMENTS ---

// 1. The Corruption (Spreads over dirt, sand, and stone)
elements.corruption = {
    color: ["#4a0e4e", "#2a0830", "#631669"],
    behavior: behaviors.POWDER,             // Behaves like sand/dirt pile
    category: "special",
    state: "solid",
    density: 1500,
    // Tick function runs custom logic on every game frame
    tick: function(pixel) {
        // Look in all 4 cardinal directions for things to corrupt
        var neighbors = [[-1,0], [1,0], [0,-1], [0,1]];
        for (var i = 0; i < neighbors.length; i++) {
            var nx = pixel.x + neighbors[i][0];
            var ny = pixel.y + neighbors[i][1];
            if (!isEmpty(nx, ny, true)) {
                var target = pixelMap[nx][ny];
                // Consume natural ground elements and turn them into more corruption
                if (target.element === "dirt" || target.element === "sand" || target.element === "stone" || target.element === "grass") {
                    if (Math.random() < 0.05) { // 5% spread chance per frame
                        changePixel(target, "corruption");
                    }
                }
            }
        }
    }
};

// 2. Holy Water (The Cure)
elements.holy_water = {
    color: ["#e6f7ff", "#b3e6ff"],
    behavior: behaviors.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1000,
    glow: true
};

// --- NEW REACTIONS & INTERACTIONS ---

// Holy Water Cures Corruption
elements.holy_water.reactions = {
    "corruption": {
        elem1: "water",                // Holy water dilutes into normal water
        elem2: "grass",                // Corrupted soil gets purified back into life
        chance: 0.25
    }
};

// Mana Overload (Liquid Mana + Fire = Arcane Explosion)
elements.liquid_mana.reactions = {
    "gold": { 
        elem1: "liquid_mana",
        elem2: "gold",
        chance: 0.1,
        effect: function(pixel1, pixel2) {
            var neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
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
    },
    // NEW: Dangerous reaction with heat sources
    "fire": {
        elem1: "explosion",            // Creates a native Sandboxels explosion
        elem2: "plasma",               // Converts the fire into superheated plasma
        chance: 0.5
    },
    "lava": {
        elem1: "explosion",
        elem2: "basalt",               // Instantly hardens lava into volcanic rock
        chance: 0.8
    }
};

// Advanced Ants Mod for Sandboxels

// 1. Define the Ant Egg
elements.ant_egg = {
    color: "#e6e6fa",
    behavior: behaviors.POWDER, // Eggs just lay there like sand
    category: "life",
    state: "solid",
    density: 600,
    reactions: {
        // When a Worker Ant touches an egg, it hatches into a Larva!
        "ant": { elem1: "ant_larva", elem2: "ant" } 
    }
};

// 2. Define the Ant Larva
elements.ant_larva = {
    color: "#f5f5dc",
    behavior: behaviors.POWDER, // Larvae cannot crawl yet, they need to be fed
    category: "life",
    state: "solid",
    density: 550,
    reactions: {
        // If you feed the larva sugar, it grows up into a worker ant
        "sugar": { elem1: "ant", elem2: null },
        "honey": { elem1: "ant", elem2: null }
    }
};

// 3. Define the Queen Ant
elements.ant_queen = {
    color: "#4a2c00", // Darker, larger distinct brown
    behavior: behaviors.CRAWLER, // Can move around like a normal ant
    category: "life",
    state: "solid",
    density: 650,
    reactions: {
        // When the queen eats, she lays an egg instead of just duplicating!
        "sugar": { elem1: "ant_queen", elem2: "ant_egg" },
        "honey": { elem1: "ant_queen", elem2: "ant_egg" }
    }
};

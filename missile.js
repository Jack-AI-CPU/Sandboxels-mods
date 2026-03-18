// Human-Seeking Missile Mod for Sandboxels

// The missile element itself
elements.missile = {
    color: "#333333",
    behavior: behaviors.FLAT,
    category: "weapons",
    state: "solid",
    properties: {
        vx: 0,      // velocity x
        vy: 0,      // velocity y
        age: 0,     // how long the missile has been alive
        target: null, // the human target
        seekRadius: 10, // detection radius for seeking humans
        maxAge: 300, // max frames before self-destructs
        speed: 2    // movement speed per frame
    },
    tick: function(x, y) {
        // Get current missile data
        let missile = elements.getProperty(x, y, "age");
        
        // Skip if this isn't a missile (safety check)
        if (missile === undefined) return;
        
        // Age the missile
        let age = (elements.getProperty(x, y, "age") || 0) + 1;
        elements.setProperty(x, y, "age", age);
        
        // Self destruct if too old
        if (age > elements.missile.properties.maxAge) {
            elements.missile.explode(x, y);
            elements.kill(x, y);
            return;
        }
        
        // Find nearest human in detection radius
        let target = elements.missile.findNearestHuman(x, y, elements.missile.properties.seekRadius);
        
        if (target) {
            // Calculate direction to target
            let dx = target.x - x;
            let dy = target.y - y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Normalize and apply speed
                dx = (dx / distance) * elements.missile.properties.speed;
                dy = (dy / distance) * elements.missile.properties.speed;
                
                elements.setProperty(x, y, "vx", dx);
                elements.setProperty(x, y, "vy", dy);
                
                // Move the missile
                let newX = x + Math.round(dx);
                let newY = y + Math.round(dy);
                
                // Check bounds
                if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
                    // Check if we hit the target
                    if (newX === target.x && newY === target.y) {
                        elements.missile.explode(x, y);
                        elements.kill(x, y);
                        return;
                    }
                    
                    // Move to new position
                    if (elements.get(newX, newY) === null) {
                        elements.set(newX, newY, "missile", [dx, dy]);
                        elements.kill(x, y);
                    } else if (elements.get(newX, newY) !== "missile") {
                        // Hit something else - explode
                        elements.missile.explode(newX, newY);
                        elements.kill(x, y);
                    }
                } else {
                    // Out of bounds
                    elements.kill(x, y);
                }
            }
        } else {
            // No target - continue in last direction
            let vx = elements.getProperty(x, y, "vx") || 0;
            let vy = elements.getProperty(x, y, "vy") || 0;
            
            let newX = x + Math.round(vx);
            let newY = y + Math.round(vy);
            
            if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
                if (elements.get(newX, newY) === null) {
                    elements.set(newX, newY, "missile", [vx, vy]);
                    elements.kill(x, y);
                } else if (elements.get(newX, newY) !== "missile") {
                    elements.missile.explode(newX, newY);
                    elements.kill(x, y);
                }
            } else {
                elements.kill(x, y);
            }
        }
    },
    
    findNearestHuman: function(x, y, radius) {
        let nearest = null;
        let nearestDist = radius;
        
        // Search in a square around the missile
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                let checkX = x + dx;
                let checkY = y + dy;
                
                if (checkX >= 0 && checkX < WIDTH && checkY >= 0 && checkY < HEIGHT) {
                    let element = elements.get(checkX, checkY);
                    
                    // Check if it's a human (player character)
                    // This looks for any element that contains "human" or "player" in its name
                    if (element && (element.includes("human") || element === "player")) {
                        let dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearest = {x: checkX, y: checkY};
                        }
                    }
                }
            }
        }
        
        return nearest;
    },
    
    explode: function(x, y) {
        // Create explosion effect
        let explosionRadius = 4;
        let explosionElement = "fire"; // use fire as explosion effect
        
        for (let dx = -explosionRadius; dx <= explosionRadius; dx++) {
            for (let dy = -explosionRadius; dy <= explosionRadius; dy++) {
                let expX = x + dx;
                let expY = y + dy;
                
                if (expX >= 0 && expX < WIDTH && expY >= 0 && expY < HEIGHT) {
                    if (Math.random() > 0.3) { // 70% chance to spawn fire
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Only fill within radius
                        if (distance <= explosionRadius) {
                            if (elements.get(expX, expY) === null) {
                                elements.set(expX, expY, explosionElement);
                            }
                        }
                    }
                }
            }
        }
    }
};

// Missile launcher - creates missiles
elements.missileLauncher = {
    color: "#444444",
    behavior: behaviors.FLAT,
    category: "weapons",
    state: "solid",
    properties: {
        ammo: 10,      // number of missiles stored
        cooldown: 0,   // frames until next missile can be fired
        maxCooldown: 30 // frames between shots
    },
    tick: function(x, y) {
        // Decrease cooldown
        let cooldown = elements.getProperty(x, y, "cooldown") || 0;
        if (cooldown > 0) {
            elements.setProperty(x, y, "cooldown", cooldown - 1);
        }
        
        // Find nearest human
        let human = elements.missile.findNearestHuman(x, y, 12);
        
        if (human && cooldown <= 0) {
            let ammo = elements.getProperty(x, y, "ammo") || 10;
            
            if (ammo > 0) {
                // Calculate angle to human
                let dx = human.x - x;
                let dy = human.y - y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Create missile with velocity towards human
                    let vx = (dx / distance) * 2;
                    let vy = (dy / distance) * 2;
                    
                    // Find empty space around launcher to spawn missile
                    for (let offset = 1; offset <= 3; offset++) {
                        let spawnX = x + Math.round(vx) * offset;
                        let spawnY = y + Math.round(vy) * offset;
                        
                        if (spawnX >= 0 && spawnX < WIDTH && spawnY >= 0 && spawnY < HEIGHT) {
                            if (elements.get(spawnX, spawnY) === null) {
                                elements.set(spawnX, spawnY, "missile", [vx, vy]);
                                elements.setProperty(x, y, "ammo", ammo - 1);
                                elements.setProperty(x, y, "cooldown", elements.missileLauncher.properties.maxCooldown);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
};

// Missile explosion effect
elements.missileExplosion = {
    color: "#ff6600",
    behavior: behaviors.FIRE,
    category: "effects",
    state: "gas",
    properties: {
        age: 0,
        lifetime: 20
    },
    tick: function(x, y) {
        let age = (elements.getProperty(x, y, "age") || 0) + 1;
        elements.setProperty(x, y, "age", age);
        
        if (age > elements.missileExplosion.properties.lifetime) {
            elements.kill(x, y);
        }
    }
};

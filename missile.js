// 1. Tell Sandboxels to wait until everything is ready
runAfterLoad(function() {

    // 2. Put your missile factory function here
    function createMissileVariant(name, color, desc, onExplode) {
        pixelTicks[name] = function(pixel) {
            if (pixel.age === undefined) { pixel.age = 0; }
            pixel.age++;
            
            if (pixel.age > 120) {
                onExplode(pixel.x, pixel.y);
                deletePixel(pixel.x, pixel.y);
                return;
            }

            let target = null;
            let radius = 18;
            let found = false;

            for (let dx = -radius; dx <= radius && !found; dx++) {
                for (let dy = -radius; dy <= radius && !found; dy++) {
                    let cx = pixel.x + dx;
                    let cy = pixel.y + dy;
                    if (isEmpty(cx, cy, true)) continue;
                    let cp = pixelMap[cx]?.[cy];
                    if (cp && (cp.element.includes("human") || cp.element === "player")) {
                        target = { x: cx, y: cy };
                        found = true;
                    }
                }
            }

            let moveX = target ? Math.sign(target.x - pixel.x) : (pixel.vx || 0);
            let moveY = target ? Math.sign(target.y - pixel.y) : (pixel.vy || 1);
            pixel.vx = moveX;
            pixel.vy = moveY;

            let nextX = pixel.x + moveX;
            let nextY = pixel.y + moveY;

            if (outOfBounds(nextX, nextY)) {
                deletePixel(pixel.x, pixel.y);
            } else if (isEmpty(nextX, nextY)) {
                if (Math.random() < 0.3) {
                    createPixel("smoke", pixel.x, pixel.y);
                }
                movePixel(pixel, nextX, nextY);
            } else {
                let hitPixel = pixelMap[nextX][nextY];
                if (!hitPixel.element.includes("missile")) {
                    onExplode(pixel.x, pixel.y);
                    deletePixel(pixel.x, pixel.y);
                }
            }
        };

        elements[name] = {
            color: color,
            category: "weapons",
            state: "solid",
            density: 5000,
            excludeRandom: true,
            desc: desc,
            cooldown: defaultCooldown
        };
    }

    // 3. Create the missile types
    createMissileVariant("missile", "#e63946", "Standard tracking missile.", function(x, y) {
        explodeAt(x, y, 6);
    });

    createMissileVariant("missile_acid", "#4ad66d", "Melts targets upon impact.", function(x, y) {
        explodeAt(x, y, 3);
        for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
                let sx = x + dx;
                let sy = y + dy;
                if (!outOfBounds(sx, sy) && isEmpty(sx, sy) && Math.random() < 0.6) {
                    createPixel("acid", sx, sy);
                }
            }
        }
    });

    createMissileVariant("missile_emp", "#00b4d8", "Wide grid electrical surge.", function(x, y) {
        explodeAt(x, y, 2);
        for (let i = 0; i < 4; i++) {
            let lx = x + Math.floor(Math.random() * 7) - 3;
            let ly = y + Math.floor(Math.random() * 7) - 3;
            if (!outOfBounds(lx, ly)) { createPixel("lightning", lx, ly); }
        }
    });

    createMissileVariant("missile_cluster", "#ffb703", "Splits into sub-munitions.", function(x, y) {
        explodeAt(x, y, 4);
        for (let i = 0; i < 5; i++) {
            let bx = x + Math.floor(Math.random() * 5) - 2;
            let by = y - Math.floor(Math.random() * 3);
            if (!outOfBounds(bx, by) && isEmpty(bx, by)) {
                createPixel("grenade", bx, by);
                let bomb = pixelMap[bx]?.[by];
                if (bomb) {
                    bomb.vx = Math.floor(Math.random() * 5) - 2;
                    bomb.vy = -2;
                }
            }
        }
    });

    // 4. Create the launcher turret
    elements.missile_launcher = {
        color: "#457b9d",
        category: "weapons",
        state: "solid",
        density: 8000,
        desc: "Automated defense turret. Fires random missile variants.",
        tick: function(pixel) {
            if (pixel.cooldown === undefined) { pixel.cooldown = 0; }
            if (pixel.cooldown > 0) {
                pixel.cooldown--;
                return;
            }

            let radius = 22;
            let targetSpotted = false;

            for (let dx = -radius; dx <= radius && !targetSpotted; dx++) {
                for (let dy = 1; dy <= radius && !targetSpotted; dy++) {
                    let cx = pixel.x + dx;
                    let cy = pixel.y + dy;
                    if (isEmpty(cx, cy, true)) continue;
                    let p = pixelMap[cx]?.[cy];
                    if (p && (p.element.includes("human") || p.element === "player")) {
                        targetSpotted = true;
                    }
                }
            }

            if (targetSpotted && isEmpty(pixel.x, pixel.y + 1)) {
                let ammoTypes = ["missile", "missile_acid", "missile_emp", "missile_cluster"];
                let chosenAmmo = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
                
                createPixel(chosenAmmo, pixel.x, pixel.y + 1);
                let spawned = pixelMap[pixel.x][pixel.y + 1];
                if (spawned) {
                    spawned.vx = 0;
                    spawned.vy = 1;
                }
                pixel.cooldown = 35;
            }
        }
    };

    // 5. This final line tells Sandboxels: "Refresh the screen menu right now!"
    updateCategory("weapons");
});

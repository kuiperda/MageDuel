
// Main loop for the game - first get canvas and setup classes + functions

// Get the canvas for drawing purposes
const canvas = document.getElementsByClassName("canvas")[0];
const c = canvas.getContext("2d");

// hexTile class to make the game arena
class hexTile {
    // provide row + index of this tile, and x + y position on canvas
    constructor(xIdx, yIdx, zIdx, x, y) {
      this.xIdx = xIdx;
      this.yIdx = yIdx;
      this.zIdx = zIdx;
      this.x = x;
      this.y = y;

      this.thingsOnMe = [];
      this.thingsWillBeOnMe = [];
    }
  }

// hexGrid class to manage the arena and its hexTiles
class hexGrid {
    constructor() {
        this.grid = [];
        this.nextGrid = [];
    }

    // populate the hexGrid
    initializeBasicHexGrid() {
        
        let startX = 375; // center x of top left hex on canvas
        let startY = 100; // center y of top left hex on canvas
        let gridSpacing = 100; // distance between hex centers
        let gridSpacingY = 87; 

        // make each row
        for (let i = 0; i < 4; i++) {
            this.grid.push(new hexTile(-3 + i, 0 - i, 3, startX + gridSpacing * i, startY))
            }
        for (let i = 0; i < 5; i++) {
            this.grid.push(new hexTile(-3 + i, 1 - i, 2, (startX - gridSpacing / 2) + gridSpacing * i, startY + gridSpacingY))
            }
        for (let i = 0; i < 6; i++) {
            this.grid.push(new hexTile(-3 + i, 2 - i, 1, (startX - gridSpacing * 2 / 2) + gridSpacing * i, startY + gridSpacingY * 2))
            }
        for (let i = 0; i < 7; i++) {
            this.grid.push(new hexTile(-3 + i, 3 - i, 0, (startX - gridSpacing * 3 / 2) + gridSpacing * i, startY + gridSpacingY * 3))
            }
        for (let i = 0; i < 6; i++) {
            this.grid.push(new hexTile(-2 + i, 3 - i, -1, (startX - gridSpacing * 2 / 2) + gridSpacing * i, startY + gridSpacingY * 4))
            }
        for (let i = 0; i < 5; i++) {
            this.grid.push(new hexTile(-1 + i, 3 - i, -2, (startX - gridSpacing / 2) + gridSpacing * i, startY + gridSpacingY* 5))
            }
        for (let i = 0; i < 4; i++) {
            this.grid.push(new hexTile(0 + i, 3 - i, -3, startX + gridSpacing * i, startY + gridSpacingY * 6))
            }
        }

    // redraw everything
    render() {
        let tileRadius = 47; // radius of hex/circles
        let tileColor = "#A3A3A3"

        // draw the grid
        this.grid.forEach(hexTile => {
            c.beginPath();
            c.arc(hexTile.x, hexTile.y, tileRadius, 0, Math.PI*2);
            c.fillStyle = tileColor;
            c.fill();
            c.closePath();

            hexTile.thingsOnMe.forEach(thing => {
                thing.render(hexTile.x, hexTile.y);
            });
        });
    }

    // translate move inputs to actual move
    handleMove(hexTile, thing) {
        let direction = thing.nextMove;
        if(direction.lr !== null) { // user provided an left/right input
            let nextHexX = null;
            let nextHexY = null;
            let nextHexZ = null;
            if (direction.lr === "l" && direction.ud === "u") { // upLeft
                nextHexX = hexTile.xIdx - 1;
                nextHexY = hexTile.yIdx;
                nextHexZ = hexTile.zIdx + 1;
            } else if (direction.lr === "r" && direction.ud === "u") { // upRight
                nextHexX = hexTile.xIdx;
                nextHexY = hexTile.yIdx - 1;
                nextHexZ = hexTile.zIdx + 1;
            } else if (direction.lr === "r" && direction.ud === "d") { // downRight
                nextHexX = hexTile.xIdx + 1;
                nextHexY = hexTile.yIdx;
                nextHexZ = hexTile.zIdx - 1;
            } else if (direction.lr === "l" && direction.ud === "d") { // downLeft
                nextHexX = hexTile.xIdx;
                nextHexY = hexTile.yIdx + 1;
                nextHexZ = hexTile.zIdx - 1;
            } else if (direction.lr === "l") { // left
                nextHexX = hexTile.xIdx - 1;
                nextHexY = hexTile.yIdx + 1;
                nextHexZ = hexTile.zIdx;
            } else if (direction.lr === "r") { // right
                nextHexX = hexTile.xIdx + 1;
                nextHexY = hexTile.yIdx - 1;
                nextHexZ = hexTile.zIdx;
            }

            // now try to move, if location in within bounds
            let moveSuccessful = false;
            this.grid.forEach(nextHexTile => {
                if (nextHexTile.xIdx === nextHexX && nextHexTile.yIdx === nextHexY && nextHexTile.zIdx === nextHexZ) {
                    this.moveThingToHexTile(thing, hexTile, nextHexTile);
                    moveSuccessful = true;
                    return
                }
            });
            if (!moveSuccessful) { // must have tried to move out of bounds
                console.log("Attempted move for " + thing + " was out of bounds! Standing still instead.")
                hexTile.thingsWillBeOnMe.push(thing); // don't move
            }
        } else { // user didn't provide a left/right input
            console.log("No lr input detected- choose left or right for your move");
            hexTile.thingsWillBeOnMe.push(thing); // don't move
        }
        
    }

    // move a thing from one hex to another
    moveThingToHexTile(thing, previousHexTile, nextHexTile) {
        // remove from previous
        const index = previousHexTile.thingsOnMe.indexOf(thing);
        previousHexTile.thingsOnMe.splice(index, 1);
        // add to next
        nextHexTile.thingsWillBeOnMe.push(thing);
    }

}

// player class... duh
class player {
    // provide player id + shade (hex color), the hexGrid, and which hex x + y + z idx to place them on
    constructor(name, shade, hexGrid, xIdx, yIdx, zIdx) {
        this.name = name;
        this.shade = shade;

        this.nextMove = {lr: null, ud: null}; // store direction of next move

        // add player to hexGrid
        hexGrid.grid.forEach(hexTile => {
            if (hexTile.xIdx === xIdx && hexTile.yIdx === yIdx && hexTile.zIdx === zIdx) {
                hexTile.thingsOnMe.push(this);
                return
            }
        });

    }

    // draw the player on the screen
    render(x, y) {
        c.beginPath();
        c.arc(x, y, 20, 0, Math.PI*2);
        c.fillStyle = this.shade;
        c.fill();
        c.closePath();
    }

}

function keyDownHandler(event) {
    // set a move for the player, which the hexGrid will access to move them
    if (event.key === "Right" || event.key === "ArrowRight") {
        player1.nextMove.lr = 'r';
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
        player1.nextMove.lr = 'l';
    } else if (event.key === "Up" || event.key === "ArrowUp") {
        player1.nextMove.ud = 'u';
    } else if (event.key === "Down" || event.key === "ArrowDown") {
        player1.nextMove.ud = 'd';
    }
}







// Initialize everything and start the game loop

let arena = new hexGrid();
arena.initializeBasicHexGrid();

let player1 = new player("player1", "#000FFF", arena, -3, 3, 0);

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

arena.render();



// TODO: move this code into a hexGrid method which is called each 'round' 
// TODO: add turntimer and sync it with this stuff
function keyUpHandler(event) {
    // For now, do the move on spacebar
    // we'll want to change this to happen in the loop eventually.
    if (event.key === " ") {

        // handle the move for the next render by adding to thingsWillBeOnMe
        arena.grid.forEach(hexTile => {
            hexTile.thingsOnMe.forEach(thing => {
                arena.handleMove(hexTile, thing);
            });
        });

        // make next render current by moving WillBe to OnMe
        arena.grid.forEach(hexTile => {
            hexTile.thingsOnMe = hexTile.thingsWillBeOnMe;
            hexTile.thingsWillBeOnMe = [];
        });

        player1.nextMove.lr = null;
        player1.nextMove.ud = null;

        arena.render();
    }
}

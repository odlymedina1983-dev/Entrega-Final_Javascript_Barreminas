class Game{
    size;
    minesTotal;
    model;
    started;
    ended;
    minesLeft;
    constructor (size, minesTotal){
        this.size = size;
        this.minesTotal = minesTotal;
        this.model = [];
        this.started = false;
        this.ended = false;
        this.minesLeft = minesTotal;
        this.initGame();
        this.minePositionRandom();
        this.numberAssigner();
    }

    initGame(){
        this.model = [];
        let id;
        let cell;
        for (let row = 0; row < this.size; row++){
            for (let col = 0; col < this.size; col++){
                id = row * this.size + col;
                cell = {
                    row,
                    col,
                    mine:false,
                    number:0
                }
                this.model[id] = cell;
            }
        }

    }

    minePositionRandom(){
        let placed = 0;
        let totalCells = this.size * this.size;
        while (placed < this.minesTotal){
            let randomId = Math.floor(Math.random()*(totalCells));
            if (this.model[randomId].mine === false){                
                this.model[randomId].mine = true;
                placed++;
            }
        }        
    }
    numberAssigner(){
        let count = 0;
        let cell;
        let id;
        let neighborId;
        for (let row = 0; row < this.size; row++){
            for (let col = 0; col < this.size; col++){
                count = 0;
                id = row*this.size + col;
                cell = this.model[id];
                if (!cell.mine){                               
                    for (let dr = -1; dr <2;dr++){
                        for (let dc = -1; dc <2; dc++){
                            let nr = row + dr;
                            let nc = col + dc; 
                            if (dr ===0 && dc === 0) continue;
                            if (nr >= 0 && nr < this.size && nc >=0 && nc< this.size){
                                neighborId = nr*this.size + nc;
                                if (this.model[neighborId].mine === true){
                                    count++;                                    
                                }                                
                            }
                        }
                    }
                    cell.number = count;   
                }
            }
        }
    }

}

export default Game;
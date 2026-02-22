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

}

export default Game;
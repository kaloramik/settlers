function Turn(){
    this.num = 0;
    this.roll = false;
    this.startGame = false;     //true once "Start Game" is pressed
    this.diceHistory = [];
    this.pauseRoll = false;
    this.playerList = [];
    this.playersTurn = false;
    this.player;
    this.currentPlayer;
    this.playerName = "";
};

Turn.prototype.draw = function(paper) {
    this.currPlayerColor = paper.rect(50,30,40,40);
    this.diceRoll = paper.text(70,50, "").attr({"font-size": 24, "stroke": "white", "fill": "white"});
};

Turn.prototype.rollDie = function(receiveDiceVal){
    if (this.num > 0 && this.playersTurn && this.roll == false){
        if (receiveDiceVal == false){
            //roll die
            this.roll = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);
            transmitBoardUpdate({type: "roll",
                                 rolled: this.roll});
        }
        else
            this.roll = receiveDiceVal;
        this.diceHistory.push(this.roll);
        this.diceRoll.attr({"text": this.roll});

        var hexList = board.hexList;
        var vertexList = board.vertexList;
        if (this.roll == 7)
            board.thief.rolled();
        else{
            for (var i=0; i<hexList.length; i++){
                var hex = hexList[i];
                if (hex.rollNum == this.roll){
                    if (board.thief.currentHex != hex)
                        hex.rolled();
                    else
                        board.thief.flashy();
                };
            };
        };
    }
    else{
        if (!this.playersTurn)
            console.log("not your turn!")
        else if (this.num < 0)
            console.log("it is currently the setup-phase; no need to roll!")
        else if (this.roll)
            console.log("you already rolled!")
    }
};

Turn.prototype.turnComplete = function(){
    if (!this.pauseRoll){
        if (this.currentPlayer.mustBuildRoad == 0 && this.currentPlayer.mustBuildSettle == 0){
            if (this.num > 0)
                if (this.roll != false){ // for normal turn, rolling shouldn't be paused (due to robber or discard)
                    console.log("roll was " + this.roll)
                    return true;        // and the roll must have occured
                }
                else
                    console.log("you still needs to roll the die")
            else
                return true;    //for setup phase, as long as building-reqs are done, turn can be passed
        }
        else
            console.log("you must build " + this.currentPlayer.mustBuildRoad + " road and " + this.currentPlayer.mustBuildSettle + " settlement");
    }
    else
        console.log("game is waiting on thief (either move thief or discard cards)");
    return false;
}

Turn.prototype.nextTurn = function(receiveUpdate){
    if ((this.playersTurn && this.turnComplete()) || receiveUpdate){
        console.log("turn " + this.num + " ends");
        this.num++;
        this.roll = false;  //reset roll
                
        //pass the turn
        this.currentPlayer = this.getNextPlayer();
        console.log("this turn is: " + this.num);

        if (this.player != this.currentPlayer){
            this.playersTurn = false;
            board.preventDevelopment(); //player can no longer make moves
        }
        else{
            this.playersTurn = true;
            board.allowDevelopment();
        }
        this.recolorRoll();

        if (!receiveUpdate)
            transmitBoardUpdate({type: "turn", turn: this.num, playerID: this.currentPlayer.ID})
    }
    else if (!this.playersTurn)
        console.log("not your turn!");
}

Turn.prototype.recolorRoll = function(){
    //recolors the roll box and resets the dice text.
    var color = this.currentPlayer.color;
    this.currPlayerColor.attr({"fill": color})
    this.diceRoll.attr({"text": ""})
    if (color == 'blue')
        this.diceRoll.attr({"fill": "white", "stroke": "white"});
    else
        this.diceRoll.attr({"fill": "black", "stroke": "black"});
}

Turn.prototype.getNextPlayer = function(){
    if (this.num == 0){
        // setup-phase is over! start of the actual game. turn off freqDots
        this.num++;
        var hexList = board.hexList;
        for (var i=0; i<hexList.length; i++)
            hexList[i].freqDots.animate({"stroke-opacity":0, "fill-opacity":0}, 300);
    }
    if (this.num > 0)
          return this.playerList[(this.num - 1) % this.numPlayers];
    else if (this.num < 0)
        //this turn is a setup-phase turn:

//    -8-7-6-5 |-4-3-2-1  <-- turn number
// +8  0 1 2 3             (mapping for the pregame setup)
// +1           -3-2-1 0 
//-->  0 1 2 3   3 2 1 0  <-- player id

//    -6-5-4|-3-2-1  <-- turn number
// +6  0 1 2               (mapping for the pregame setup)
// +1        -2-1 0 
//-->  0 1 2  2 1 0  <-- player id
        if (this.num < -this.numPlayers)
            var nextPlayer = this.playerList[(this.num + 2 * this.numPlayers) % this.numPlayers];
        else
            var nextPlayer = this.playerList[Math.abs(this.num + 1) % this.numPlayers];
        //since we are in setup-phase, force player to build:
        nextPlayer.initialSettlement = null;
        nextPlayer.mustBuildSettle = 1;
        nextPlayer.mustBuildRoad = 1;
        console.log("current player must build 1 settlement and 1 road.")
        return nextPlayer;
}

Turn.prototype.notifyStartGame = function() {
    if (!this.startGame){
        console.log("starting game!")
        transmitBoardUpdate({type: "start"})
    }
    else
        console.log("game has already started!")
};

Turn.prototype.initializePlayers = function(data){
    this.startGame = true;

    var _this = this;
    $("#btn-roll").click(function(){_this.rollDie(false);});
    $("#btn-end").click(function(){_this.nextTurn(false);});
    $("#btn-prob").click(function(){showProb();});
    $("#btn-buy-dev").click(function(){devCard();});
    $("#printInv").click(function(){printInventory();});
    var playerData = data.playerData;
    for (i=0; i<playerData.length; i++){
        var userName = playerData[i].name;
        var newPlayer = new Player(i)
        if (userName == turn.playerName){
            this.player = newPlayer;
            console.log('you are player ' + (i+1) + ' color: ' + newPlayer.color)
        };

        this.playerList.push(newPlayer);
    }
    var hexList = board.hexList
    this.numPlayers = this.playerList.length;
    this.num = - 2 * this.numPlayers - 1; //start at 1 before the current turn, so that
    this.nextTurn(true);    // when nextTurn is called, turn.num++ finds the 1st player
}


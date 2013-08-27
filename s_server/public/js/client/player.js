//Player class
//

function Player(playerID){
    //Players (0-3)

    this.ID = playerID;
    //wood, wheat, sheep, brick, ore
    //starting resources for initial settlements and roads
    this.resourceList = [0,0,0,0,0];
    if (debug)
        this.resourceList = [20,20,20,20,20];
    //Ports              0      1    2     3     4   (3:1)
    this.ownedPorts = [false,false,false,false,false,false]
    this.color = colorSettlement(this.ID);
    this.altColor = colorSettlementAlternate(this.ID);

    // knights, victory, monopoly, road, plenty
    this.devCards = [0,0,0,0,0];
    this.mustBuildRoad = 0;
    this.mustBuildSettle = 0;
    this.initialSettlement;
    this.victoryPoints = 0;
}

Player.prototype.buildRoad = function(build){
    if (this.mustBuildRoad > 0){
        if (build)
            this.mustBuildRoad--;
        return true;        //build a free road!
    }
    if (this.resourceList[0] > 0 && this.resourceList[3] > 0){
        if (build){
            turn.currentPlayer.resourceList[0] -= 1;
            turn.currentPlayer.resourceList[3] -= 1;
            this.updateResources();
        }
        return true;
    }
    return false;
}

Player.prototype.buildSettlement = function(build){
    if (this.mustBuildSettle > 0){
        if (build){
            this.mustBuildSettle--;
            this.victoryPoints++;
        }
        return true;        //build a free settle!
    }
    if (this.resourceList[0] > 0 && this.resourceList[1] > 0 && this.resourceList[2] > 0 && this.resourceList[3] > 0){
        if (build){
            turn.currentPlayer.resourceList[0] -= 1;
            turn.currentPlayer.resourceList[1] -= 1;
            turn.currentPlayer.resourceList[2] -= 1;
            turn.currentPlayer.resourceList[3] -= 1;
            this.updateResources();
            this.victoryPoints++;
        }
        return true;
    }
    return false;
}

Player.prototype.buildCity = function(build){
    if (this.resourceList[1] > 0 && this.resourceList[2] > 0 && this.resourceList[4] > 0){
        if (build){
            board.turn.currentPlayer.resourceList[1] -= 1;
            board.turn.currentPlayer.resourceList[2] -= 1;
            board.turn.currentPlayer.resourceList[4] -= 1;
            this.updateResources();
            this.victoryPoints++;
        }
        return true;
    }
    return false;
}

Player.prototype.buyDev = function(){
    if (this.resourceList[1] > 0 && this.resourceList[2] > 0 && this.resourceList[4] > 0){
        board.turn.currentPlayer.resourceList[1] -= 1;
        board.turn.currentPlayer.resourceList[2] -= 1;
        board.turn.currentPlayer.resourceList[4] -= 1;
        this.updateResources();
        var card = board.devCardList.pop()
        this.devCards[card]++;
        console.log("Drew dev card: " + card);
        this.updateDevCards();
        var data = {
            "type": "devCard",
            "owner": turn.currentPlayer.ID,
            "devCards": turn.currentPlayer.devCards
        }
        console.log("submitting: " + data);
        transmitBoardUpdate(data);
    }
    else
        console.log("not enough resources to buy a development card!")
}

Player.prototype.updateResources = function(){
    if (turn.player == turn.currentPlayer){
        $("#wood-well").text(turn.currentPlayer.resourceList[0]);
        $("#wheat-well").text(turn.currentPlayer.resourceList[1]);
        $("#sheep-well").text(turn.currentPlayer.resourceList[2]);
        $("#brick-well").text(turn.currentPlayer.resourceList[3]);
        $("#ore-well").text(turn.currentPlayer.resourceList[4]);
        var data = {
            "type": "resources",
            "owner": turn.player.ID,
            "resourceList": turn.currentPlayer.resourceList
        }
        transmitBoardUpdate(data);
    }
}

Player.prototype.updateDevCards = function(){
    if (turn.player == turn.currentPlayer){
        $("#knight-quantity").text(turn.currentPlayer.devCards[0]);
        $("#vp-quantity").text(turn.currentPlayer.devCards[1]);
        $("#monopoly-quantity").text(turn.currentPlayer.devCards[2]);
        $("#rb-quantity").text(turn.currentPlayer.devCards[3]);
        $("#yp-quantity").text(turn.currentPlayer.devCards[4]);
    }
}

Player.prototype.steal = function(){
    //only stolen if numCards > 0
    var numCards = this.numCards();
    var stolenCardNum = Math.floor(Math.random() * numCards + 1);
    console.log("Stolen card: " + stolenCardNum + " out of " + numCards)
    for (var i=0; i<this.resourceList.length; i++){
        stolenCardNum -= this.resourceList[i];
        if (stolenCardNum <= 0){
            this.resourceList[i] -= 1;
            return i
        }
    }
}

Player.prototype.numCards = function(){
    var tot = 0;
    for (var i=0; i<this.resourceList.length; i++){
        tot += this.resourceList[i];
    }
    return tot
}



function colorSettlement(playerNum){
    if (playerNum == 0)          return 'red';
    else if (playerNum == 1)     return 'blue';
    else if (playerNum == 2)     return 'orange';
    else if (playerNum == 3)     return 'white';
}

function colorSettlementAlternate(playerNum){
    if (playerNum == 0)          return '#FF9999';
    else if (playerNum == 1)     return '#66CCFF';
    else if (playerNum == 2)     return '#FFFFCC';
    else if (playerNum == 3)     return '#888888';
}

function printInventory(){
    var resList = turn.currentPlayer.resourceList;
    console.log("Player: " + turn.currentPlayer.ID + " (" +  turn.currentPlayer.color + ")");
    console.log("resources: wood wheat sheep brick ore");
    console.log("            " + resList[0] + "     "  + resList[1] + "     " + resList[2] + "     " + resList[3] + "    " + resList[4] + " ");
    console.log("owned ports: " + turn.currentPlayer.ownedPorts);
    console.log("dev cards: " + turn.currentPlayer.devCards);
    if (turn.currentPlayer.mustBuildRoad || turn.currentPlayer.mustBuildSettlement)
        console.log("must build " + turn.currentPlayer.mustBuildRoad + " road and " + turn.currentPlayer.mustBuildSettle + " settlement");
}


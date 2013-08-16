//Player class
//

function Player(playerID){
    //Players (0-3)

    this.ID = playerID;
    this.resourceList = [0,0,0,0,0];
    //Ports              0      1    2     3     4   (3:1)
    this.ownedPorts = [false,false,false,false,false,false]
    this.color = colorSettlement(this.ID);
    this.altColor = colorSettlementAlternate(this.ID);
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

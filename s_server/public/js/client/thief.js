function Thief(hex){
    this.currentHex = hex;
}

Thief.prototype.draw = function(paper, hexRadius, interHexDist, originCoord){
    this.paper = paper;
    this.origin = this.currentHex.hexCenter;
    this.color = "grey";

    this.currentHex.hexCenter;
    var thiefRadius = hexRadius * 0.6;

    var hexCenter = this.currentHex.hexCenter;
    var hexPoints = Hex.prototype.hexPoints;
    var _this = this

    //Draw the Hexagon
    var drawHexRadius =  hexRadius - interHexDist / 2.0;
    var drawPoints = [];

    for (var i=0; i<6; i++){
        var tempX = Math.round(hexPoints[i][0] * thiefRadius + hexCenter[0]);
        var tempY = Math.round(hexPoints[i][1] * thiefRadius + hexCenter[1]);
        drawPoints.push([tempX, tempY]);
    }

    var moveString = 'M';
    for (var i=0; i<6; i++){
        if (i != 0)
            moveString += 'L';
        moveString += drawPoints[i][0] + ' ' + drawPoints[i][1];
    }

    moveString += 'Z';
    this.thiefShape = this.paper.path(moveString);
    this.thiefShape.attr({stroke: this.color, "stroke-width":10, opacity: 0.9});
}

Thief.prototype.rolled = function(){
    this.thiefShape.animate({"stroke": "black"}, 200, function(){
        this.animate({"stroke": "grey"}, 500);
    });
    turn.pauseRoll = true;
    board.preventDevelopment()

    var hexList = board.hexList;
    var _this = this;
    //Changes the robbed tile. cannot choose current tile
    for (var i=0; i<hexList.length; i++){
        if (hexList[i] != this.currentHex){
            this.allowChooseTile(hexList[i]);
        }
    }
}

Thief.prototype.allowChooseTile = function(hex){
    //turns on the event handles to allow choosing a hex tile
    var _this = this;

    hex.hoverOnHandle = function(){
        this.g = this.glow({color: "#FFF", width: 10});
    }
    hex.hoverOffHandle = function(){
        if (this.hasOwnProperty("g")){
            this.g.remove();
            delete this.g;
        }
    }
    hex.clickHandle = function(){
        _this.changeTile(hex);
    }
    hex.hoverFcn = hex.hexShape.hover(hex.hoverOnHandle, hex.hoverOffHandle)
    hex.clickFcn = hex.hexShape.click(hex.clickHandle);
}

Thief.prototype.flashy = function(){
    this.thiefShape.animate({transform: "...r120"}, 600)
}

Thief.prototype.changeTile = function(hex){
    //physically moves the Thief on the board
    var hexList = board.hexList;

    for (var i=0; i<hexList.length; i++){
        if (hexList[i] != this.currentHex){
            hexList[i].hexShape.unhover(hexList[i].hoverOnHandle);
            hexList[i].clickFcn.unclick(hexList[i].clickHandle);
        }
        else
            if (hex.hasOwnProperty("g")){
                this.g.remove();
                delete this.g;
            }
    }

    var prevHex = this.currentHex;
    var nextHex = hex;
    // this.thiefShape.attr({stroke: "grey", "stroke-width":10, opacity: 0.9});
    var x = nextHex.hexCenter[0] - prevHex.hexCenter[0];
    var y = nextHex.hexCenter[1] - prevHex.hexCenter[1];
    var pCenter = prevHex.center;
    var nCenter = nextHex.center;
    var dist = Math.sqrt(Math.pow(nCenter[0] - pCenter[0], 2) + Math.pow(nCenter[1] - pCenter[1], 2));
    var numRot = Math.round(dist / 2 );

    this.thiefShape.animate({transform: "...T" + x + "," + y + ',r' + (60 * numRot)}, dist * 150, function(){
        hex.robPlayer() 
    })
    this.currentHex = hex;

    turn.pauseRoll = false;
}
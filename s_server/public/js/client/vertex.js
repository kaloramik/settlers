//Vertex class
//

function Vertex(vertexID){
    //There are three unique Edges for each hexID (see Hex class for how the triangular coordinate system orders the Hex objects)
    //
    //Reason: unit cell is a parallelogram, and there are 2 Vertices per unit cell.
    // 
    //                /   \           /   \
    //              /       \       /       \  
    //            /           \   /           \ 
    //          |               |               |
    //          |       o---------------o       |
    //          |     /         X     /         |
    //        /   \  /        /   \  /        /   
    //      /       /       /       /       /
    //    /        /  \   /        /  \   /
    //   |        /     X         /     |
    //   |      o---------------o       |
    //   |              |               |
    //    \           /   \           /
    //      \       /       \       /
    //        \   /           \   /
    //
    //
    //          0               0               0
    //          |    [-1,-1]    |     [0,-1]    |
    //          1               1               1
    //        /   \           /   \           /   
    //      /       \       /       \       /
    //    /           \   /           \   /
    //   0              0              *0*
    //   |   [-1,0]     |     [0,0]     |    [+1,0]
    //   1              1              *1*
    //    \           /   \           /   \
    //      \       /       \       /       \
    //        \   /           \   /           \
    //          0               0               0
    //          |     [0,+1]    |    [+1,+1]    |
    //          1               1               1
    //
    // The Vertex indicies with *'s  (*0*, *1*, *2*) are mapped onto Hex([0,0])
    //

    this.ID = vertexID;
    this.color = 'black';
    this.brighterColor = 'black';
    this.adjEdges = [];
    this.adjVerticies = [];
    this.buildingType = 0;  //-1: invalid, 0: valid, x1: settlement, x2: city
    this.owner = -1;
    this.portType = -1;
    this.active = true;
//    this.startPoint = edgePoints[0];
//    this.endPoint = edgePoints[1];
//
    this.initializeVertex = function(){
        //sets this.coord and this.end, keeping radius=1, and origin=(0,0)
        var hexID = this.ID.slice(0,2);
        var vertexID = this.ID[2];
        var hexCenter = triangularToCartesian(hexID, 1);
        var hexPoints = getVerticiesOfHex(1);
        if (vertexID == 0)
            this.coord = hexPoints[1];
        if (vertexID == 1)
            this.coord = hexPoints[0];
        this.coord[0] += hexCenter[0];
        this.coord[1] += hexCenter[1];
    }

    this.initializeVertex();
}

Vertex.prototype.draw = function(paper, hexRadius, interHexDist, originCoord){
    var _this = this;
    this.paper = paper;
    this.interHexDist = interHexDist
    this.bgColor = '#20232e';
    var vertexPt = _this.coord;

    vertexPt[0] = Math.round(vertexPt[0] * hexRadius + originCoord[0]);
    vertexPt[1] = Math.round(vertexPt[1] * hexRadius + originCoord[1]);
    this.vertexPt = vertexPt;

    this.settle = this.paper.set();
    this.settle.push(this.paper.circle(vertexPt[0], vertexPt[1], this.interHexDist * 0.8));
    this.settle.attr({fill: this.bgColor, stroke: this.bgColor, opacity: 0});

    this.hoverOnHandle = function(){
        if (turn.startGame && _this.canBuild() > 0)
            _this._g = this.glow({color: "#FFF", width: 10});
    }
    this.hoverOffHandle = function(){
        if (_this.hasOwnProperty("_g")){
            _this._g.remove();
            delete _this._g;
        }
    }
    this.clickHandle = function(){
        if (turn.startGame){
            var canBuild = _this.canBuild();
            if (canBuild == 1){
                _this.buildSettlement(turn.currentPlayer, false);
            }
            else if (canBuild == 2){
                _this.buildCity(turn.currentPlayer, false);
            }
            if (canBuild > 0){
            //transmit the updates if a building has been built        
                var data = {
                    "type": "vertex",
                    "id": _this.ID,
                    "owner": turn.currentPlayer.ID,
                    "buildingType": _this.buildingType,
                    "portType": _this.portType};
                transmitBoardUpdate(data);
            }
        }
    }

    this.settle.hover(this.hoverOnHandle, this.hoverOffHandle);
    this.settle.click(this.clickHandle);
    this.toggleDevelopment = true;
        // When the mouse comes over the object //
}


// Vertex.prototype.disallowBuild = function(){
//     this.settle.unhover(this.hoverOnHandle, this.hoverOffHandle);
//     this.settle.unclick(this.clickHandle);
// };

// Vertex.prototype.allowBuild = function(){
//     this.settle.hover(this.hoverOnHandle, this.hoverOffHandle);
//     this.settle.click(this.clickHandle);
// };

Vertex.prototype.canBuild = function(){
    //returns whether a building can be built
    var currentPlayer = turn.currentPlayer;
    if (this.buildingType == 0){
        if (turn.num > 0){
            for (var i=0; i<this.adjEdges.length; i++)
                if (this.adjEdges[i].owner == currentPlayer.ID)
                    if (currentPlayer.buildSettlement(false))
                        return 1;
            }
        else if (currentPlayer.buildSettlement(false))
            return 1;
    }
    else if (this.buildingType == 1 && this.owner == currentPlayer.ID)
        if (currentPlayer.buildCity(false))
            return 2;
    return 0;
}

Vertex.prototype.buildSettlement = function(player, receiveUpdate){
    if (!receiveUpdate){
        player.buildSettlement(true);
        if (turn.num < 0) //save this vertex if in setup-phase
            player.initialSettlement = this;
        if (this.portType != -1){
            player.ownedPorts[this.portType] = true;
        }
    }

    this.owner = player.ID;
    this.buildingType++;

    for (var i=0; i<this.adjVerticies.length; i++)
        this.adjVerticies[i].buildingType = -1;

    this.color = player.color;
    this.brighterColor = player.altColor;
    this.settle.animate({fill: player.color, opacity: 1}, 200);
}

Vertex.prototype.buildCity = function(player, receiveUpdate){
    if (receiveUpdate)
        player.buildCity(true);
    this.buildingType++;
    var _this = this;
    var vertexPt = this.vertexPt;

    this.settle.animate({r: _this.interHexDist * 1.2}, 200, function(){
        _this.paper.circle(vertexPt[0], vertexPt[1], _this.interHexDist * 0.3).attr({fill: _this.bgColor, stroke: _this.bgColor, opacity: 1});

        if (_this.ID[2] == 0){
            _this.settle.push(_this.paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + vertexPt[0] + ',' + (vertexPt[1] + _this.interHexDist * 1.2) + 'z').attr({fill: _this.bgColor, stroke: _this.bgColor, "stroke-width": 1.5, opacity: 1}));
            _this.settle.push(_this.paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + (vertexPt[0] - Math.sqrt(3) / 2.0 * _this.interHexDist * 1.2) + ',' + (vertexPt[1] - _this.interHexDist * 1.2 / 2.0) + 'z').attr({fill: _this.bgColor, stroke: _this.bgColor, "stroke-width": 1.5, opacity: 1}));
            _this.settle.push(_this.paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + (vertexPt[0] + Math.sqrt(3) / 2.0 * _this.interHexDist * 1.2) + ',' + (vertexPt[1] - _this.interHexDist * 1.2 / 2.0)).attr({fill: _this.bgColor, stroke: _this.bgColor, "stroke-width": 1.5, opacity: 1}));
        }
        else{
            _this.settle.push(_this.paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + vertexPt[0] + ',' + (vertexPt[1] - _this.interHexDist * 1.2)).attr({fill: _this.bgColor, stroke: _this.bgColor, "stroke-width": 1.5, opacity: 1}));
            _this.settle.push(_this.paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + (vertexPt[0] - Math.sqrt(3) / 2.0 * _this.interHexDist * 1.2) + ',' + (vertexPt[1] + _this.interHexDist * 1.2 / 2.0)).attr({fill: _this.bgColor, stroke: _this.bgColor, "stroke-width": 1.5, opacity: 1}));
            _this.settle.push(_this.paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + (vertexPt[0] + Math.sqrt(3) / 2.0 * _this.interHexDist * 1.2) + ',' + (vertexPt[1] + _this.interHexDist * 1.2 / 2.0)).attr({fill: _this.bgColor, stroke: _this.bgColor, "stroke-width": 1.5, opacity: 1}));
        }
    });
}

Vertex.prototype.update = function(data){
    var buildingType = data.buildingType;
    var player = turn.playerList[data.owner];
    if (buildingType == 1)
        this.buildSettlement(player, true);
    if (buildingType == 2)
        this.buildCity(player, true);
}

Vertex.prototype.rolled = function(resource){
    var _this = this;

    turn.playerList[this.owner].resourceList[resource] += this.buildingType;
    turn.player.updateResources();
    console.log("player ", this.owner, " gained ", this.buildingType, " of resource ", resource)

    var anim = Raphael.animation({"fill": _this.brighterColor}, 200, function(){
        this.animate({"fill": _this.color}, 3000);
    });
    this.settle.animate(anim.delay(400));
}
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
    this.initalizeVertex = function(){
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

    this.initalizeVertex();
}

Vertex.prototype.draw = function(paper, hexRadius, interHexDist, originCoord){
    var _this = this
    var vertexPt = _this.coord;
    var bgColor = '#20232e';

    vertexPt[0] = Math.round(vertexPt[0] * hexRadius + originCoord[0]);
    vertexPt[1] = Math.round(vertexPt[1] * hexRadius + originCoord[1]);

    this.settle = paper.set();
    this.settle.push(paper.circle(vertexPt[0], vertexPt[1], interHexDist * 0.8));
    this.settle.attr({fill: bgColor, stroke: bgColor, opacity: 0});

    this.hoverOnHandle = function(){
        if (_this.canBuild() > 0)
            this.g = this.glow({color: "#FFF", width: 10});
    }
    this.hoverOffHandle = function(){
        if (this.hasOwnProperty("g")){
            this.g.remove();
            delete this.g;
        }
    }
    this.clickHandle = function(){
        var canBuild = _this.canBuild();
        var bgColor = '#20232e';
        if (canBuild == 1){
            _this.buildSettlement(paper, interHexDist, vertexPt, bgColor);
        }
        else if (canBuild == 2){
            _this.buildCity(paper, interHexDist, vertexPt, bgColor);
        }
    }

    this.settle.hover(this.hoverOnHandle, this.hoverOffHandle);
    this.settle.click(this.clickHandle);
        // When the mouse comes over the object //
}

Vertex.prototype.canBuild = function(){
    //returns whether a building can be built
    if (this.buildingType == 0){
        if (start_game){
            for (var i=0; i<this.adjEdges.length; i++)
                if (this.adjEdges[i].owner == curr_player.ID)
                    if (curr_player.buildSettlement(false))
                        return 1;
            }
        else
            if (curr_player.buildSettlement(false))
                return 1;
    }
    else if (this.buildingType == 1 && this.owner == curr_player.ID)
        if (curr_player.buildCity(false))
            return 2;
}

Vertex.prototype.buildSettlement = function(paper, interHexDist, vertexPt, bgColor){
    curr_player.buildSettlement(true);
    this.owner = curr_player.ID;
    this.buildingType++;

    if (this.portType != -1){
        curr_player.ownedPorts[this.portType] = true;
    }

    for (var i=0; i<this.adjVerticies.length; i++)
        this.adjVerticies[i].buildingType = -1;

    this.color = curr_player.color;
    this.brighterColor = curr_player.altColor;
    this.settle.animate({fill: curr_player.color, opacity: 1}, 200);
}

Vertex.prototype.buildCity = function(paper, interHexDist, vertexPt, bgColor){
    curr_player.buildCity(true);
    this.buildingType++;

    var _this = this;
    this.settle.animate({r: interHexDist * 1.2}, 200, function(){
        paper.circle(vertexPt[0], vertexPt[1], interHexDist * 0.3).attr({fill: bgColor, stroke: bgColor, opacity: 1});

        if (_this.ID[2] == 0){
            _this.settle.push(paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + vertexPt[0] + ',' + (vertexPt[1] + interHexDist * 1.2) + 'z').attr({fill: bgColor, stroke: bgColor, "stroke-width": 1.5, opacity: 1}));
            _this.settle.push(paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + (vertexPt[0] - Math.sqrt(3) / 2.0 * interHexDist * 1.2) + ',' + (vertexPt[1] - interHexDist * 1.2 / 2.0) + 'z').attr({fill: bgColor, stroke: bgColor, "stroke-width": 1.5, opacity: 1}));
            _this.settle.push(paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + (vertexPt[0] + Math.sqrt(3) / 2.0 * interHexDist * 1.2) + ',' + (vertexPt[1] - interHexDist * 1.2 / 2.0)).attr({fill: bgColor, stroke: bgColor, "stroke-width": 1.5, opacity: 1}));
        }
        else{
            _this.settle.push(paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + vertexPt[0] + ',' + (vertexPt[1] - interHexDist * 1.2)).attr({fill: bgColor, stroke: bgColor, "stroke-width": 1.5, opacity: 1}));
            _this.settle.push(paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + (vertexPt[0] - Math.sqrt(3) / 2.0 * interHexDist * 1.2) + ',' + (vertexPt[1] + interHexDist * 1.2 / 2.0)).attr({fill: bgColor, stroke: bgColor, "stroke-width": 1.5, opacity: 1}));
            _this.settle.push(paper.path('M' + vertexPt[0] + ',' + vertexPt[1] + 'L' + (vertexPt[0] + Math.sqrt(3) / 2.0 * interHexDist * 1.2) + ',' + (vertexPt[1] + interHexDist * 1.2 / 2.0)).attr({fill: bgColor, stroke: bgColor, "stroke-width": 1.5, opacity: 1}));
        }
    });
}

Vertex.prototype.rolled = function(resource){
    var _this = this;

    player_list[this.owner].resourceList[resource] += this.buildingType;
    console.log("player ", this.owner, " gained ", this.buildingType, " of resource ", resource)

    var anim = Raphael.animation({"fill": _this.brighterColor}, 200, function(){
        this.animate({"fill": _this.color}, 3000);
    });
    this.settle.animate(anim.delay(400));
}

function placeSettlement(board, paper, hexRadius, interHexDist, originCoord){
    var tempSet = paper.set();
    for (var i=0; i<board.vertexList.length; i++)
        tempSet.push(board.vertexList[i].settle)
}

function allowSettlements(vertexList, gameSetup){
//    if (gameSetup)
    var tempSet = [];
    var vertex;
    for (var i=0; i<vertexList.length; i++){
        vertex = vertexList[i];
        tempSet.push(vertex);
    }

    for (var i=0; i<tempSet.length; i++){
        vertex = tempSet[i];
        vertex.settleGlow = vertex.settle.glow({color: "#FFF", width: 10});
        vertex.settleClick = vertex.settle.click(building(vertex))
    }
}

function disallowSettlements(vertexList){
    for (var i=0; i<vertexList.length; i++){
        var vertex = vertexList[i];
        vertex.settleGlow.remove();
        //vertex.settleclick.remove();
    }
}
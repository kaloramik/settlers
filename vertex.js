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
    this.portType = false;
    this.active = true;
    this.allowSettle = [true, true, true, true, true, true];
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

Vertex.prototype.build = function(realBuild){
    var allow = 0;
    if (this.buildingType == 0){
        if (start_game){
            for (var i=0; i<this.adjEdges.length; i++)
                if (this.adjEdges[i].owner == curr_player)
                    allow = 1;
            }
        else if (this.allowSettle[curr_player]){
            allow = 1;
        }
    }
    else if (this.buildingType == 1 && this.owner == curr_player)
        allow = 2;
    if (allow > 0 && realBuild){
        this.buildingType++
        this.owner = curr_player
        for (var i=0; i<this.adjVerticies.length; i++)
            this.adjVerticies[i].buildingType = -1;
    }
    return allow
}

Vertex.prototype.draw = function(paper, hexRadius, interHexDist, originCoord){
    var _this = this
    var vertexPt = _this.coord;

    vertexPt[0] = Math.round(vertexPt[0] * hexRadius + originCoord[0]);
    vertexPt[1] = Math.round(vertexPt[1] * hexRadius + originCoord[1]);

    this.settle = paper.set();
    this.settle.push(paper.circle(vertexPt[0], vertexPt[1], interHexDist * 0.8));
    // if (this.porttype != -1)
    //     this.settle.push(paper.text(vertexpt[0], vertexpt[1],'⚓'))
    this.settle.attr({fill: 'black', opacity: 0});

    var hoverer = this.settle.hover(
        // When the mouse comes over the object //
        function(){
            var canBuild = _this.build(false)
            if (canBuild > 0)
                this.g = this.glow({color: "#FFF", width: 10});
        },
        // When the mouse goes away //
        function(){
            var canBuild = _this.build(false)
            if (canBuild > 0)
                this.g.remove();
        }); 

    this.settle.click(
        // When the mouse comes over the object //
        function(){

            var canBuild = _this.build(true)
            if (canBuild == 1){
                _this.color = colorSettlement(curr_player);
                _this.brighterColor = colorSettlementAlternate(curr_player);
                this.animate({fill: _this.color, opacity: 1}, 200);
            }
            else if (canBuild == 2){
                // hoverev.g.remove();
                // _this.settle.unhover();
                this.animate({fill: _this.color, opacity: 1, r: interHexDist * 1.2}, 200);
                _this.settle.push(paper.circle(vertexPt[0], vertexPt[1], interHexDist * 0.3).attr({fill: 'black', opacity: 1}));

                if (_this.ID[2] == 0){
                    _this.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + vertexPt[0] + ' ' + (vertexPt[1] - interHexDist * 0.3) + 'z').attr({stroke: 'black', "stroke-opacity": 1}).toFront());
                    _this.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + (vertexPt[0] - Math.sqrt(3) / 2.0 * interHexDist * 0.3) + ' ' + (vertexPt[1] - interHexDist * 0.3 / 2.0) + 'z').attr({stroke: 'black', opacity: 50}).toFront());
                    _this.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + (vertexPt[0] + Math.sqrt(3) / 2.0 * interHexDist * 0.3) + ' ' + (vertexPt[1] - interHexDist * 0.3 / 2.0)).attr({stroke: 'black', opacity: 50}).toFront());
                }
                else{
                    _this.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + vertexPt[0] + ',' + (vertexPt[1] + interHexDist * 0.3)).attr({stroke: 'black', opacity: 1}).toFront());
                    _this.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + (vertexPt[0] - Math.sqrt(3) / 2.0 * interHexDist * 0.3) + ' ' + (vertexPt[1] + interHexDist * 0.3 / 2.0)).attr({stroke: 'black', opacity: 1}).toFront());
                    _this.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + (vertexPt[0] + Math.sqrt(3) / 2.0 * interHexDist * 0.3) + ' ' + (vertexPt[1] + interHexDist * 0.3 / 2.0)).attr({stroke: 'black', opacity: 1}).toFront());
                }
            }
        });
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

function building(vertex){
            vertex.buildingType = 1;
            vertex.owner = 1;
            vertex.color = colorSettlement(1);
            vertex.settle.animate({fill: vertex.color, opacity: 1}, 200);
            //disallowSettlements(vertexList);
}


function disallowSettlements(vertexList){
    for (var i=0; i<vertexList.length; i++){
        var vertex = vertexList[i];
        vertex.settleGlow.remove();
        //vertex.settleclick.remove();
    }
}
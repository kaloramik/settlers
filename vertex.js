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
    this.edge = [];
    this.type = 0;
    this.owner = 0;
    this.active = true;
    this.allowSettle = false;
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

drawVertex = function(vertex, paper, hexRadius, interHexDist, originCoord){
    var vertexPt = vertex.coord;

    vertexPt[0] = Math.round(vertexPt[0] * hexRadius + originCoord[0]);
    vertexPt[1] = Math.round(vertexPt[1] * hexRadius + originCoord[1]);

    vertex.settle = paper.set();
    vertex.settle.push(paper.circle(vertexPt[0], vertexPt[1], interHexDist * 0.8));
    vertex.settle.attr({fill: 'black', opacity: 0});

    vertex.settle.hover(
        // When the mouse comes over the object //
        function() {
            this.g = this.glow({color: "#FFF", width: 10});
        },
        // When the mouse goes away //
        function() {
            this.g.remove();
        });
    vertex.settle.click(
        // When the mouse comes over the object //
        function() {
            if (vertex.type == 0){
                this.animate({fill: "red", opacity: 1}, 200);
                vertex.type = 1;
            }
            else if (vertex.type == 1){
                this.animate({fill: "red", opacity: 1, r: interHexDist * 1.2}, 200);
                vertex.settle.push(paper.circle(vertexPt[0], vertexPt[1], interHexDist * 0.3).attr({fill: 'black', opacity: 1}));

                if (vertex.ID[2] == 0){
                    vertex.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + vertexPt[0] + ' ' + (vertexPt[1] - interHexDist * 0.3) + 'z').attr({stroke: 'black', "stroke-opacity": 1}).toFront());
                    vertex.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + (vertexPt[0] - Math.sqrt(3) / 2.0 * interHexDist * 0.3) + ' ' + (vertexPt[1] - interHexDist * 0.3 / 2.0) + 'z').attr({stroke: 'black', opacity: 50}).toFront());
                    vertex.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + (vertexPt[0] + Math.sqrt(3) / 2.0 * interHexDist * 0.3) + ' ' + (vertexPt[1] - interHexDist * 0.3 / 2.0)).attr({stroke: 'black', opacity: 50}).toFront());
                }
                else{
                    vertex.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + vertexPt[0] + ',' + (vertexPt[1] + interHexDist * 0.3)).attr({stroke: 'black', opacity: 1}).toFront());
                    vertex.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + (vertexPt[0] - Math.sqrt(3) / 2.0 * interHexDist * 0.3) + ' ' + (vertexPt[1] + interHexDist * 0.3 / 2.0)).attr({stroke: 'black', opacity: 1}).toFront());
                    vertex.settle.push(paper.path('M' + vertexPt[0] + ' ' + vertexPt[1] + 'L' + (vertexPt[0] + Math.sqrt(3) / 2.0 * interHexDist * 0.3) + ' ' + (vertexPt[1] + interHexDist * 0.3 / 2.0)).attr({stroke: 'black', opacity: 1}).toFront());
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
            vertex.type = 1;
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



function colorSettlement(playerNum){
    if (playerNum == 0)          return '#277D09';
    else if (playerNum == 1)     return 'blue';
    else if (playerNum == 2)     return 'green';
    else if (playerNum == 3)     return 'purple';
}


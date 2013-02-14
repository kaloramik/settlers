//Edge class
//

function Edge(edgeID){
    //There are three unique Edges for each hexID (see Hex class for how the triangular coordinate system orders the Hex objects)
    //
    //Reason: unit cell is a parallelogram, and there are 3 Edges per unit cell.
    // 
    //                /   \           /   \
    //              /       \       /       \  
    //            /           \   /           \ 
    //          |               |               |
    //          |       o-------X-------o       |
    //          |     /         X     /         |
    //        /   \  /        X   X  /        /   
    //      /       X       X       X       /
    //    /        /  X   X        /  \   /
    //   |        /     X         /     |
    //   |      o-------X-------o       |
    //   |              |               |
    //    \           /   \           /
    //      \       /       \       /
    //        \   /           \   /
    //
    //
    //          |               |               |
    //          0    [-1,-1]    0     [0,-1]    0
    //          |               |               |
    //        /   \           /   \           /   
    //      1       2       1       2       1
    //    /           \   /           \   /
    //   |              |               |
    //   0   [-1,0]     0     [0,0]    *0*   [+1,0]
    //   |              |               |
    //    \           /   \           /   \
    //      2       1      *2*     *1*      2
    //        \   /           \   /           \
    //          |               |               |
    //          0     [0,+1]    0    [+1,+1]    0
    //          |               |               |
    //
    // The Edge indicies with *'s  (*0*, *1*) are mapped onto Hex([0,0])
    //

    this.ID = edgeID;

    this.buildRoad = function(playerNum){
        if (playerNum == 0)          this.color = '#277D09';
        else if (playerNum == 1)     this.color = 'blue';
        else if (playerNum == 2)     this.color = 'green';
        else if (playerNum == 3)     this.color = 'purple';
    }

    this.initalizeEdge = function(){
        this.color = 'transparent';
        this.vertex = [];
        //sets this.start and this.end, keeping radius=1, and origin=(0,0)
        var hexID = this.ID.slice(0,2);
        var edgeID = this.ID[2];
        this.hexCenter = triangularToCartesian(hexID, 1);
        var hexPoints = getVerticiesOfHex(1);
        var start = hexPoints[edgeID];
        var end = hexPoints[edgeID + 1];
        //Note: the y-axis flipped in the screen coordinates
        this.start = [start[0] + this.hexCenter[0], -start[1] + this.hexCenter[1]];
        this.end = [end[0] + this.hexCenter[0], -end[1] + this.hexCenter[1]];
    }

    this.initalizeEdge();
}

drawEdge = function(edge, paper, hexRadius, interHexDist, originCoord){
    var roadWidth = interHexDist * 0.5;
    var startPt = edge.start;
    startPt[0] = startPt[0] * hexRadius + originCoord[0];
    startPt[1] = startPt[1] * hexRadius + originCoord[1];

    var endPt = edge.end;
    endPt[0] = endPt[0] * hexRadius + originCoord[0];
    endPt[1] = endPt[1] * hexRadius + originCoord[1];

    //Leaves room for settlements
    if (edge.ID[2] == 0){
        startPt[1] += interHexDist / (Math.sqrt(3) * 2);
        endPt[1] -= interHexDist / (Math.sqrt(3) * 2);
    }
    else if (edge.ID[2] == 1){
        startPt[0] -= interHexDist / 4.0;
        startPt[1] += interHexDist / (Math.sqrt(3) * 4);
        endPt[0] += interHexDist / 4.0;
        endPt[1] -= interHexDist / (Math.sqrt(3) * 4);
    }
    else if (edge.ID[2] == 2){
        startPt[0] -= interHexDist / 4.0;
        startPt[1] -= interHexDist / (Math.sqrt(3) * 4);
        endPt[0] += interHexDist / 4.0;
        endPt[1] += interHexDist / (Math.sqrt(3) * 4);
    }

    startPt[0] = Math.round(startPt[0]);
    startPt[1] = Math.round(startPt[1]);
    endPt[0] = Math.round(endPt[0]);
    endPt[1] = Math.round(endPt[1]);

    //using Raphael - store the line in edge.path
    edge.path = paper.path('M' + startPt[0] + ',' + startPt[1] + ',L' + endPt[0] + ',' + endPt[1]);
    edge.path.attr("stroke-width", String(roadWidth));
    edge.path.attr("stroke", 'black');
    edge.path.attr("opacity", 0);
    edge.path.hover(
        // When the mouse comes over the object //
        function(){
            this.g = this.glow({color: "#FFF", width: 10});
        },
        // When the mouse goes away //
        function() {
            this.g.remove();
        });

    edge.path.click(
        // When the mouse comes over the object //
        function() {
            this.animate({stroke: "red", opacity: 100}, 200);
        });

    /* using Canvas
    ctx.beginPath();
    ctx.strokeStyle = edge.color;
    ctx.lineWidth = roadWidth; 
    ctx.moveTo(startPt[0], startPt[1]);
    ctx.lineTo(endPt[0], endPt[1]);
    ctx.closePath();
    ctx.stroke();
    */
}

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
        this.color = 'black';
        this.vertex = [];
        //sets this.start and this.end, keeping radius=1, and origin=(0,0)
        var hexID = this.ID.slice(0,2);
        var edgeID = this.ID[2];
        this.hexCenter = triangularToCartesian(hexID, 1);
        var hexPoints = getVerticiesOfHex(1);
        var start = hexPoints[edgeID];
        var end = hexPoints[edgeID + 1];
        this.start = [start[0] + this.hexCenter[0], start[1] + this.hexCenter[1]];
        this.end = [end[0] + this.hexCenter[0], end[1] + this.hexCenter[1]];
    }
    this.initalizeEdge();
}

drawEdge = function(edge, ctx, hexRadius, originCoord){
    var startPt = edge.start;
    startPt[0] = startPt[0] * hexRadius + originCoord[0];
    startPt[1] = startPt[1] * hexRadius + originCoord[1];

    var endPt = edge.end;
    endPt[0] += endPt[0] * hexRadius + originCoord[0];
    endPt[1] += endPt[1] * hexRadius + originCoord[1];

    ctx.beginPath();
    ctx.fillStyle = edge.color;
    ctx.moveTo(startPt[0], startPt[1]);
    ctx.lineTo(endPt[0], endPt[1]);
    ctx.closePath();
    ctx.stroke();
}

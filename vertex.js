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
    // The Vertex indicies with *'s  (*0*, *1*, *2*) are mapped onto Hex([0,0])
    //

    this.ID = vertexID;
    this.color = 'black';
    this.edge = [];
//    this.startPoint = edgePoints[0];
//    this.endPoint = edgePoints[1];
//
    this.initalizeVertex = function(){
        //sets this.coord and this.end, keeping radius=1, and origin=(0,0)
        var hexID = this.ID.slice(0,2);
        var vertexID = this.ID[2];
        this.coord = Array(2);
        var hexCenter = triangularToCartesian(hexID, 1);
        var hexPoints = getVerticiesOfHex(1);
        if (hexID == 0)
            this.coord[0] = hexPoints[0];
        if (hexID == 1)
            this.coord[1] = hexPoints[1];
        this.coord[0] += hexCenter[0];
        this.coord[1] += hexCenter[1];
    }

    this.buildSettlement = function(playerNum){
        if (playerNum == 0)          this.color = '#277D09';
        else if (playerNum == 1)     this.color = 'blue';
        else if (playerNum == 2)     this.color = 'green';
        else if (playerNum == 3)     this.color = 'purple';
    }
    this.initalizeVertex();
}

drawVertex = function(vertex, ctx, hexRadius, originCoord){
    var vertexPt = vertex.coord * hexRadius;
    vertexPt[0] += originCoord[0];
    vertexPt[1] += originCoord[1];

    ctx.beginPath();
    ctx.fillStyle = edge.color;
    ctx.moveTo(startPoint[0], startPoint[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.closePath();
    ctx.stroke();
}

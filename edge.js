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
    this.adjEdges = [];
    this.owner = -1;
    this.allowRoad = [false, false, false, false, false, false];

    this.initalizeEdge = function(){
        this.color = 'transparent';
        this.adjVerticies = new Array(2);
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
};

Edge.prototype.build = function(realBuild) {
    if (this.owner != -1)
        return 0;
    var adjVert1 = this.adjVerticies[0];
    var adjVert2 = this.adjVerticies[1];
    var allow = 0
    if (adjVert1.owner == curr_player || adjVert2.owner == curr_player){
        allow = 1;
    };
    if (adjVert1.owner == -1){
        for (var i=0; i<adjVert1.adjEdges.length; i++){
            if (adjVert1.adjEdges[i].owner == curr_player){
                allow = 1;
            }
        };
    };
    if (adjVert2.owner == -1){
        for (var i=0; i<adjVert2.adjEdges.length; i++){
            if (adjVert2.adjEdges[i].owner == curr_player){
                allow = 1;
            }
        };
    };
    if (realBuild && allow == 1)
        this.owner = curr_player
    return allow
};

Edge.prototype.draw = function(paper, hexRadius, interHexDist, originCoord){
    var _this = this;
    var roadWidth = interHexDist * 0.5;
    var startPt = this.start;
    startPt[0] = startPt[0] * hexRadius + originCoord[0];
    startPt[1] = startPt[1] * hexRadius + originCoord[1];

    var endPt = this.end;
    endPt[0] = endPt[0] * hexRadius + originCoord[0];
    endPt[1] = endPt[1] * hexRadius + originCoord[1];

    //Leaves room for settlements
    if (this.ID[2] == 0){
        startPt[1] += interHexDist / (Math.sqrt(3) * 2);
        endPt[1] -= interHexDist / (Math.sqrt(3) * 2);
    }
    else if (this.ID[2] == 1){
        startPt[0] -= interHexDist / 4.0;
        startPt[1] += interHexDist / (Math.sqrt(3) * 4);
        endPt[0] += interHexDist / 4.0;
        endPt[1] -= interHexDist / (Math.sqrt(3) * 4);
    }
    else if (this.ID[2] == 2){
        startPt[0] -= interHexDist / 4.0;
        startPt[1] -= interHexDist / (Math.sqrt(3) * 4);
        endPt[0] += interHexDist / 4.0;
        endPt[1] += interHexDist / (Math.sqrt(3) * 4);
    }

    startPt[0] = Math.round(startPt[0]);
    startPt[1] = Math.round(startPt[1]);
    endPt[0] = Math.round(endPt[0]);
    endPt[1] = Math.round(endPt[1]);

    //using Raphael - store the line in this.path
    this.path = paper.path('M' + startPt[0] + ',' + startPt[1] + ',L' + endPt[0] + ',' + endPt[1]);
    this.path.attr("stroke-width", String(roadWidth));
    this.path.attr("stroke", 'black');
    this.path.attr("opacity", 0);
    this.path.hover(
        // When the mouse comes over the object //
        function(){
            var canBuild = _this.build()
            if (canBuild == 1)
                this.g = this.glow({color: "#FFF", width: 10});
            else
                this.g = paper.set()
        },
        // When the mouse goes away //
        function(){
            this.g.remove();
        });

    this.path.click(
        // When the mouse comes over the object //
        function(){
            var canBuild = _this.build(true)
            if (canBuild == 1){
                var turn_color = colorSettlement(curr_player)
                this.animate({stroke: turn_color, opacity: 100}, 200);
            };
        });

    /* using Canvas
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = roadWidth; 
    ctx.moveTo(startPt[0], startPt[1]);
    ctx.lineTo(endPt[0], endPt[1]);
    ctx.closePath();
    ctx.stroke();
    */
};
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

    // if this Edge is a port, portType = resourceType
    this.portType = -1;
    // if this Edge is a port, portOrientation = direction that the port faces
    this.portOrientation = -1

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
        startPt[1] -= interHexDist / (Math.sqrt(3) * 4); endPt[0] += interHexDist / 4.0;
        endPt[1] += interHexDist / (Math.sqrt(3) * 4);
    }

    startPt[0] = Math.round(startPt[0]);
    startPt[1] = Math.round(startPt[1]);
    endPt[0] = Math.round(endPt[0]);
    endPt[1] = Math.round(endPt[1]);

    //First draw Port so they are under the roads
    if (this.portType != -1)
        this.drawPort(startPt, endPt, interHexDist)

    //using Raphael - store the line in this.path
    this.road = paper.path('M' + startPt[0] + ',' + startPt[1] + ',L' + endPt[0] + ',' + endPt[1]);
    this.road.attr("stroke-width", String(roadWidth));
    this.road.attr("stroke", 'black');
    this.road.attr("opacity", 0);

    this.hoverOnHandle = function(){
        var canBuild = _this.canBuild()
        if (canBuild > 0)
            this.g = this.glow({color: "#FFF", width: 10});
    }
    this.hoverOffHandle = function(){
        if (this.hasOwnProperty("g")){
            this.g.remove();
            delete this.g;
        }
    }
    this.clickHandle = function(){
        if (_this.canBuild())
            _this.buildRoad();
    }
    this.road.hover(this.hoverOnHandle, this.hoverOffHandle);
    this.road.click(this.clickHandle);
};

Edge.prototype.canBuild = function() {
    if (this.owner != -1)
        return false;
    var allow = false
    var adjVert1 = this.adjVerticies[0];
    var adjVert2 = this.adjVerticies[1];
    if (adjVert1.owner == curr_player.ID || adjVert2.owner == curr_player.ID){
        allow = true;
    };
    if (adjVert1.owner == -1){
        for (var i=0; i<adjVert1.adjEdges.length; i++){
            if (adjVert1.adjEdges[i].owner == curr_player.ID){
                allow = true;
            }
        };
    };
    if (adjVert2.owner == -1){
        for (var i=0; i<adjVert2.adjEdges.length; i++){
            if (adjVert2.adjEdges[i].owner == curr_player.ID){
                allow = true;
            }
        };
    };
    if (allow){
        return curr_player.buildRoad(false);
    }
    return false
};

Edge.prototype.buildRoad = function(startPt, endPt, interHexDist){
    curr_player.buildRoad(true);
    this.owner = curr_player.ID;
    this.road.animate({stroke: curr_player.color, opacity: 1}, 200);
}

Edge.prototype.drawPort = function(startPt, endPt, interHexDist){
    if (this.portType == 5)
        var color = 'black';
    else
        var color = resourceColor(this.portType);
    
    var portCenterOffset = getPortOffset(this.portOrientation, 30);
    var portEndptsOffset = getPortOffset(this.portOrientation, interHexDist/2);

    var middle = [Math.round((startPt[0] + endPt[0])/2 + portCenterOffset[0]), Math.round((startPt[1] + endPt[1])/2 + portCenterOffset[1])]
    //this.portShape = paper.path('M' + startPt[0] + ',' + startPt[1] + ',L' + endPt[0] + ',' + endPt[1]);
    startPt = [startPt[0] + Math.round(portEndptsOffset[0]), startPt[1] + Math.round(portEndptsOffset[1])]
    endPt = [endPt[0] + Math.round(portEndptsOffset[0]), endPt[1] + Math.round(portEndptsOffset[1])]
    this.portShape = paper.path('M' + startPt[0] + ',' + startPt[1] + ',S' + middle[0] + ',' + middle[1] + ',' + endPt[0] + ',' + endPt[1]);
    this.portShape.attr("stroke-width", String(interHexDist*.2));
    //this.flag = paper.path("M19.562,10.75C21.74,8.572,25.5,7,25.5,7c-8,0-8-4-16-4v10c8,0,8,4,16,4C25.5,17,21.75,14,19.562,10.75zM6.5,29h2V3h-2V29z")
    //this.portShape.attr("stroke", 'black');
    this.portShape.attr({"fill": color, "stroke": "none"});
    //this.portShape.attr("opacity", 0.3);
};


function getPortOffset(portID, scale){
    if (portID == 0) return [1 * scale, 0]
    else if (portID == 1) return [0.5 * scale, 0.8660 * scale]
    else if (portID == 2) return [-0.5 * scale, 0.8660 * scale]
    else if (portID == 3) return [-1 * scale, 0]
    else if (portID == 4) return [-0.5 * scale, -0.8660 * scale]
    else if (portID == 5) return [0.5 * scale, -0.8660 * scale]
}
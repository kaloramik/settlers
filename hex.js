
function Hex(hexID, resource){
    //
    //        _0__1__2__3__4__ x            _0__1__2__3__4__ x
    //      0 /__/__/__/__/__/           0 /00/10/20/__/__/
    //     1 /__/__/__/__/__/           1 /01/11/21/31/__/
    //    2 /__/__/__/__/__/    -->    2 /02/12/22/32/42/
    //   3 /__/__/__/__/__/           3 /__/13/23/33/43/
    //  4 /__/__/__/__/__/           4 /__/__/24/34/44/
    // y                            y
    //
    //                                               5
    //    [-1,-1]   /   \   [0,-1]                 /   \      
    //            4       5                      /       \
    //          /           \               4  /           \  0
    //        |               |              |               |  
    // [-1,0] 3     [0,0]     0 [+1,0]       |               |  
    //        |               |              |               | 
    //          \           /               3  \           /  1 
    //            2       1                      \       /   
    //     [0,+1]   \   /   [+1,+1]                \   /     
    //                                               2
    //              EDGES                         VERTICES
    //
    //19 tiles for the original game
    //4 wood //4 wheat //4 sheep //3 brick //3 ore //1 desert
    //
    this.ID = hexID;
    this.resourceType = resource;

    this.initalizeHex = function(){
        this.color = resourceColor(this.resourceType);
        this.edge = new Array(6);
        this.vertex = new Array(6);

        //sets this.coord and this.end, keeping radius=1, and origin=(0,0)
        var hexID = this.ID;
        this.center = triangularToCartesian(hexID, 1);
        this.hexPoints = getVerticiesOfHex(1);
    }

    this.buildSettlement = function(playerNum){
        if (playerNum == 0)          this.color = '#277D09';
        else if (playerNum == 1)     this.color = 'blue';
        else if (playerNum == 2)     this.color = 'green';
        else if (playerNum == 3)     this.color = 'purple';
    }
    this.initalizeHex()
}

drawHex = function(hex, ctx, hexRadius, interHexDist, originCoord){
    //ctx:          Canvas context object
    //hex:          hex object
    //hexRadius:    radius for each Hex tile 
    //interhexDist: distance bewteen two Hex tiles
    //originCoord:  the center coordinate of the [0,0] Hex tile

    var hexCenter = hex.center;
    var hexPoints = hex.hexPoints;
    var drawHexRadius =  hexRadius - interHexDist / 2.0;
    var drawPoints = []
    for (var i=0; i<6; i++){
        var tempX = hexPoints[i][0] * drawHexRadius + hexCenter[0] * hexRadius + originCoord[0];
        var tempY = hexPoints[i][1] * drawHexRadius + hexCenter[1] * hexRadius + originCoord[1];
        drawPoints.push([tempX, tempY]);
    }

    ctx.beginPath();
    ctx.fillStyle = hex.color;
    ctx.moveTo(drawPoints[5][0], drawPoints[5][1]);
    for (var i=0; i<6; i++)
        ctx.lineTo(drawPoints[i][0], drawPoints[i][1]);
    ctx.closePath();
    ctx.fill();
}

function getVerticiesOfHex(radius){
    //radius:   length of the ------
    //center:   coordinate of X
    //
    //                5
    //              /   \
    //            /       \
    //      4   /           \  0
    //        |               |
    //        |       X-------|
    //        |               |
    //      3   \           /  1
    //            \       /
    //              \   /
    //                2
    //
    //returns the coordinates of the 6 vertices
    //
    var pointList = [];
    var radian60 = Math.PI / 3.0;
    //Start at 60Degrees
    for (var i=1; i<7; i++){
        pointList.push([radius * 2.0 / Math.sqrt(3) * Math.sin(i * radian60), radius * 2.0 /  Math.sqrt(3) * Math.cos(i * radian60)]);
    }
    return pointList;
}

function resourceColor(resourceIndex){
    //converts the resource index to the corresponding color
    if (resourceIndex == 0) return '#277D09' //wood
    else if (resourceIndex == 1) return '#E37E00' //wheat
    else if (resourceIndex == 2) return '#CCFF99' //sheep
    else if (resourceIndex == 3) return '#7B090B' //brick
    else if (resourceIndex == 4) return '#6F6161' //ore
    else if (resourceIndex == 5) return '#DEC2C2' //desert
}

function triangularToCartesian(v_t, hexRadius){
    //Takes the coordinates in the triangular coordinate system and return the corresponding coordinates in the Cartesian coordinate system (screen position).
    //hexRadius = dist from center to an edge of the hex
    //interHexDist = dist between two hexagon edges
    //
    //      Triangular coordinates   Cartesian coordinates
    //         _0__1__2__3__4__ x       _0__1__2__3__4_ x
    //      0 /__/__/__/__/__/       0 |__|__|__|__|__|
    //     1 /__/__/__/__/__/        1 |__|__|__|__|__|
    //    2 /__/__/__/__/__/    -->  2 |__|__|__|__|__|
    //   3 /__/__/__/__/__/          3 |__|__|__|__|__|
    //  4 /__/__/__/__/__/           4 |__|__|__|__|__|
    // y                             y
    //
    //  input:                  v_t == vector in triangluar coordinates
    //  constructed from input: U == transformation matrix
    //  output:                 v_c == vector in cartesian
    //
    //  U * v_t = v_c
    //
    //  U = [u00, u01]    U = [xt_xc, yt_xc]
    //      [u10, u11]        [0,     yt_yc]
    //
    //triangular x coordinate projected onto the cartesian x coordinate: center to center distance between two adjacent hex tiles
    var xt_xc = hexRadius * 2;
    //triangular y coordinate projected onto the cartesian x coordinate
    var yt_xc = -(hexRadius);
    //triangular y coordinate projected onto the cartesian y coordinate
    var yt_yc = (hexRadius) * Math.sqrt(3);

    var v_c = [0,0];
    v_c[0] = v_t[0] * xt_xc + v_t[1] * yt_xc;
    v_c[1] = v_t[1] * yt_yc;
    return v_c;
}

function Hex(hexID, resource, rollNum){
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
    this.rollNum = rollNum;

    this.initalizeHex = function(){
        this.color = resourceColor(this.resourceType);
        this.brighterColor = resourceColorAlternate(this.resourceType);
        this.numberColor = numberColor(this.resourceType);
        this.edges = new Array(6);
        this.verticies = new Array(6);

        //sets this.coord and this.end, keeping radius=1, and origin=(0,0)
        var hexID = this.ID;
        this.center = triangularToCartesian(hexID, 1);
        Hex.prototype.hexPoints = getVerticiesOfHex(1);
        this.pentPoints = getVerticiesOfPent(1);
    }

    this.initalizeHex()
}

Hex.prototype.draw = function(paper, hexRadius, interHexDist, originCoord){
    //hex:          hex object
    //paper:          Raphael Paper object
    //hexRadius:    radius for each Hex tile 
    //interhexDist: distance bewteen two Hex tiles
    //originCoord:  the center coordinate of the [0,0] Hex tile

    var hexCenter = [this.center[0] * hexRadius + originCoord[0], this.center[1] * hexRadius + originCoord[1]];
    this.hexCenter = hexCenter;
    var hexPoints = Hex.prototype.hexPoints;
    var _this = this

    //Draw the Hexagon
    var drawHexRadius =  hexRadius - interHexDist / 2.0;
    var drawPoints = [];
    for (var i=0; i<6; i++){
        var tempX = Math.round(hexPoints[i][0] * drawHexRadius + hexCenter[0]);
        var tempY = Math.round(hexPoints[i][1] * drawHexRadius + hexCenter[1]);
        drawPoints.push([tempX, tempY]);
    }

    var moveString = 'M';
    for (var i=0; i<6; i++){
        if (i != 0)
            moveString += 'L';
        moveString += drawPoints[i][0] + ' ' + drawPoints[i][1];
    }
    moveString += 'Z';
    var hexElem = paper.path(moveString)
    hexElem.attr({stroke: "none", fill: this.color, opacity: 1});
    hexElem.hover(
        //Function for drawing the hex-dots on hover:
        function() {
            if (start_game && toggle_prob == 0)
                _this.freqDots.animate({"stroke-opacity":1, "fill-opacity":0.6}, 200);
        },
        function(){
            if (start_game && toggle_prob == 0)
                _this.freqDots.animate({"stroke-opacity":0, "fill-opacity":0}, 200);
        });
    this.hexShape = paper.set();
    this.hexShape.push(hexElem);

    //Draw the roll number
    if (this.rollNum != 0){
        this.number = paper.text(hexCenter[0], hexCenter[1], String(this.rollNum))
        this.number.attr({opacity: 1, fill:this.numberColor, font: '5x Helvetica, Arial'}).toFront();
        if (this.rollNum == 6 || this.rollNum == 8)
            this.number.attr({"font-size": 18});
        else
            this.number.attr({"font-size": 15});
    }

    //Hex-Dots indicating the frequency of rolls:
    this.freqDots = paper.set();

    if (this.rollNum != 0){
        var hexDotPosnRadius = drawHexRadius * 0.3
        var hexDotRadius = drawHexRadius * 0.06
        pentPoints = this.pentPoints;
        for (var i=0; i<5; i++){
            var tempX = Math.round(pentPoints[i][0] * hexDotPosnRadius + hexCenter[0]);
            var tempY = Math.round(pentPoints[i][1] * hexDotPosnRadius + hexCenter[1]);
            drawPoints.push([tempX, tempY]);
            var tempDot = paper.circle(tempX, tempY, hexDotRadius)

            if (i < 6 - Math.abs(this.rollNum - 7))
                tempDot.attr("fill", 'black');
            else
                tempDot.attr("fill", 'none');
            this.freqDots.push(tempDot);
        }

        this.freqDots.attr({"stroke-opacity":1, "fill-opacity": 0.6});
    }
}

Hex.prototype.rolled = function(){
    var _this = this;
    this.hexShape.animate({"fill": _this.brighterColor}, 200, function(){
        this.animate({"fill": _this.color}, 1200);
    });
    for (var i=0; i<this.verticies.length; i++){
        var vertex = this.verticies[i];
        if (vertex.owner != -1){
            vertex.rolled(this.resourceType)
        }
    }
}

Hex.prototype.robPlayer = function(){
    //while "waitForThief", turn off other handles on the adjVerts (ie dont let current player build.)
    //once stolen, then turn these handles back on
    var _this = this;
    console.log('robber move!')
    var waitForThief = false;
    for (var i=0; i<this.verticies.length; i++){
        var vertex = this.verticies[i];

        if (vertex.owner != -1 && player_list[vertex.owner].numCards() > 0 && vertex.owner != curr_player.ID){
            waitForThief = true;

            //allow the adjacent settlements/cities to be clicked
            vertex.onRobHoverOnHandle = function(){
                this.g = this.glow({color: "#FFF", width: 10});
            }
            vertex.onRobClickHandle = function(){
                console.log("robbed!");
                var stolen_res = player_list[vertex.owner].steal();
                curr_player.resourceList[stolen_res] += 1;
                for (var j=0; j<_this.verticies.length; j++){
                    var tempVert = _this.verticies[j];
                    tempVert.settle.unclick(tempVert.onRobClickHandle);
                    tempVert.settle.unhover(tempVert.onRobHoverOnHandle);
                    board.allowDevelopment()
                }
            }
            vertex.settle.click(vertex.onRobClickHandle)
            vertex.settle.hover(vertex.onRobHoverOnHandle);
        }
    }
    if (waitForThief == false){
        //there was nobody to rob!
        board.allowDevelopment()
    }
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

function getVerticiesOfPent(radius){
    //Same as getVerticiesofHex, but for a regular pentagon
    var pointList = [];
    var radian72 = 2 * Math.PI / 5.0;
    //Start at 60Degrees
    for (var i=0; i<5; i++){
        pointList.push([radius * Math.sin(i * radian72), -radius  * Math.cos(i * radian72)]);
    }
    return pointList;
}

function resourceColor(resourceIndex){
    //converts the resource index to the corresponding color
    if (resourceIndex == -1) return '#DEC2C2' //desert
    else if (resourceIndex == 0) return '#277D09' //wood
    else if (resourceIndex == 1) return '#E37E00' //wheat
    else if (resourceIndex == 2) return '#CCFF99' //sheep
    else if (resourceIndex == 3) return '#7B090B' //brick
    else if (resourceIndex == 4) return '#6F6161' //ore
}

function resourceColorAlternate(resourceIndex){
    //converts the resource index to the corresponding color
    if (resourceIndex == 0) return '#33FF33' //wood
    else if (resourceIndex == 1) return '#FFFF66' //wheat
    else if (resourceIndex == 2) return '#FFFFFF' //sheep
    else if (resourceIndex == 3) return '#FF3366' //brick
    else if (resourceIndex == 4) return '#C8C8C8' //ore
}

function numberColor(resourceIndex){
    //converts the resource index to the corresponding color
    if (resourceIndex == -1) return '#FFFFFF' //desert
    else if (resourceIndex == 0) return '#FFFFFF' //wood
    else if (resourceIndex == 1) return '#321c00' //wheat
    else if (resourceIndex == 2) return '#254b00' //sheep
    else if (resourceIndex == 3) return '#fcd5d6' //brick
    else if (resourceIndex == 4) return '#f2f0f0' //ore
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

function Thief(hex){
    this.currentHex = hex;
}

Thief.prototype.draw = function(paper, hexRadius, interHexDist, originCoord){
    this.origin = this.currentHex.hexCenter;
    this.color = "grey";

    this.currentHex.hexCenter;
    var thiefRadius = hexRadius * 0.6;

    var hexCenter = this.currentHex.hexCenter;
    var hexPoints = Hex.prototype.hexPoints;
    var _this = this

    //Draw the Hexagon
    var drawHexRadius =  hexRadius - interHexDist / 2.0;
    var drawPoints = [];

    for (var i=0; i<6; i++){
        var tempX = Math.round(hexPoints[i][0] * thiefRadius + hexCenter[0]);
        var tempY = Math.round(hexPoints[i][1] * thiefRadius + hexCenter[1]);
        drawPoints.push([tempX, tempY]);
    }

    var moveString = 'M';
    for (var i=0; i<6; i++){
        if (i != 0)
            moveString += 'L';
        moveString += drawPoints[i][0] + ' ' + drawPoints[i][1];
    }

    moveString += 'Z';
    this.thiefShape = paper.path(moveString);
    this.thiefShape.attr({stroke: this.color, "stroke-width":10, opacity: 0.9});

    //functionality to move Thief:
    paper.setStart();

    this.hexChoosing = paper.setFinish();
}

Thief.prototype.rolled = function(){
    this.thiefShape.animate({"stroke": "black"}, 200, function(){
        this.animate({"stroke": "grey"}, 500);
    });
    pause_roll = true;
    board.preventDevelopment()

    var hexList = board.hexList;
    var _this = this;
    //Changes the robbed tile. cannot choose current tile
    for (var i=0; i<hexList.length; i++){
        if (hexList[i] != this.currentHex){
            this.allowChooseTile(hexList[i]);
        }
    }
}

Thief.prototype.allowChooseTile = function(hex){
    //turns on the event handles to allow choosing a hex tile
    var _this = this;

    hex.hoverOnHandle = function(){
        this.g = this.glow({color: "#FFF", width: 10});
    }
    hex.hoverOffHandle = function(){
        if (this.hasOwnProperty("g")){
            this.g.remove();
            delete this.g;
        }
    }
    hex.clickHandle = function(){
        _this.changeTile(hex);
    }
    hex.hoverFcn = hex.hexShape.hover(hex.hoverOnHandle, hex.hoverOffHandle)
    hex.clickFcn = hex.hexShape.click(hex.clickHandle);
}

Thief.prototype.flashy = function(){
    this.thiefShape.animate({transform: "...r120"}, 600)
}

Thief.prototype.changeTile = function(hex){
    //physically moves the Thief on the board
    var hexList = board.hexList;

    for (var i=0; i<hexList.length; i++){
        if (hexList[i] != this.currentHex){
            hexList[i].hexShape.unhover(hexList[i].hoverOnHandle);
            hexList[i].clickFcn.unclick(hexList[i].clickHandle);
        }
        else
            if (hex.hasOwnProperty("g")){
                this.g.remove();
                delete this.g;
            }
    }

    var prevHex = this.currentHex;
    var nextHex = hex;
    // this.thiefShape.attr({stroke: "grey", "stroke-width":10, opacity: 0.9});
    var x = nextHex.hexCenter[0] - prevHex.hexCenter[0];
    var y = nextHex.hexCenter[1] - prevHex.hexCenter[1];
    var pCenter = prevHex.center;
    var nCenter = nextHex.center;
    var dist = Math.sqrt(Math.pow(nCenter[0] - pCenter[0], 2) + Math.pow(nCenter[1] - pCenter[1], 2));
    var numRot = Math.round(dist / 2 );

    this.thiefShape.animate({transform: "...T" + x + "," + y + ',r' + (60 * numRot)}, dist * 150, function(){
        hex.robPlayer() 
    })
    this.currentHex = hex;

    pause_roll = false;
}
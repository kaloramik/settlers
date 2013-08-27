//Board class
//

function Board(boardID, resourceList, rollList, portList, portResourceList, devCardList){
    //
    //        _0__1__2__3__4__ x            _0__1__2__3__4__ x
    //      0 /__/__/__/__/__/           0 /00/10/20/__/__/
    //     1 /__/__/__/__/__/           1 /01/11/21/31/__/
    //    2 /__/__/__/__/__/    -->    2 /02/12/22/32/42/
    //   3 /__/__/__/__/__/           3 /__/13/23/33/43/
    //  4 /__/__/__/__/__/           4 /__/__/24/34/44/
    // y                            y
    //
    //
    //           00  10  20
    //         01  11  21  31
    // -->   02  12  22  32  42
    //         13  23  33  43
    //           24  34  44
    //
    //boardID is the array that fully determines the geometry of the board (refer to the triangular coordinate system above
    this.boardID = boardID;
    this.resourceList = resourceList;
    this.rollList = rollList;
    this.portList = portList;
    this.portResourceList = portResourceList;
    this.devCardList = devCardList;
    this.turn = new Turn();
    

    //the radius for a single hex
    var hexRadius = 40;
    // distance inbetween hex tiles
    var interHexDist = 8;

    this.intializeBoard = function(){
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
        //              EDGES                         verticies
        //


        this.hexList = [];
        this.edgeList = [];
        this.vertexList = [];
        //The key for verticies are: (x_t, y_t, vertex_index) where vertex_index is 0 or 1 corresponding to the 0th or 1st vertex
        //hashtable in js is "associative array"; just an object where key=attr, val=attr vals
        this.edgeDict = {};
        this.vertexDict = {};      //js objects where the fields are keys and field values are values;

        //add in the rollNum=0 to correspond to the desert
        for (var i=0; i<this.resourceList.length; i++)
            if (this.resourceList[i] == -1)
                this.rollList.splice(i,0,0);

        for (var i=0; i<this.boardID.length; i++){
            //for every Hex tile in the Board, this loop will attempt to instantiate the 6
            //possible edges and verticies. Check the dictionary to see if a given edge/vertex
            // has not been instantiated yet, and then create them accordingly.
            var x = this.boardID[i][0];
            var y = this.boardID[i][1];
            var hex = new Hex(this.boardID[i], this.resourceList[i], this.rollList[i]);
            this.hexList.push(hex);

            if (this.resourceList[i] == -1)
                robbed_hex = hex;

            //add Edges and verticies to the Hex
            //edge keys are formatted:      'h{}_{}e{}'.format(hexID[0], hexID[1], edgeIndex)
            //vertex keys are formatted:    'h{}_{}v{}'.format(hexID[0], hexID[1], vertexIndex)
            //(refer to Edge and Vertex class docs for how objects are mapped to the their IDs
            var edgeIDs = [[x, y, 0],               //edge0
                           [x, y, 1],               //edge1
                           [x, y, 2],               //edge2
                           [x - 1, y, 0],           //edge3
                           [x - 1, y - 1, 1],       //edge4
                           [x, y - 1 , 2]];         //edge5

            var vertexIDs = [[x, y, 0],             //vertex0
                             [x, y, 1],             //vertex1
                             [x, y + 1, 0],         //vertex2
                             [x - 1, y, 1],         //vertex3
                             [x - 1, y, 0],         //vertex4
                             [x - 1, y - 1 , 1]];   //vertex5

            for (var j=0; j<6; j++){
                //Attempt to create Edges
                var edgeID = edgeIDs[j];
                var edgeKey = 'h' + edgeID[0] + '_' + edgeID[1] + 'e' + edgeID[2];
                if (this.edgeDict.hasOwnProperty(edgeKey))
                    hex.edges[j] = this.edgeDict[edgeKey];
                else{
                    var tempEdge = new Edge(edgeID);
                    hex.edges[j] = tempEdge;
                    this.edgeList.push(tempEdge);
                    this.edgeDict[edgeKey] = tempEdge;
                };
                //Attempt to create verticies
                var vertexID = vertexIDs[j];
                var vertexKey = 'h' + vertexID[0] + '_' + vertexID[1] + 'v' + vertexID[2];
                if (this.vertexDict.hasOwnProperty(vertexKey))
                    hex.verticies[j] = this.vertexDict[vertexKey];
                else{
                    var tempVertex = new Vertex(vertexID);
                    hex.verticies[j] = tempVertex;
                    this.vertexList.push(tempVertex);
                    this.vertexDict[vertexKey] = tempVertex;
                };
            };


            //Connect Edges to Verticies
            //Edges are simple to connect since each time we initialize a Hex object, the Verticies needed for each Edge are already known
            for (var j=0; j<6; j++){
                //adjVerticies[0] should correspond to the "0" Vertex
                //adjVerticies[1] should correspond to the "1" Vertex
                if (j % 2 == 0){
                    hex.edges[j].adjVerticies[0] = hex.verticies[j];
                    hex.edges[j].adjVerticies[1] = hex.verticies[(j+1)%6];
                }
                else{
                    hex.edges[j].adjVerticies[0] = hex.verticies[(j+1)%6];
                    hex.edges[j].adjVerticies[1] = hex.verticies[j];
                };
            };
        };


        //Connect Verticies to Edges - this needs to be done after all Verticies and Edges are established, because some Verticies don't have 3 edges and we won't know that until all Hex are placed
        //For every edge, find AdjEdges and for every vertex, find AdjVerticies
        for (var i=0; i<this.vertexList.length; i++){
            var vertex = this.vertexList[i];
            var x = vertex.ID[0];
            var y = vertex.ID[1];
            var vertexIndex = vertex.ID[2];
            // vertex index == 0  vertexIndex == 1
            //      2\ /3              1|
            //       1|               3/ \2
            var edgeIDs = []
            if (vertexIndex == 0){
                var oppositeVertexIndex = 1;
                edgeIDs.push([x, y, 0]);
                edgeIDs.push([x, y-1, 2]);
                edgeIDs.push([x, y-1, 1]);
            }
            else if (vertexIndex == 1){
                var oppositeVertexIndex = 0;
                edgeIDs.push([x, y, 0]);
                edgeIDs.push([x, y, 1]);
                edgeIDs.push([x+1, y, 2]);
            }
            for (var j=0; j<3; j++){
                var edgeID = edgeIDs[j];
                var edgeKey = 'h' + edgeID[0] + '_' + edgeID[1] + 'e' + edgeID[2];
                if (this.edgeDict.hasOwnProperty(edgeKey)){
                    var adjEdge = this.edgeDict[edgeKey];
                    vertex.adjEdges.push(adjEdge);
                    var tempVertex = adjEdge.adjVerticies[oppositeVertexIndex];
                    vertex.adjVerticies.push(tempVertex);
                };
            };
        };
        //Ports:
        for (var i=0; i<this.portList.length; i++){
            //first 3 indicies of portID are the edgeID. 4th index is the positioning of the port
            var portID = this.portList[i];
            var edgeKey = 'h' + portID[0] + '_' + portID[1] + 'e' + portID[2];
            var portEdge = this.edgeDict[edgeKey];
            portEdge.portOrientation = portID[3];
            var portResource = this.portResourceList[i];
            portEdge.portType = portResource;
            portEdge.adjVerticies[0].portType = portResource;
            portEdge.adjVerticies[1].portType = portResource;
        };
        this.thief = new Thief(robbed_hex);
    };
    this.intializeBoard();
};

Board.prototype.draw = function(paper, hexRadius, interHexDist, originCoord){
    //ctx is Canvas context
    //paper is Raphael canvas
    var hexList = this.hexList;
    var edgeList = this.edgeList;
    var vertexList = this.vertexList;

    for (var i=0; i<hexList.length; i++)
        hexList[i].draw(paper, hexRadius, interHexDist, originCoord);
    for (var i=0; i<edgeList.length; i++)
        edgeList[i].draw(paper, hexRadius, interHexDist, originCoord);
    for (var i=0; i<vertexList.length; i++)
        vertexList[i].draw(paper, hexRadius, interHexDist, originCoord);
    this.thief.draw(paper, hexRadius, interHexDist, originCoord);
    this.turn.draw(paper);
}


Board.prototype.preventDevelopment = function(){
    var edgeList = this.edgeList;
    var vertexList = this.vertexList;

    for (var i=0; i<edgeList.length; i++){
        var edge = edgeList[i];
        if (edge.toggleDevelopment){
            edge.toggleDevelopment = false;
            edge.road.unhover(edge.hoverOnHandle, edge.hoverOffHandle);
            edge.road.unclick(edge.clickHandle);
        }
    };
    for (var i=0; i<vertexList.length; i++){
        var vertex = vertexList[i];
        if (vertex.toggleDevelopment){
            vertex.toggleDevelopment = false;
            vertex.settle.unhover(vertex.hoverOnHandle);
            vertex.settle.unclick(vertex.clickHandle);
        }
    };
};

Board.prototype.allowDevelopment = function(){
    var edgeList = this.edgeList;
    var vertexList = this.vertexList;

    for (var i=0; i<edgeList.length; i++){
        var edge = edgeList[i];
        if (!edge.toggleDevelopment){
            edge.toggleDevelopment = true;
            edge.road.hover(edge.hoverOnHandle, edge.hoverOffHandle);
            edge.road.click(edge.clickHandle);
        }
    };
    for (var i=0; i<vertexList.length; i++){
        var vertex = vertexList[i];
        if (!vertex.toggleDevelopment){
            vertex.toggleDevelopment = true;
            vertex.settle.hover(vertex.hoverOnHandle);
            vertex.settle.click(vertex.clickHandle);
        }            
    };
};

// Board.prototype.updatePossibleDevelopments = function(){
//     var hexList = this.hexList;
//     var edgeList = this.edgeList;
//     for (var i=0; i<edgeList.length; i++){
//         var edge = edgeList[i];
//         if (edge.canBuild())
//             edge.allowBuild();
//         else
//             edge.disallowBuild();
//     };
//     for (var i=0; i<vertexList.length; i++){
//         var vertex = vertexList[i];
//         if (vertex.canBuild())
//             vertex.allowBuild();
//         else
//             vertex.disallowBuild();
// }

function fisherYates(myArray){
    //randomizes the elements of the array
    var i = myArray.length;
    var j, tempi, tempj;
    if (i==0) return false;
    while (--i){
        j = Math.floor(Math.random() * (i + 1));
        tempi = myArray[i];
        tempj = myArray[j];
        myArray[i] = tempj;
        myArray[j] = tempi;
    };
};

function initializeCanvas(width, height){
    //draws the map's current game state - including all road, settlement, thief placements.
    var boardElem = document.getElementById("board");
    var canvas = document.getElementById("boardCanvas");
    boardElem.appendChild(canvas);
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.translate(0, 0);
    return ctx;
}

function initializeRaphael(width, height){
    paper = Raphael(100,0,1000,800);
    return paper;
};

debug = false;
toggle_prob = 0

function showProb(){
    if (turn.startGame){
        var hexList = board.hexList;
        toggle_prob += 1;
        if (toggle_prob == 3)
            toggle_prob = 0
        if (toggle_prob == 0 || toggle_prob == 2)
            for (var i=0; i<hexList.length; i++)
                hexList[i].freqDots.animate({"stroke-opacity":0, "fill-opacity":0}, 300);
        else
            for (var i=0; i<hexList.length; i++)
                hexList[i].freqDots.animate({"stroke-opacity":1, "fill-opacity":0.6}, 300);
    }
}

function devCard(){
    if (turn.playersTurn){
        turn.player.buyDev()
    }
}

function setupBoard(boardIDList, resourceList, portList, rollList, portResourceList, devCardList, playerName){
    board = new Board(boardIDList, resourceList, rollList, portList, portResourceList, devCardList);
    turn = board.turn;
    turn.playerName = playerName;
    console.log('player name is: ' + turn.playerName);

    var gameboardDiv = $("#game-well")[0];
    paper = Raphael(gameboardDiv, 700, 550);
    paper.canvas.style.backgroundColor = '#6f799b';

    board.draw(paper, 50, 8, [250,100]);
    $("#btn-start").click(function(){turn.notifyStartGame()});
}

function init(){
    var boardID = [[0,0],[1,0],[2,0],[3,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,3],[0,2],[0,1],[1,1],[2,1],[3,2],[3,3],[2,3],[1,2],[2,2]]
    //  for original game:  
    //4 wood //4 wheat //4 sheep //3 brick //3 ore //1 desert
    var resourceList = [-1,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,4,4,4];
    var portList = [[-1,-1,1,4], [1,-1,2,5], [3,0,2,5], [4,2,0,0], [4,3,1,1], [3,4,1,1], [2,4,2,2], [0,3,0,3], [-1,1,0,3]];
    var rollList = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11];
    var portResourceList = [0,1,2,3,4,5,5,5,5]
    setupBoard(boardID, resourceList, portList, rollList, portResourceList, "");
}

// window.onload = function(){
//     init();
// }

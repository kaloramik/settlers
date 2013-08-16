//Board class
//

function Board(boardID, resourceList, rollList, portList, portResourceList){
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

        //randomize the array == randomize the tiles
        if (debug == false){
            fisherYates(this.resourceList);
            fisherYates(this.portResourceList);
        }

        this.hexList = [];
        this.edgeList = [];
        this.vertexList = [];
        //The key for verticies are: (x_t, y_t, vertex_index) where vertex_index is 0 or 1 corresponding to the 0th or 1st vertex
        //hashtable in js is "associative array"; just an object where key=attr, val=attr vals
        var edgeDict = {}
        var vertexDict = {}      //js objects where the fields are keys and field values are values;

        //add in the rollNum=0 to correspond to the desert
        for (var i=0; i<this.resourceList.length; i++)
            if (this.resourceList[i] == 0)
                this.rollList.splice(i,0,0);

        for (var i=0; i<this.boardID.length; i++){
            //for every Hex tile in the Board, this loop will attempt to instantiate the 6
            //possible edges and verticies. Check the dictionary to see if a given edge/vertex
            // has not been instantiated yet, and then create them accordingly.
            var x = this.boardID[i][0];
            var y = this.boardID[i][1];
            var hex = new Hex(this.boardID[i], this.resourceList[i], this.rollList[i]);
            this.hexList.push(hex);

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
                if (edgeDict.hasOwnProperty(edgeKey))
                    hex.edges[j] = edgeDict[edgeKey];
                else{
                    var tempEdge = new Edge(edgeID);
                    hex.edges[j] = tempEdge;
                    this.edgeList.push(tempEdge);
                    edgeDict[edgeKey] = tempEdge;
                }
                //Attempt to create verticies
                var vertexID = vertexIDs[j];
                var vertexKey = 'h' + vertexID[0] + '_' + vertexID[1] + 'v' + vertexID[2];
                if (vertexDict.hasOwnProperty(vertexKey))
                    hex.verticies[j] = vertexDict[vertexKey];
                else{
                    var tempVertex = new Vertex(vertexID);
                    hex.verticies[j] = tempVertex;
                    this.vertexList.push(tempVertex);
                    vertexDict[vertexKey] = tempVertex;
                }
            }


            //Connect Edges to Verticies
            //Edges are simple to connect since each time we initalize a Hex object, the Verticies needed for each Edge are already known
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
                }
            }
        }


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
                var oppositeVertexIndex = 1
                edgeIDs.push([x, y, 0]);
                edgeIDs.push([x, y-1, 2]);
                edgeIDs.push([x, y-1, 1]);
            }
            else if (vertexIndex == 1){
                var oppositeVertexIndex = 0
                edgeIDs.push([x, y, 0]);
                edgeIDs.push([x, y, 1]);
                edgeIDs.push([x+1, y, 2]);
            }
            for (var j=0; j<3; j++){
                var edgeID = edgeIDs[j];
                var edgeKey = 'h' + edgeID[0] + '_' + edgeID[1] + 'e' + edgeID[2];
                if (edgeDict.hasOwnProperty(edgeKey)){
                    var adjEdge = edgeDict[edgeKey];
                    vertex.adjEdges.push(adjEdge);
                    var tempVertex = adjEdge.adjVerticies[oppositeVertexIndex];
                    vertex.adjVerticies.push(tempVertex);
                }
            }

        }
        //Ports:
        for (var i=0; i<this.portList.length; i++){
            //first 3 indicies of portID are the edgeID. 4th index is the positioning of the port
            var portID = this.portList[i];
            var edgeKey = 'h' + portID[0] + '_' + portID[1] + 'e' + portID[2];
            var portEdge = edgeDict[edgeKey];
            portEdge.portOrientation = portID[3];
            var portResource = this.portResourceList[i];
            portEdge.portType = portResource;
            portEdge.adjVerticies[0].portType = portResource;
            portEdge.adjVerticies[1].portType = portResource;
        }

    }
    this.intializeBoard();

}

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
    this.drawCurrentColorBox(paper);
}

Board.prototype.drawCurrentColorBox = function(paper) {
    this.currPlayerColor = paper.rect(50,30,40,40).attr({"fill": colorSettlement(curr_player)})
    this.diceRoll = paper.text(70,50, "").attr({"font-size": 24, "stroke": "white", "fill": "white"})
};

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
    }
}

function initalizeCanvas(width, height){
    //draws the map's current game state - including all road, settlement, thief placements.
    var boardElem = document.getElementById("board");
    var canvas = document.getElementById("boardCanvas");
    boardElem.appendChild(canvas);
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.translate(0, 0);
    return ctx 
}

function initalizeRaphael(width, height){
    paper = Raphael(100,0,1000,800);
    return paper
}

num_players = 4
turn_number = 0
curr_player = 1
start_game = false
debug = true

dice_list = []
dice = 0

function rotateTurn(){
    turn_number++;
    curr_player = turn_number % 4;
    var color = colorSettlement(curr_player)
    board.currPlayerColor.attr({"fill": color})
    board.diceRoll.attr({"text": ""})
    if (color == 'blue')
        board.diceRoll.attr({"fill": "white", "stroke": "white"})
    else
        board.diceRoll.attr({"fill": "black", "stroke": "black"})
}

function animateHex(hex){
    hex.hexShape.animate({"fill": hex.brighterColor}, 200, function(){
        hex.hexShape.animate({"fill": hex.color}, 400);
    });
}

function animateVertex(vertex){
    var anim = Raphael.animation({"fill": vertex.brighterColor}, 200, function(){
        this.animate({"fill": vertex.color}, 400);
    });
    vertex.settle.animate(anim.delay(400))
}
function rollDie(){
    if (debug == false)
        dice = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);
    else
        dice = dice + 1
        dice = dice % 12
    dice_list.push(dice)
    board.diceRoll.attr({"text": dice})
    var hexList = board.hexList;
    var vertexList = board.vertexList;

    for (var i=0; i<hexList.length; i++){
        var hex = hexList[i];
        if (hex.rollNum == dice){
            animateHex(hex);
            for (var j=0; j<hex.verticies.length; j++){
                var vertex = hex.verticies[j];
                if (vertex.owner != -1){
                    animateVertex(vertex);
                }
            }
        }
    }

}

function startGame(){
    start_game = true;
    var hexList = board.hexList;
    for (var i=0; i<hexList.length; i++){
        hexList[i].freqDots.animate({"stroke-opacity":0, "fill-opacity":0}, 500);
    }
}

toggle_prob = 0
function showProb(){
    if (start_game){
        var hexList = board.hexList;
        if (toggle_prob == 0)
            toggle_prob = 1
        else
            toggle_prob = 0
        for (var i=0; i<hexList.length; i++){
            hexList[i].freqDots.animate({"stroke-opacity":toggle_prob, "fill-opacity":toggle_prob}, 300);
        }
    }
}

function gameSetup(board, paper, hexRadius, interHexDist, originCoord){
    //placeSettlement(board, paper, hexRadius, interHexDist, originCoord)
    allowSettlements(board.vertexList, true)
}

function colorSettlement(playerNum){
    if (playerNum == 0)          return 'red';
    else if (playerNum == 1)     return 'blue';
    else if (playerNum == 2)     return 'orange';
    else if (playerNum == 3)     return 'white';
}

function colorSettlementAlternate(playerNum){
    if (playerNum == 0)          return '#FF9999';
    else if (playerNum == 1)     return '#66CCFF';
    else if (playerNum == 2)     return '#FFFFCC';
    else if (playerNum == 3)     return '#888888';
}


function init(){
    var boardID = [[0,0],[1,0],[2,0],[3,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,3],[0,2],[0,1],[1,1],[2,1],[3,2],[3,3],[2,3],[1,2],[2,2]]
    //  for original game:  
    //4 wood //4 wheat //4 sheep //3 brick //3 ore //1 desert
    var resourceList = [0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,5,5,5];
    var rollList = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11];
    var portList = [[-1,-1,1,4], [1,-1,2,5], [3,0,2,5], [4,2,0,0], [4,3,1,1], [3,4,1,1], [2,4,2,2], [0,3,0,3], [-1,1,0,3]];
    var portResourceList = [0,0,0,0,1,2,3,4,5]

    board = new Board(boardID, resourceList, rollList, portList, portResourceList);
    paper = initalizeRaphael(1000, 800);
    board.draw(paper, 50, 8, [250,100]);
//    gameSetup(board, paper, 50, 8, [250,100]);
}

window.onload = function(){
    init();
}


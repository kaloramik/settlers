//Board class
//

function Board(){
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
    this.boardID = [[0,0],[1,0],[2,0],[3,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,3],[0,2],[0,1],[1,1],[2,1],[3,2],[3,3],[2,3],[1,2],[2,2]]

    //coordinate (in pixels) of the origin [0,0] of the coordinate system
    
    //  for original game:  
    //4 wood //4 wheat //4 sheep //3 brick //3 ore //1 desert
    this.resourceList = [0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,4,4,4,5];
    var rollList = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11];

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
        //              EDGES                         VERTICES
        //

        //randomize the array == randomize the tiles
        fisherYates(this.resourceList);

        this.hexList = [];
        this.edgeList = [];
        this.vertexList = [];
        //The key for verticies are: (x_t, y_t, vertex_index) where vertex_index is 0 or 1 corresponding to the 0th or 1st vertex
        //hashtable in js is "associative array"; just an object where key=attr, val=attr vals
        var edgeDict = {}
        var vertexDict = {}      //js objects where the fields are keys and field values are values;

        for (var i=0; i<this.boardID.length; i++){
            var x = this.boardID[i][0];
            var y = this.boardID[i][1];
            hex = new Hex(this.boardID[i], this.resourceList[i]);
            this.hexList.push(hex);

            //add Edges and Vertices to the Hex
            //edge keys are formatted:      'h{}_{}e{}'.format(hexID[0], hexID[1], edgeIndex)
            //vertex keys are formatted:    'h{}_{}v{}'.format(hexID[0], hexID[1], vertexIndex)
            //(refer to Edge and Vertex class docs for how objects are mapped to the their IDs
            var edgeIDs = [[x, y, 0],               //edge0
                           [x, y, 1],               //edge1
                           [x, y, 2],               //edge2
                           [x - 1, y, 0],           //edge3
                           [x - 1, y - 1, 1],       //edge4
                           [x - 1, y - 1 , 0]];     //edge5

            var vertexIDs = [[x, y, 0],             //vertex0
                             [x, y, 1],             //vertex1
                             [x, y + 1, 0],         //vertex2
                             [x - 1, y, 1],         //vertex3
                             [x - 1, y, 0],         //vertex4
                             [x - 1, y - 1 , 1]];   //vertex5

            for (var j=0; j<6; j++){
                //Edges
                var edgeID = edgeIDs[j];
                var edgeKey = 'h' + edgeID[0] + '_' + edgeID[1] + 'e' + edgeID[2];
                if (edgeDict.hasOwnProperty(edgeKey))
                    hex.edge[j] = edgeDict[edgeKey];
                else{
                    var tempEdge = new Edge(edgeID);
                    hex.edge[j] = tempEdge;
                    this.edgeList.push(tempEdge);
                    edgeDict[edgeKey] = tempEdge;
                }
                //Vertices
                var vertexID = vertexIDs[j];
                var vertexKey = 'h' + vertexID[0] + '_' + vertexID[1] + 'v' + vertexID[2];
                if (vertexDict.hasOwnProperty(vertexKey))
                    hex.vertex[j] = edgeDict[vertexKey];
                else{
                    var tempVertex = new Vertex(vertexID);
                    hex.vertex[j] = tempVertex;
                    this.vertexList.push(tempVertex);
                    vertexDict[vertexKey] = tempVertex;
                }
            }

            //Connect Edges to Verticies
            //Edges are simple to connect since each time we initalize a Hex object, the Verticies needed for each Edge are already known
            for (var j=0; j<6; j++){
                var edgeID = edgeIDs[j];
                var edgeKey = 'h' + edgeID[0] + '_' + edgeID[1] + 'e' + edgeID[2];
                edgeDict[edgeKey].vertex[0] = vertexDict[vertexIDs[j]]
                edgeDict[edgeKey].vertex[1] = vertexDict[vertexIDs[j+1]]
            }
        }

        //Connect Verticies to Edges - this needs to be done after all Verticies and Edges are established, because some Verticies don't have 3 edges and we won't know that until all Hex are placed
        for (var i=0; i<this.vertexList.length; i++){
            var tempVertex = this.vertexList[i];
            var x = tempVertex.ID[0];
            var y = tempVertex.ID[1];
            var vertexIndex = tempVertex.ID[2];
            // vertex index == 0  vertexIndex == 1
            //      2\ /3              1|
            //       1|               3/ \2
            var edgeIDs = []
            if (vertexIndex == 0){
                edgeIDs.push([x, y, 0]);
                edgeIDs.push([x, y-1, 2]);
                edgeIDs.push([x, y-1, 1]);
            }
            if (vertexIndex == 1){
                edgeIDs.push([x, y, 0]);
                edgeIDs.push([x, y, 1]);
                edgeIDs.push([x+1, y, 2]);
            }
            for (var j=0; i<3; i++){
                var edgeID = edgeIDs[i];
                var edgeKey = 'h' + edgeID[0] + '_' + edgeID[1] + 'e' + edgeID[2];
                if (edgeDict.hasOwnProperty(edgeKey))
                    tempVertex.edge.push(edgeDict[edgeKey])
            }
        }
    }
    this.intializeBoard();
}


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
    return canvas.getContext("2d");
}

function drawBoard(board, ctx, hexRadius, interHexDist, originCoord){
    var hexList = board.hexList;
    var edgeList = board.edgeList;
    edgeList[0].buildRoad(0);
    edgeList[1].buildRoad(1);
    for (var i=0; i<hexList.length; i++)
        drawHex(hexList[i], ctx, hexRadius, interHexDist, originCoord);
    for (var i=0; i<edgeList.length; i++)
        drawEdge(edgeList[i], ctx, hexRadius, originCoord);
}

function init(){
    var map = new Board();
    ctx = initalizeCanvas(1000, 800);
    drawBoard(map, ctx, 50, 5, [200,100]);
}

window.onload = function(){
    init();
}

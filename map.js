//map class
//

function Map(mapCenter, resourceList){
    //coordCenter   the coordinates for the center of the map
    //19 tiles for the original game
    //4 wood //4 wheat //4 sheep //3 brick //3 ore //1 desert
    //   
    //     0   1   2
    //   3   4   5   6
    // 7   8   9  10  11
    //  12  13  14  15
    //    16  17  18
    //    
    //    map needs to know the center of the map (hex 9)
    this.mapCenter = mapCenter;


    var numTiles = 19;
    //the radius for a single hex
    var hexRadius = 40;
    // distance inbetween hex tiles
    var interHexDist = 10;

    var boardElem = document.getElementById("board");
	var canvas = document.createElement('canvas');
    boardElem.appendChild(canvas);
    canvas.width = 700;
    canvas.height = 400;
    var ctx = canvas.getContext("2d");

    //if resourceList is not passed, then initialize normally
    if (typeof resourceList == 'undefined')
        this.hexList = intializeHex(hexRadius, interHexDist, ctx, mapCenter);
    else
        this.hexList = createHex(hexRadius, interHexDist, ctx, mapCenter, resourceList);
}

function intializeHex(hexRadius, interHexDist, ctx, mapCenter){
    //intializes the map for the server - including randomizing the resources
    var hexList = [];
    var hexPosn;
    var resourceList = [0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,4,4,4,5];
    //generate random tile type
    fisherYates(resourceList);

    for (var i=0; i<resourceList.length; i++){
        //generate tile
        hexPosn = posnToCoord(i, hexRadius, interHexDist, mapCenter)
        hexList.push(new Hex(resourceList[i], i, hexPosn, ctx, hexRadius, interHexDist));
    }

    return hexList;
}

function createHex(hexRadius, interHexDist, ctx, mapCenter, resourceList){
    //recreates the Hexes given the 
    var hexList = [];
    var hexPosn;
    //generate random tile type
    fisherYates(resourceList);

    for (var i=0; i<resourceList.length; i++){
        //generate tile
        hexPosn = posnToCoord(i, hexRadius, interHexDist, mapCenter)
        hexList.push(new Hex(resourceList[i], i, hexPosn, ctx, hexRadius, interHexDist));
    }

    return hexList;
}

function posnToCoord(position, hexRadius, interHexDist, originCoord){
    //TRIANGLE LATTICE is the dual of the HEXAGON LATTICE! use triangle lattice to determine the locations of the hex grid
    //takes a hex's position and converts it to the hex's center coordinate
    //First, map each position index[0:18] into a tuple (x', y') where x' is the number of triangle RADII to traverse away from the center in the x direction, and y' is the number of traingle HEIGHT to traverse away from the center in the y direction

    var xPrime, yPrime;
    if (position <= 2)  yPrime = -2;
    else if (position <=6) yPrime = -1;
    else if (position <=11) yPrime = 0;
    else if (position <=15) yPrime = 1;
    else yPrime = 2;

    if (position == 7) xPrime = -4;
    else if (position == 3 || position == 12) xPrime = -3;
    else if (position == 0 || position == 8 || position == 16) xPrime = -2;
    else if (position == 4 || position == 13) xPrime = -1;
    else if (position == 1 || position == 9 || position == 17) xPrime = 0;
    else if (position == 5 || position == 14) xPrime = 1;
    else if (position == 2 || position == 10 || position == 18) xPrime = 2;
    else if (position == 6 || position == 15) xPrime = 3;
    else xPrime = 4;

    var xUnit = hexRadius * Math.sqrt(3) / 2.0 + interHexDist / 2.0;
    var yUnit = hexRadius * 1.5 + interHexDist * Math.sqrt(3) / 2.0;
    var xPosn = xPrime * xUnit + originCoord[0];
    var yPosn = yPrime * yUnit + originCoord[1];

    return [xPosn, yPosn];
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

function init(){
    var map = new Map([300,200])
}

window.onload = function(){
    init();
}

/*
function init()
{
    window.time = 0;
    window.pause = false;
    window.height = 20;

    var N = 60;
    var num_states = 5;
    var axisWidth = 300;
    var canvasWidth = 330;
    var canvasHeight = 275;

    var btn1 = document.getElementById("reset")
    var btn2 = document.getElementById("start")
    var btn3 = document.getElementById("stop")

    btn1.onclick = function () {
       window.timestep = 0;
       window.pause = true;
    };

    btn2.onclick = function () {
        window.pause = false
    };

    btn3.onclick = function () {
        window.pause = true
    };

    window.param = {
        num_states: num_states,
        axisWidth: axisWidth,
        N: N,
    };

    //construct the Canvas elements:
    var plots = [];
    var torplots = [];
    for (var i=0; i < num_states + 3; i++){
        var canvas = document.createElement('canvas');
        document.getElementById("plots").appendChild(canvas);
        if (i < 3)
            drawPhase = 0;
        else
            drawPhase = 1;
       // plots[i] =  new CanvasPlot(canvasWidth, canvasHeight, drawPhase, canvas);
        plots[i] = new TorusPlot(canvasWidth, canvasHeight, drawPhase, canvas);
    }

    //first build xArray, the array that holds the values of x to be calculated
    var xArray = [];
    for (var i=0; i<=N; i++)
        xArray[i] = -axisWidth / 2 + i * axisWidth / N;

    //now build the stationary solution (energy eigenstates) projected onto the real plane
    var waveHO = new Wavefunction(xArray);
    var waveRing = new Wavefunction(xArray);
    var waveBox = new Wavefunction(xArray);

    for (var i=0; i < num_states; i++){
        var en = i + 0.5;
        var soln = makeStationaryHO(xArray, i);
        soln = new Eigenstate(xArray, soln[0], soln[1], en, i + 1);
        waveHO.eigenList.push(soln);

        soln = makeStationaryPinRing(xArray, i-3);
        en = Math.pow(i - 3, 2);
        soln = new Eigenstate(xArray, soln[0], soln[1], en, i + 1);
        waveRing.eigenList.push(soln);

        en = Math.pow(i + 1, 2);
        soln = makeStationaryPinBox(xArray, i + 1);
        soln = new Eigenstate(xArray, soln[0], soln[1], en, i + 1);
        waveBox.eigenList.push(soln);
    }

    //the first three plot indicies are reserved for the superimposed, Superposition, and Modulus plots.
    var wavefunction = waveRing;
    var modulus = new Modulus(wavefunction);
    plots[0].fcnList = wavefunction.eigenList;
    plots[1].fcnList = [wavefunction];
    plots[2].fcnList = [modulus];

    for (var i=0; i < num_states; i++){
        plots[i+3].fcnList = [wavefunction.eigenList[i]];
    }
    setInterval(function () { draw(param, plots); }, 30);             // drawing loop 1/20th second
}

function draw(param, plots){
    if (!window.pause)
        window.time += 0.01 * document.getElementById("speed").value;

    num_states = param.num_states;
    window.phi = (b)/3;
    window.theta = -(a-40)/10;
    var xOriginSep = param.xOriginSep;
    var yOriginSep = param.yOriginSep;
    var yOriginSepPhase = param.yOriginSepPhase;
    var xDelta = param.xDelta;
    var xOrigin = param.xOrigin;
    var yOrigin = param.yOrigin;
    var xOriginSuper = param.xOriginSuper;
    var yOriginSuper = param.yOriginSuper;
    var xOriginNorm = param.xOriginNorm;
    var yOriginNorm = param.yOriginNorm;

    var magNorm = 1;

    for (var p=0; p< plots.length; p++){
        plots[p].update();
    }
}*/

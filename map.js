//map class
//

function Map(){
    //19 tiles for the original game
    //4 wood //4 wheat //4 sheep //3 brick //3 ore //1 desert
    //   
    //     0   1   2
    //   3   4   5   6
    // 7   8   9  10  11
    //  12  13  14  15
    //    16  17  18
    //    
    var numTiles = 19

    //generate random tile type
    var resourceList = [0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,4,4,4,5]
    resourceList = fisherYates(resourceList)

    this.hexList = []
    
    var i=0;
    for (var resource in resourceList){
        //generate tile
        this.hexList.push(new Hex(resource, i))
        i++;
    }
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
    var c2 = document.createElement('canvas').getContext("2d");
    c2.fillStyle = '#f00';
    c2.beginPath();
    c2.moveTo(0, 0);
    c2.lineTo(100, 50);
    c2.lineTo(50, 100);
    c2.lineTo(0, 90);
    c2.closePath();
    c2.fill();

}

window.onload = function () {
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

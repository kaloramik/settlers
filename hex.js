
function Hex(resource, hexIndex, hexCenterCoord, ctx, hexRadius, interHexDist){
    //19 tiles for the original game
    //4 wood //4 wheat //4 sheep //3 brick //3 ore //1 desert
    //Y'\X'-4-3-2-1+0+1+2+3+4
    // -2       0   1   2
    // -1     3   4   5   6
    //  0   7   8   9  10  11
    // +1    12  13  14  15
    // +2      16  17  18
    //
    this.resourceType = resource;
    this.hexIndex = hexIndex;
    this.center = hexCenterCoord;
    this.ctx = ctx;

    this.drawHex = function(ctx, hexCenter, hexRadius, resource){

        var HexPoints = getVerticiesOfHex(hexRadius);
        var color = resourceColor(resource)
        ctx.beginPath();
        ctx.fillStyle = color;

        ctx.moveTo(HexPoints[5][0] + hexCenter[0], HexPoints[5][1] + hexCenter[1]);
        for (var i=0; i<6; i++){
            ctx.lineTo(HexPoints[i][0] + hexCenter[0], HexPoints[i][1] + hexCenter[1]);
        }
        ctx.closePath();
        ctx.fill();
    }

    this.drawHex(this.ctx, hexCenterCoord, hexRadius, resource)

}


function resourceColor(resourceIndex){
    //converts the resource index to the corresponding color
    if (resourceIndex == 0) return '#277D09' //wood
    else if (resourceIndex == 1) return '#E37E00' //wheat
    else if (resourceIndex == 2) return '#CCFF99' //sheep
    else if (resourceIndex == 3) return '#660000' //brick
    else if (resourceIndex == 4) return '#999999' //ore
    else if (resourceIndex == 5) return '#FFCCCC' //desert
}

function getVerticiesOfHex(radius){
    var pointList = [];
    var radian60 = Math.PI / 3.0;
    for (var i=0; i<6; i++){
        pointList.push([radius * Math.sin(i * radian60), radius * Math.cos(i * radian60)]);
    }
    return pointList;
}

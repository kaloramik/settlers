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

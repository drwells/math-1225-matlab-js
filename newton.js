var currentRootGuess = 0.0;
var currentIteration = 0;
var nextRootGuess = 0.0;
var userFunction;
var derivativeFunction;
var linearization;


function PlotBounds (updateButtonSuffix, board) {
    this.board = board;
    this.updateButtonSuffix = updateButtonSuffix;
    this.xmin = -5.0;
    this.xmax = 5.0;
    this.ymin = -5.0;
    this.ymax = 5.0;

    this.getBounds = function() {
        return [this.xmin, this.ymax, this.xmax, this.ymin];
    }


    // this.drawLeftBorderAxis = function() {
    //     var fudge = 0.05*(this.xmax - this.xmin);
    //     this.board.board.create('axis', [[this.xmin, this.ymin], [this.xmin, this.ymax]]);
    // }


    // this.drawBottomBorderAxis = function() {
    //     var fudge = 0.05*(this.ymax - this.ymin);
    //     this.board.board.create('axis', [[this.xmin, this.ymin + fudge], [this.xmax, this.ymin + fudge]]);
    // }


    this.updateBox = function() {
        xmin = parseFloat(document.getElementById("xMin" + this.updateButtonSuffix).value);
        xmax = parseFloat(document.getElementById("xMax" + this.updateButtonSuffix).value);
        ymin = parseFloat(document.getElementById("yMin" + this.updateButtonSuffix).value);
        ymax = parseFloat(document.getElementById("yMax" + this.updateButtonSuffix).value);
        if (xmin < xmax && ymin < ymax) {
            this.xmin = xmin;
            this.xmax = xmax;
            this.ymin = ymin;
            this.ymax = ymax;
        }
        else {
            alert("Please set the left bounds lower than the right bounds.");
        }
        this.board.board.setBoundingBox(this.getBounds());
    }
}


function PlotBoard (box, updateButtonSuffix) {
    this.box = box;
    this.plotBounds = new PlotBounds(updateButtonSuffix, this);
    this.board = JXG.JSXGraph.initBoard
    (this.box, {boundingbox:this.plotBounds.getBounds(), axis:true});

    this.clear = function() {
        JXG.JSXGraph.freeBoard(this.board);
        this.board = JXG.JSXGraph.initBoard
        (this.box, {boundingbox:this.plotBounds.getBounds(), axis:true});
    }

    this.updateBounds = function() {
        this.board.setBoundingBox(this.plotBounds.getBounds());
    }
}


var userFunctionBoard = new PlotBoard("functionBox", "UserFunctionPlot");
var linearizationBoard = new PlotBoard("linearizationBox", "LinearizationPlot");


function ignoreEnter(e)
{
    if (e && e.which) {
        characterCode = e.which;
    }
    else {
        characterCode = e.keyCode;
    }

    if (characterCode == 13) {
        return false;
    }
    else {
        return true;
    }
}

function addCurve(board, func, atts) {
    var f = board.create("functiongraph", [func], atts);
    return f;
}

function plot(board, func, atts) {
    if (atts == null) {
        return addCurve(board.board, func, {strokewidth:2});
    } else {
        return addCurve(board.board, func, atts);
    }
}


function ln(x) {
    return Math.log(x);
}

function csc(x) {
    return 1.0/Math.sin(x);
}

function sec(x) {
    return 1.0/Math.cos(x);
}

function cot(x) {
    return 1.0/Math.tan(x);
}


function getUserFunction() {
    with (Math) {
        var func = "function f(x) { return "
            + document.getElementById("userFunction").value
            + ";}";
        eval(func);
    }
    userFunction = f;
    derivativeFunction = JXG.Math.Numerics.D(userFunction);

    plotCurrentFunctions();
}


function newtonStep(x) {
    return x - userFunction(x)/derivativeFunction(x);
}


function plotCurrentFunctions() {
    userFunctionBoard.clear();
    linearizationBoard.clear();
    plot(userFunctionBoard, userFunction);
    plot(linearizationBoard, userFunction, {strokecolor: "blue"});
}


function setLinearizationPoint() {
    currentRootGuess = parseFloat(document.getElementById("currentRootGuess").value);
    currentIteration = 0;
    plotLinearization();

    document.getElementById("currentIteration").value
        = "0";
    document.getElementById("currentFunctionValue").value
        = String(userFunction(currentRootGuess));
}


function stepNewtonIteration() {
    currentRootGuess = newtonStep(currentRootGuess);
    ++currentIteration;
    plotLinearization();
    document.getElementById("currentRootGuess").value = String(currentRootGuess);
    document.getElementById("currentIteration").value
        = String(currentIteration);
    document.getElementById("currentFunctionValue").value
        = String(userFunction(currentRootGuess));
}


function plotLinearization() {
    linearizationBoard.clear();
    function linearization(x) {
        return userFunction(currentRootGuess)
            + derivativeFunction(currentRootGuess)*(x - currentRootGuess);
    }

    nextRootGuess = newtonStep(currentRootGuess);

    plotCurrentFunctions();
    userFunctionBoard.board.create
    ("point", [currentRootGuess, 0.0],
     {
         name:"x_{" + String(currentIteration) + "}",
         color:"black"
     });
    userFunctionBoard.board.create
    ("point", [nextRootGuess, 0.0],
     {
         name:"x_{" + String(currentIteration + 1) + "}",
         color:"green"
     });
    plot(linearizationBoard, linearization, {strokecolor: "magenta"});
    linearizationBoard.board.create
    ("point", [currentRootGuess, 0.0],
     {
         name:"x_{" + String(currentIteration) + "}",
         color:"black"
     });
    linearizationBoard.board.create
    ("line", [[currentRootGuess, 0.0], [currentRootGuess, userFunction(currentRootGuess)]],
     {
         straightFirst:false,
         straightLast:false,
         dash:2,
         color:"black"
     });
    linearizationBoard.board.create
    ("point", [nextRootGuess, 0.0],
     {
         name:"x_{" + String(currentIteration + 1) + "}",
         color: "green"
     });
}


function clearLinearizationPlots() {
    linearizationBoard.clear();
    plotCurrentFunctions();
    currentIteration = 0;
    currentRootGuess = 1.0;
    document.getElementById("currentRootGuess").value = "1.0";
    document.getElementById("currentIteration").value = "0";
    document.getElementById("currentFunctionValue").value
        = String(userFunction(currentRootGuess));
}

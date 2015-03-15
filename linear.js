var linearizationPoint = 0.0;
var userFunction;
var derivative;
var secondDerivative;
var absSecondDerivative;
var linearization;
var linearizationUpperBound;
var linearizationLowerBound;
var linearizationTolerance = 1.0;
var linearizationIntervalRadius = 1.0;

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
var linearizationToleranceBoard = new PlotBoard
("linearizationToleranceBox", "LinearizationTolerancePlot");
var secondDerivativeBoard = new PlotBoard("secondDerivativeBox", "SecondDerivativePlot");

function linearizationBounds() {
    return [linearizationPoint - linearizationIntervalRadius, 5,
            linearizationPoint + linearizationIntervalRadius, -5];
}

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
    derivative = JXG.Math.Numerics.D(userFunction);
    secondDerivative = JXG.Math.Numerics.D(derivative)

    absSecondDerivative = function(x) {
        return Math.abs(secondDerivative(x));
    }
    plotUserFunction();
}

function plotUserFunction() {
    plotCurrentFunctions();
    plotSecondDerivative();
}

function plotCurrentFunctions() {
    userFunctionBoard.clear();
    linearizationToleranceBoard.clear();
    plot(userFunctionBoard, userFunction);
    plot(userFunctionBoard, derivative, {strokecolor: "black"});
    plot(linearizationToleranceBoard, userFunction, {strokecolor: "blue"});
}

function setLinearizationPoint() {
    linearizationPoint = parseFloat(document.getElementById("linearizationPoint").value);
    plotLinearization();
}

function plotLinearization() {
    linearizationToleranceBoard.clear();
    function linearization(x) {
        return userFunction(linearizationPoint)
            + derivative(linearizationPoint)*(x - linearizationPoint);
    }

    function linearizationUpperBound(x) {
        return linearization(x) + linearizationTolerance;
    }

    function linearizationLowerBound(x) {
        return linearization(x) - linearizationTolerance;
    }

    plotUserFunction();
    plot(userFunctionBoard, linearization, {strokecolor: "magenta"});
    userFunctionBoard.board.create
    ("point", [linearizationPoint, userFunction(linearizationPoint)], {name:""});
    plot(linearizationToleranceBoard, linearization, {strokecolor: "magenta"});
    plot(linearizationToleranceBoard, linearizationUpperBound, {strokecolor: "green"});
    plot(linearizationToleranceBoard, linearizationLowerBound, {strokecolor: "green"});
    linearizationToleranceBoard.board.create
    ("point", [linearizationPoint, userFunction(linearizationPoint)], {name:""});
    plotSecondDerivative();
}

function clearLinearizationPlots() {
    linearizationToleranceBoard.clear();
    plotCurrentFunctions();
}

function plotSecondDerivative() {
    secondDerivativeBoard.clear();
    plot(secondDerivativeBoard, absSecondDerivative, {strokecolor: "blue"});
    secondDerivativeBoard.board.create("line", [
        [linearizationPoint - linearizationIntervalRadius, -1000],
        [linearizationPoint - linearizationIntervalRadius, 1000],
    ], {strokecolor: "red", strokewidth:1});
    secondDerivativeBoard.board.create("line", [
        [linearizationPoint + linearizationIntervalRadius, -1000],
        [linearizationPoint + linearizationIntervalRadius, 1000],
    ], {strokecolor: "red", strokewidth:1});
}

function setLinearizationTolerance() {
    linearizationTolerance = parseFloat(document.getElementById("linearizationTolerance").value);
    plotLinearization();
}

function resetLinearizationTolerance() {
    linearizationTolerance = 1.0;
    document.getElementById("linearizationTolerance").value = "1.0";
    plotLinearization();
}

function setLinearizationIntervalRadius() {
    linearizationIntervalRadius = Math.abs(parseFloat(
        document.getElementById("linearizationIntervalRadius").value));
    plotSecondDerivative();
}

function resetLinearizationIntervalRadius() {
    linearizationIntervalRadius = 1.0;
    document.getElementById("linearizationIntervalRadius").value = "1.0";
}

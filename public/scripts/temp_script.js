
const curTime = new Date()
// initial values for upper/lower time in chart
var upperTimeLimit = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), 23, 59, 59)
var lowerTimeLimit = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), 0, 0, 1)

const ONE_DAY_IN_MILLIS = 86400000
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var globalMax
var globalMin

var allData;


function displayDate() {
    var day = days[lowerTimeLimit.getDay()]
    var date = lowerTimeLimit.getDate()
    var month = months[lowerTimeLimit.getMonth()]
    var year = lowerTimeLimit.getFullYear()
    document.getElementById("chartDate").innerHTML = day + " " + date + "<br>" + month + " " + year;
}

function formatTime(hour, min, separator = ":") {
    var timeString = ""
    if (hour < 10) {
        timeString += "0" + hour;
    } else {
        timeString += hour;
    }
    timeString += separator;
    if (min < 10) {
        timeString += "0" + min;
    } else {
        timeString += min;
    }
    return timeString
}

function displayStats() {
    displayDate()
    if (curDayAvgTemp > 0) {
        var avgMsg = Math.round(curDayAvgTemp * 10) / 10 + " C";
        var minMsg = Math.round(mymin.temperature * 10) / 10 + " C (" + formatTime(mymin.hour, mymin.min) + ")";
        var maxMsg = Math.round(mymax.temperature * 10) / 10 + " C (" + formatTime(mymax.hour, mymax.min) + ")";
    } else {
        var avgMsg = "None";
        var maxMsg = "None";
        var minMsg = "None";
    }
    document.getElementById("chartCurDateAvgTemp").innerHTML = "Day Average: " + avgMsg;
    document.getElementById("chartCurDateMaxTemp").innerHTML = "Highest: " + maxMsg;
    document.getElementById("chartCurDateMinTemp").innerHTML = "Lowest: " + minMsg;
}


function sortArrayByTime(array) {
    var tempArr = array
    for (let i = 0; i < tempArr.length; i++) {
        tempArr.sort((a, b) => {
            return a.formattedTime - b.formattedTime;
        });
    }
    return tempArr
}

function getDataFunc() {
    fetch('/getdata')
        .then((response) => {
            response.json()
                .then((data) => {
                    var dataArray = []
                    for (let i = 0; i < data.result.length; i++) {
                        dataArray.push({})
                        dataArray[i].temperature = data.result[i].payload.temp
                        dataArray[i].curtainsClosed = data.result[i].payload.curtainsClosed
                        dataArray[i].doorClosed = typeof (data.result[i].payload.doorClosed) == "undefined" ? true : data.result[i].payload.doorClosed;
                        dataArray[i].formattedTime = (data.result[i].payload.time.dayOfYear * 100) + data.result[i].payload.time.hour + (data.result[i].payload.time.min * 0.01)
                        dataArray[i].hour = data.result[i].payload.time.hour
                        dataArray[i].min = data.result[i].payload.time.min
                        dataArray[i].day = data.result[i].payload.time.day
                        dataArray[i].dayOfWeek = data.result[i].payload.time.dayOfWeek
                        dataArray[i].dayOfYear = data.result[i].payload.time.dayOfYear
                        dataArray[i].month = data.result[i].payload.time.month - 1
                        dataArray[i].sec = data.result[i].payload.time.sec
                        dataArray[i].year = data.result[i].payload.time.year
                    }
                    dataArray = sortArrayByTime(dataArray)
                    allData = createBigData(dataArray)
                    runCode()
                })
                .catch((err) => {
                    console.error(err)
                })
        })
        .catch((err) => {
            console.error(err)
        })
}

function createBigData(arrayArg) {
    var resultObject = {}
    resultObject.dayOfYearList = [arrayArg[0].dayOfYear]
    resultObject.data = [
        []
    ];
    var objCount = 0
    var curIndex = 0;
    var curDayOfYear = arrayArg[0].dayOfYear;
    for (let i = 0; i < arrayArg.length; i++) {
        if (curDayOfYear != arrayArg[i].dayOfYear) {
            curDayOfYear = arrayArg[i].dayOfYear;
            resultObject.data.push([]);
            curIndex++;
            if (curDayOfYear == getDayOfYear(curTime)) {
                resultObject.curDayOfYearIndex = curIndex
                resultObject.curDayOfYear = getDayOfYear(curTime)
            }
            resultObject.dayOfYearList.push(arrayArg[i].dayOfYear)
            i--;
            objCount = 0;
            continue
        }
        objCount++;
        resultObject.data[curIndex].push(arrayArg[i])
    }
    resultObject.maxList = []
    resultObject.minList = []
    for (let i = 0; i < resultObject.data.length; i++) {
        var tempmax = findArrayMinMaxTemp(resultObject.data[i], "max")
        var tempmin = findArrayMinMaxTemp(resultObject.data[i], "min")
        resultObject.maxList.push(tempmax)
        resultObject.minList.push(tempmin)
    }
    return resultObject
}



function runCode() {
    console.log("Runing program!")
    googleChartUpdate(['#1554c7'])

    globalMax = findGlobalMinMaxTemp(allData.data, "max")
    globalMin = findGlobalMinMaxTemp(allData.data, "min")

    var globalMaxMsg = "Highest: " + Math.round(globalMax.temperature * 10) / 10 + " C (" + globalMax.day + " " + months[globalMax.month] + ", " + formatTime(globalMax.hour, globalMax.min) + ")";
    var globalMinMsg = "Lowest: " + Math.round(globalMin.temperature * 10) / 10 + " C (" + globalMin.day + " " + months[globalMin.month] + ", " + formatTime(globalMin.hour, globalMin.min) + ")";
    document.getElementById("chartAllTimeMinTemp").innerHTML = globalMinMsg;
    document.getElementById("chartAllTimeMaxTemp").innerHTML = globalMaxMsg;
    
    getCurDayArr(allData)
    dayAvgArray = []
    curDayAvgTemp = calcAvgDayTemp();
    
    mymax = allData.curDayOfYearIndex >= 0 ? allData.maxList[allData.curDayOfYearIndex] : "none"
    mymin = allData.curDayOfYearIndex >= 0 ? allData.minList[allData.curDayOfYearIndex] : "none"
    
    displayStats()
}


function websiteOnload() {
    var day = days[curTime.getDay()]
    var date = curTime.getDate()
    var month = months[curTime.getMonth()]
    var year = curTime.getFullYear()
    document.getElementById("chartDate").innerHTML = day + " " + date + "<br>" + month + " " + year;
    document.getElementById("chartCurDateAvgTemp").innerHTML = "Day Average: Loading...";
    document.getElementById("chartCurDateMinTemp").innerHTML = "Lowest: Loading...";
    document.getElementById("chartCurDateMaxTemp").innerHTML = "Highest: Loading...";
    document.getElementById("chartAllTimeMinTemp").innerHTML = "<br>";
    document.getElementById("chartAllTimeMaxTemp").innerHTML = "<br>";

    initChart()

    displayStats()
}



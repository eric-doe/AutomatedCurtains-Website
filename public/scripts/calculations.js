
function getDayOfYear(time) {
    var now = time;
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    return day
}


function findArrayMinMaxTemp(array, min_or_max) {
    if (array.length == 0) {
        return "none"
    }
    min_maxTemp = array[0].temperature
    min_max = array[0]
    min_max.index = 0
    for (let i = 1; i < array.length; i++) {
        if ((min_maxTemp < array[i].temperature && min_or_max == "max") || (min_maxTemp > array[i].temperature && min_or_max == "min")) {
            min_maxTemp = array[i].temperature
            min_max = array[i]
            min_max.index = i
        }
    }
    return min_max
}

var curDayArray = []
var dayAvgArray = []

function getCurDayArr(array) {
    var selectedDay = getDayOfYear(lowerTimeLimit);
    var startIndex = 0
    var endIndex = 0
    for (let i = 0; i < dataSpecs.length; i++) {
        if (dataSpecs[i].dayOfYear == selectedDay) {
            startIndex = dataSpecs[i].dataStartIndex
            endIndex = dataSpecs[i].dataStartIndex + dataSpecs[i].dataCount - 1
            break
        }
    }
    curDayArray = []
    for (let i = startIndex; i < endIndex; i++) {
        curDayArray.push(array[i])
    }
    return curDayArray
}


function calcArrayAvgTemp(array_of_objects) {
    var totalValue = 0
    for (let i = 0; i < array_of_objects.length; i++) {
        totalValue += array_of_objects[i].temperature
    }
    var average = totalValue / array_of_objects.length
    return average
}


function calcArrayAvg(array) {
    var totalValue = 0
    for (let i = 0; i < array.length; i++) {
        totalValue += array[i]
    }
    var average = totalValue / array.length
    return average
}

function calcAvgDayTemp() {
    var hourArray = []
    var curHour = 0
    for (let i = 0; i < curDayArray.length; i++) {
        if (curHour != curDayArray[i].hour) {
            curHour = curDayArray[i].hour
            if (hourArray.length > 0) {
                dayAvgArray.push(calcArrayAvg(hourArray))
            }
            hourArray = []
        }
        hourArray.push(curDayArray[i].temperature)
    }
    dayAvgArray.push(calcArrayAvg(hourArray)) // 1 more time after loop
    var dayAvg = calcArrayAvg(dayAvgArray)
    return dayAvg
}

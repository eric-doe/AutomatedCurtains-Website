
const curTime = new Date()
// initial values for upper/lower time in chart
var upperTimeLimit = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), 23, 59, 59)
var lowerTimeLimit = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), 0, 0, 1)

const ONE_DAY_IN_MILLIS = 86400000
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


var allData;
var dataLoaded = false
var chartArray
var curDayAvgTemp

function initChart(array) {
    // var data = new google.visualization.DataTable();
    data = new google.visualization.DataTable();
    data.addColumn('datetime', 'Time of Day');
    data.addColumn('number', 'Temperature');
    data.addColumn('number', 'Average day');
    data.addRows(
        array
    );
    
    displayStats()
    options = {
        title: 'Apartment Temperature Data',
        subtitle: 'Dots represent temperature measurements',
        width: 900,
        // backgroundColor: 'transparent',
        height: 500,
        colors: ['#1554c7', '#4bc70c', '#ec8f6e', '#f3b49f', '#f6c7b6'],
        pointSize: 5,
        dataOpacity: 0.5,
        legend: { position: 'none' },
        hAxis: {
            title: 'Time of day',
            viewWindow: {
                min: lowerTimeLimit,
                max: upperTimeLimit
            },
            gridlines: {
                count: -1,
                units: {
                    days: { format: ['MMM dd'] },
                    hours: { format: ['HH:mm', 'ha'] }
                }
            },
            minorGridlines: {
              units: {
                hours: {format: ['hh:mm:ss a', 'ha']},
                minutes: {format: ['HH:mm a Z', ':mm']}
              }
            }
        },
        vAxis: {
            title: 'Temperature (C)',
            viewWindow: {
                min: 0,
                max: 40
            }
        }
    };
    chart = new google.visualization.LineChart(document.getElementById('myChart'));
    chart.draw(data, options);
}

function chartChangeDay(next_or_previous_day) {
    if (next_or_previous_day == "next") {
        upperTimeLimit.setTime(upperTimeLimit.getTime() + ONE_DAY_IN_MILLIS)
        lowerTimeLimit.setTime(lowerTimeLimit.getTime() + ONE_DAY_IN_MILLIS)
    } else if (next_or_previous_day == "previous") {
        upperTimeLimit.setTime(upperTimeLimit.getTime() - ONE_DAY_IN_MILLIS)
        lowerTimeLimit.setTime(lowerTimeLimit.getTime() - ONE_DAY_IN_MILLIS)
    }
    options.hAxis.viewWindow.max = upperTimeLimit
    options.hAxis.viewWindow.min = lowerTimeLimit
    chart.draw(data, options);
    getCurDayArr(allData)
    dayAvgArray = []
    curDayAvgTemp = calcAvgDayTemp();
    
    mymax = findArrayMinMaxTemp(curDayArray, "max")
    mymin = findArrayMinMaxTemp(curDayArray, "min")
    displayStats()
}

function displayStats() {
    document.getElementById("chartDate").innerHTML = days[lowerTimeLimit.getDay()] + " " + lowerTimeLimit.getDate() + "<br>" + months[lowerTimeLimit.getMonth()] + " " + lowerTimeLimit.getFullYear();
    if (curDayAvgTemp > 0) {
        var avgMsg = Math.round(curDayAvgTemp * 10) / 10 + " C";
        var maxMsg = Math.round(mymax.temperature * 10) / 10 + " C";
        var minMsg = Math.round(mymin.temperature * 10) / 10 + " C";
    } else {
        var avgMsg = "None";
        var maxMsg = "None";
        var minMsg = "None";
    }
    document.getElementById("chartCurDateAvgTemp").innerHTML = "Day Average: " + avgMsg;
    document.getElementById("chartCurDateMinTemp").innerHTML = "Lowest: " + minMsg;
    document.getElementById("chartCurDateMaxTemp").innerHTML = "Highest: " + maxMsg;
}

function googleChart() {
    google.charts.load('current', { packages: ['corechart'] });
    chartArray = createGoogleDataArray()
    google.charts.setOnLoadCallback(() => { initChart(chartArray) });
}



function createGoogleDataArray() {
    googleDataArray = []
    googleDataArray2 = []
    for (let i = 0; i < allData.length; i++) {
        googleDataArray.push(
            [new Date(allData[i].year, allData[i].month, allData[i].day, allData[i].hour, allData[i].min), allData[i].temperature, null]
        )
    }
    return googleDataArray
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

var dataSpecs = []

function getDataFunc() {
    fetch('/getdata')
        .then((response) => {
            response.json()
                .then((data) => {
                    var dataArray = []
                    var dayCounter = -1
                    for (let i = 0; i < data.result.length; i++) {                        
                        if (dayCounter != data.result[i].payload.time.dayOfYear) {
                            dayCounter = data.result[i].payload.time.dayOfYear
                            dataSpecs.push({
                                dayOfYear: data.result[i].payload.time.dayOfYear,
                                dataStartIndex: i,
                                dataCount: 0
                            })
                        }
                        dataSpecs[dataSpecs.length - 1].dataCount++

                        dataArray.push({})
                        dataArray[i].temperature = data.result[i].payload.temp
                        dataArray[i].curtainsClosed = data.result[i].payload.curtainsClosed
                        dataArray[i].doorClosed = typeof (data.result[i].payload.curtainsClosed) == "undefined" ? "none" : data.result[i].payload.curtainsClosed;
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
                    console.log(dataArray)
                    allData = dataArray
                    dataLoaded = true
                })
                .catch((err) => {
                    console.error(err)
                })
        })
        .catch((err) => {
            console.error(err)
        })
}



function runCode() {
    if (!dataLoaded) {
        setTimeout(() => {
            console.log("Trying again...")
            runCode()
        }, 500);
    } else {
        console.log("Runing program!")
        googleChart()
        
        globalMax = findArrayMinMaxTemp(allData, "max")
        globalMin = findArrayMinMaxTemp(allData, "min")
        var globalMaxMsg = "Highest: (" + Math.round(globalMax.temperature * 10) / 10 + " C) at: " + globalMax.day + " " + months[globalMax.month] + ", " + globalMax.hour + ":" + globalMax.min;
        var globalMinMsg = "Lowest: (" + Math.round(globalMin.temperature * 10) / 10 + " C) at: " + globalMin.day + " " + months[globalMin.month] + ", " + globalMin.hour + ":" + globalMin.min;
        document.getElementById("chartAllTimeMinTemp").innerHTML = globalMinMsg;
        document.getElementById("chartAllTimeMaxTemp").innerHTML = globalMaxMsg;
        
        getCurDayArr(allData)
        dayAvgArray = []
        curDayAvgTemp = calcAvgDayTemp();
        
        mymax = findArrayMinMaxTemp(curDayArray, "max")
        mymin = findArrayMinMaxTemp(curDayArray, "min")
        displayStats()
    }
}

getDataFunc();
runCode()




/*

function createGoogleDataArray3() {
    googleDataArray = [
        ['Time', 'Temperature']
    ]
    for (let i = 0; i < allData[2].length; i++) {
        var timeConvert = (allData[2][i].min)
        timeConvert += allData[2][i].hour
        googleDataArray.push([
            timeConvert,
            allData[2][i].temperature
        ])
    }
    return googleDataArray
}


function getDataFunc() {
    fetch('/temperature_project/getdata')
        .then((response) => {
            response.json()
                .then((data) => {
                    var dataArray = []
                    var dayNum = data.result[0].payload.time.dayOfYear - 1 // first day in database
                    var arrayCounter = 0
                    var arrayIndexCounter = 0
                    for (let i = 0; i < data.result.length; i++) {
                        arrayIndexCounter++
                        while (dayNum < data.result[i].payload.time.dayOfYear) {
                            dayNum++
                            arrayCounter++
                            arrayIndexCounter = 0
                            dataArray.push([])
                        }
                        dataArray[arrayCounter - 1].push({})
                        dataArray[arrayCounter - 1][arrayIndexCounter].temperature = data.result[i].payload.temp
                        dataArray[arrayCounter - 1][arrayIndexCounter].curtainsClosed = data.result[i].payload.curtainsClosed
                        dataArray[arrayCounter - 1][arrayIndexCounter].doorClosed = typeof (data.result[i].payload.curtainsClosed) == "undefined" ? false : true;
                        dataArray[arrayCounter - 1][arrayIndexCounter].timeOfDay = data.result[i].payload.time.hour + (data.result[i].payload.time.min * 0.01)
                        dataArray[arrayCounter - 1][arrayIndexCounter].hour = data.result[i].payload.time.hour
                        dataArray[arrayCounter - 1][arrayIndexCounter].min = data.result[i].payload.time.min
                        dataArray[arrayCounter - 1][arrayIndexCounter].day = data.result[i].payload.time.day
                        dataArray[arrayCounter - 1][arrayIndexCounter].dayOfWeek = data.result[i].payload.time.dayOfWeek
                        dataArray[arrayCounter - 1][arrayIndexCounter].dayOfYear = data.result[i].payload.time.dayOfYear
                        dataArray[arrayCounter - 1][arrayIndexCounter].month = data.result[i].payload.time.month
                        dataArray[arrayCounter - 1][arrayIndexCounter].sec = data.result[i].payload.time.sec
                        dataArray[arrayCounter - 1][arrayIndexCounter].year = data.result[i].payload.time.year
                    }
                    dataArray = sortArrayByTime(dataArray)
                    console.log(dataArray)
                    allData = dataArray
                    dataLoaded = true
                })
                .catch((err) => {
                    console.log(err)
                })
        })
        .catch((err) => {
            console.log(err)
        })
}

*/
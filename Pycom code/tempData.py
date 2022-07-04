import constants

class tempData:
    def __init__(self, time):
        self.time = time
        self.listOfVals = []
        self.max = constants.MIN_INT
        self.min = constants.MAX_INT

    def addValue(self, value):
        self.listOfVals.append(value)
        self.checkIfMaxMin(value)

    def checkIfMaxMin(self, value):
        if self.max < value:
            self.max = value
        if self.min > value:
            self.min = value

    def acceptableDiscrepancy(self):
        if (self.max - self.min) / 2 < constants.MEDIAN_DIFF:
            return True
        else:
            return False

    def calcAvg(self):
        if len(self.listOfVals) == 0:
            print("No values added to data array.")
            return
        avg = 0
        for key in self.listOfVals:
          avg += key
        avg /= len(self.listOfVals)
        self.temp = avg

    def resetDataManagement(self):
        self.max = constants.MIN_INT
        self.min = constants.MAX_INT
        self.listOfVals.clear()

    def formatData(self, curtainClosed, doorClosed):
        newData = str(self.temp)
        newData += " "
        newData += curtainClosed
        newData += " "
        newData += doorClosed
        for item in self.time:
            newData += " "
            newData += str(item)
        return newData


    def displayStatistics(self):
        print("")
        print("Temp: ", self.temp, "   Temp Max: ", self.max, "  Temp error: +-", ((self.max-self.min)/2), "  Median: ", (self.min + ((self.max-self.min)/2)))
        print("")

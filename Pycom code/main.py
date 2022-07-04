
import machine
import pycom
import usocket as socket
import time
from tempData import tempData
import myFuncs
import constants
import motor

# wake_up initialization
(wake_reason, gpio_list) = machine.wake_reason()
machine.pin_sleep_wakeup([constants.WAKE_UP_PIN], mode=machine.WAKEUP_ANY_HIGH, enable_pull=True)

wakeUpForced = myFuncs.reason_for_wakeup(wake_reason)

#turn off LED
pycom.heartbeat(False)
# pycom.rgbled(0xff00)     # turn on the RGB LED in green colour

adc = machine.ADC()
apin = adc.channel(pin=constants.TEMP_DATA_PIN)

iterator = 0
listOfVals = []

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
addr = socket.getaddrinfo('192.168.0.189', 4445)[0][-1]
s.settimeout(2) # Time before we ignore response

tempObj = tempData(list(time.localtime()))

curtainClosedData = curtainClosed = "True" if pycom.nvs_get("curtainClosed") == 1 else "False"

if curtainClosed == "True":
    print("Curtains: CLOSED")
else:
    print("Curtains: OPEN")
print("")

if wakeUpForced:
    print("Woke up with button")
    pycom.rgbled(0x7f7f00) # yellow
    time.sleep(.5)
    pycom.rgbled(0x7f0000) # red
    time.sleep(.5)
    pycom.rgbled(0x7f7f00) # yellow
    time.sleep(.5)
    pycom.rgbled(0x7f0000) # red
    time.sleep(.5)
    pycom.rgbled(0x7f7f00) # yellow
    time.sleep(.5)
    pycom.rgbled(0x7f0000) # red
    time.sleep(.5)
    pycom.rgbled(0x7f7f00) # yellow
    time.sleep(.5)
    pycom.heartbeat(False)
    # motorWheel() function
    curtainClosed = myFuncs.toggleCurtains(curtainClosed)


    curtainChangeToMode = 1 if curtainClosed == "True" else 0
    pycom.nvs_set("curtainClosed", curtainChangeToMode)
    # Code above will only change curtainClosed value in Database for the next reading
    # Gives more appropriate results

print("Starting data gathering.")

while True:
    millivolts = apin.voltage()
    celsius = (millivolts - 500.0) / 10.0

    tempObj.addValue(celsius)

    iterator += 1

    if iterator > constants.ITERATOR_NUM:
        discrepancy_is_low = tempObj.acceptableDiscrepancy()
        # calculate temperature -> displayStatistics -> resetDataManagement
        tempObj.calcAvg()
        tempObj.displayStatistics()
        tempObj.resetDataManagement()
        if not discrepancy_is_low:
            print("Error margin too big.")
            print("Restarting sensor gathering...")
            iterator = 0
        else:
            # Curtain check/toggle
            if not wakeUpForced: # Toggle was forced, don't change state this time
                if myFuncs.curtains_should_close(tempObj.temp, curtainClosed):
                    myFuncs.toggleCurtains(curtainClosed)
                    pycom.nvs_set("curtainClosed", 1)
                elif myFuncs.curtains_should_open(tempObj.temp, curtainClosed):
                    myFuncs.toggleCurtains(curtainClosed)
                    pycom.nvs_set("curtainClosed", 0)
            # Door check
            doorClosed = myFuncs.is_door_closed()
            # Format data for server
            newData = tempObj.formatData(curtainClosedData, doorClosed)
            # send data to server
            s.connect(addr)

            print(time.localtime())
            print(newData)
            s.send(newData)
            print('Message sent')
            response = 0
            try:
                response = str(s.recv(1024))
                print('Message... ', response)
                if response == 0:
                    print("IF statement, No message")
                else:
                    print('Message received:', response)
            except:
                print("No response")

            pycom.rgbled(0xff00) # green light for 3 sec before sleep
            time.sleep(3)
            print(constants.DEEP_SLEEP_TIME / (60 * 1000), " min sleep...")
            machine.deepsleep(constants.DEEP_SLEEP_TIME) # sleep for X min
            # Program will go to sleep and start over again later
    time.sleep(constants.TEMP_DATA_GATHERING_DELAY) # should be 0.5

import machine
import time
from machine import Pin
import constants
import motor

def toggleCurtains(isCurtainClosed):
    if isCurtainClosed == "True":
        print("Open curtains >>>>>>>>> (Medsols)")
        motor.StepperRun(constants.REQ_DEGREE_TO_OPEN)
        return "False"
    elif isCurtainClosed == "False":
        print("Close curtains <<<<<<<<< (Motsols)")
        motor.StepperRunBackwards(constants.REQ_DEGREE_TO_OPEN)
        return "True"


def reason_for_wakeup(wake_reason):
    if wake_reason == machine.PIN_WAKE:
        print("Woke up by (manual) external interrupt")
        return True # FORCED to wakeup
    elif wake_reason == machine.RTC_WAKE:
        print("Woke up because timer ran out.")
        return False # Not forced to wakeup
    else:
        print("Device first start")
        return False # Not forced to wakeup


def is_door_closed():
    # initialize `P9` in gpio mode and make it an output
    p_out = Pin(constants.DOOR_PIN_1, mode=Pin.OUT)
    p_out.value(1)
    p_out.value(0)
    p_out.toggle()
    p_out(True)

    # make `P10` an input with the pull-up enabled
    p_in = Pin(constants.DOOR_PIN_2, mode=Pin.IN, pull=Pin.PULL_DOWN)
    p_in() # get value, 0 or 1

    # print("Checking door state...")
    doorClosed = "False"
    for i in range(constants.DOOR_NUMBER_OF_CHECKS):
        if p_in() == 1:
            doorClosed = "True"
            break
        time.sleep(0.1)
    #if doorClosed == "False":
    #    print("Door: OPEN")
    #else:
    #    print("Door: CLOSED")
    return doorClosed

def curtains_should_close(temp, curtainClosed):
    cur_time = list(time.localtime())
    currentHour = cur_time[3] # index 3 is the current hour
    if temp >= constants.UPPER_TEMP and curtainClosed == "False" and currentHour >= constants.EARLY_HOUR and currentHour <= constants.LATE_HOUR:
        print("It's hot. The time is appropriate. Curtains should CLOSE.")
        return True
    else:
        return False


def curtains_should_open(temp, curtainClosed):
    cur_time = list(time.localtime())
    currentHour = cur_time[3] # index 3 is the current hour
    if temp <= constants.LOWER_TEMP and curtainClosed == "True" and currentHour >= constants.EARLY_HOUR and currentHour <= constants.LATE_HOUR:
        print("It's not hot anymore. The time is appropriate. Curtains should OPEN.")
        return True
    else:
        return False

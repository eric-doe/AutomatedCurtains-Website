# https://www.programmersought.com/article/91954603004/
import time
from machine import Pin
import constants

Pin_All = [Pin(p, Pin.OUT) for p in constants.MOTOR_PIN_LIST]

# Speed ​​(ms) The larger the value, the slower the speed, the minimum value is 1.8ms
speed = constants.MOTOR_SPEED

STEPER_ROUND = 512  # Rotation cycle (360 degrees)
ANGLE_PER_ROUND = STEPER_ROUND / 360  # Rotation 1 degree cycle
# print('ANGLE_PER_ROUND:', ANGLE_PER_ROUND)


def StepperWriteData(data):
    count = 0
    for i in data:
        Pin_All[count].value(i)
        count += 1


def StepperFrontTurn():
    global speed

    StepperWriteData([1, 1, 0, 0])
    time.sleep_us(speed)

    StepperWriteData([0, 1, 1, 0])
    time.sleep_us(speed)

    StepperWriteData([0, 0, 1, 1])
    time.sleep_us(speed)

    StepperWriteData([1, 0, 0, 1])
    time.sleep_us(speed)


def StepperBackTurn():
    global speed

    StepperWriteData([1, 1, 0, 0])
    time.sleep_us(speed)

    StepperWriteData([1, 0, 0, 1])
    time.sleep_us(speed)

    StepperWriteData([0, 0, 1, 1])
    time.sleep_us(speed)

    StepperWriteData([0, 1, 1, 0])
    time.sleep_us(speed)


def StepperStop():
    StepperWriteData([0, 0, 0, 0])


def StepperRun(angle):
    global ANGLE_PER_ROUND
    val = ANGLE_PER_ROUND * abs(angle)
    for i in range(0, val):
        StepperFrontTurn()
    angle = 0
    StepperStop()

def StepperRunBackwards(angle):
    global ANGLE_PER_ROUND
    val = ANGLE_PER_ROUND * abs(angle)
    for i in range(0, val):
        StepperBackTurn()
    angle = 0
    StepperStop()

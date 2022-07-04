
WAKE_UP_PIN = 'P4'
DOOR_PIN_1 = 'P9'
DOOR_PIN_2 = 'P10'
TEMP_DATA_PIN = 'P16'
MOTOR_PIN_LIST = ['P19', 'P20', 'P21', 'P22']

DOOR_NUMBER_OF_CHECKS = 50 # doorCheckTime = this.number * 0.1

MIN_INT = 0
MAX_INT = 9999

# Maximum acceptable discrepancy (median)
MEDIAN_DIFF = 1.5 # +-num

# Temperature values in array before calculating avarage
ITERATOR_NUM = 100
TEMP_DATA_GATHERING_DELAY = 0.5
# TEMP_DATA_GATHERING_DELAY * ITERATOR_NUM = total time gathering data

# Temperature boundaries
UPPER_TEMP = 30
LOWER_TEMP = 28

# Time boundaries
EARLY_HOUR = 10
LATE_HOUR = 21
# Curtains will move if values move beyond these values

# Motor values
# Speed ​​(ms) The larger the value, the slower the speed, the minimum value is 1800us
MOTOR_SPEED = 1800
REQ_DEGREE_TO_OPEN = 920

DEEP_SLEEP_TIME = 1000*60*15 # 15 min

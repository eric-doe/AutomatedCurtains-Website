
def do_connect():
    from network import WLAN
    import time
    import pycom
    import machine
    import config

    pycom.wifi_mode_on_boot(WLAN.STA)   # choose station mode on boot
    wlan = WLAN() # get current object, without changing the mode
    # Set STA on soft rest
    if machine.reset_cause() != machine.SOFT_RESET:
        wlan.init(mode=WLAN.STA)        # Put modem on Station mode
    if not wlan.isconnected():          # Check if already connected
        print("Connecting to WiFi...")
        # Connect with your WiFi Credential
        wlan.connect(config.SSID, auth=(WLAN.WPA2, config.PASS))
        # Check if it is connected otherwise wait
        while not wlan.isconnected():
            pass
    print("Connected to Wifi")

    # Get current time through WiFi
    rtc = machine.RTC()
    rtc.ntp_sync("pool.ntp.org")
    while not rtc.synced():
        machine.idle()
    print("RTC synced with NTP time")
    #adjust your local timezone, by default, NTP time will be GMT
    time.timezone(config.CURRENT_TIMEZONE) #we are located at GMT+2, thus 2*60*60

    time.sleep_ms(500)
    # Print the IP assigned by router
    print('network config:', wlan.ifconfig(id=0))


def http_get(url = 'http://detectportal.firefox.com/'):
    import socket                           # Used by HTML get request
    import time                             # Used for delay
    _, _, host, path = url.split('/', 3)    # Separate URL request
    addr = socket.getaddrinfo(host, 80)[0][-1]  # Get IP address of host
    s = socket.socket()                     # Initialise the socket
    s.connect(addr)                         # Try connecting to host address
    # Send HTTP request to the host with specific path
    s.send(bytes('GET /%s HTTP/1.0\r\nHost: %s\r\n\r\n' % (path, host), 'utf8'))
    time.sleep(1)                           # Sleep for a second
    rec_bytes = s.recv(10000)               # Receve response
    print(rec_bytes)                        # Print the response
    s.close()                               # Close connection


# WiFi Connection
do_connect()
# HTTP request
http_get()
# http_get(url = 'http://www.google.com/')

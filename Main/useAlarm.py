#useAlarm.py

##//Imports
import time
import pygame
import sys, json
import sqlite3
#from sense_hat import SenseHat

pygame.mixer.init()
alarm = pygame.mixer.Sound("Resources/alarm.wav")
#sense = SenseHat()
color = (255, 0, 0)


#Helper functions
def returnConnAndCurr():
    """
    This function returns the connection and the cursor to the SQL db.
    """
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    return conn, c

def CAC(conn, c):
    """
    This function takes the connection and cursor and commits changes and closes them.
    """
    conn.commit()
    c.close()
    conn.close()


#Alarm functions
def fire(message):
    #Set off the alarm
    print("Playing the alarm now with the message: " + message)
    alarm.play()
    #sense.show_message(message, text_color=color)

#Main function
def main():
    """
    This main function runs the program forver, checking the time and setting off alarms
    """
    conn, c = returnConnAndCurr()
    while True:

        currentTime = time.strftime("%H:%M", time.gmtime())
        currentTimeSeconds = time.strftime("%H:%M:%S", time.gmtime()) #Get both acceptable formats of the time.
        currentDay = time.strftime("%A", time.gmtime())


        for row in c.execute("SELECT * FROM alarms ORDER BY name"):
            if (row[1] in [currentTime, currentTimeSeconds]):

                #Check if the current day is the day, and is so fire the alarm.
                if row[2] == "TRUE" and currentDay == "Monday":
                    fire(row[0])
                elif row[3] == "TRUE" and currentDay == "Tuesday":
                    fire(row[0])
                elif row[4] == "TRUE" and currentDay == "Wednesday":
                    fire(row[0])
                elif row[5] == "TRUE" and currentDay == "Thursday":
                    fire(row[0])
                elif row[6] == "TRUE" and currentDay == "Friday":
                    fire(row[0])
                elif row[7] == "TRUE" and currentDay == "Saturday":
                    fire(row[0])
                elif row[8] == "TRUE" and currentDay == "Sunday":
                    fire(row[0])

                time.sleep(1)

main()

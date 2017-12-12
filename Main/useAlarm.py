#This file runs every second or so and checks if an alarm should go off and if it should it sets off the alarm.
import time
import pygame
import sys, json
import sqlite3

pygame.mixer.init()
alarm = pygame.mixer.Sound("alarm.wav")

#Helper functions
def returnConnAndCurr():
	conn = sqlite3.connect("database.db")
	c = conn.cursor()
	return conn, c

def CAC(conn, c):
	conn.commit()
	c.close()
	conn.close()


#Alarm functions
def fire(silent=False):
	#Set off the alarm 
	alarm.play()
	print("Playing the alarm")

def main():
        conn, c = returnConnAndCurr()
        while True:
		#Run forever until the nodeJS is killed, which will kill this

		#Get all the rows from the database
		#Get the time
                currentTime = time.strftime("%H:%M", time.gmtime())
                currentTimeSeconds = time.strftime("%H:%M:%S", time.gmtime())
                for row in c.execute("SELECT * FROM alarms ORDER BY name"):
                        #Check if it is the correct time to set it off
                        if (row[1] in [currentTime, currentTimeSeconds]):
                                #Set off the alarm
                                if (row[3]) == 'silent':
                                        fire(silent=True)
                                else:
                                        fire()

                                #Check if it needs to be deleted
                                if (row[3]) == 'delete':
                                        c.execute("DELETE FROM alarms WHERE name='{0}'".format(row[0]))
                time.sleep(0.9)

if __name__ == '__main__':
	main()


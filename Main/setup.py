#This script should be run when setting up the file.
import sqlite3

print("Beggining setup.")

#Connect to the DB
conn = sqlite3.connect("database.db")

c = conn.cursor()
c.execute("CREATE TABLE IF NOT EXISTS alarms(name TEXT, time TEXT, priority INTEGER, type TEXT);")
conn.commit()
#Possible types are (repeat, delete, silent)
#repeat - repeat the alarm every time specified
#delete - delete after one use
#silent - never actually set off

#Add test alarm
c.execute("INSERT INTO alarms VALUES('Important Alarm', '7:20', 2, 'Repeat')")
conn.commit()
c.close()

#Test database
c = conn.cursor()
for row in c.execute("SELECT * FROM alarms"):
	print(row)
c.close()

test = input("Press any key to finish...")
conn.close()
print("Setup finished.")

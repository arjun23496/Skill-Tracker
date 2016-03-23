# IBM_first_round

Before using the Web App read the following instructions

After doing $npm install and $npm start 

Assuming that the App is running on http://localhost:3000

1)
	Before anything
	
	Open http://localhost:3000/create
	
	This will create the database of all required managers and employees
	Warning: After running it once dont run it again , as creating duplicate usernames will throw an error
	
2) 
	To check the database of managers and employees in raw format 
	
	Open http://localhost:3000/check
	
3) 
	To check the logs of the activities 
	
	Open http://localhost:3000/logs	
	
3)
	In case if you want to delete everything from the database and start using the fresh app
	
	Open http://localhost:3000/delete
	
	Warning: This will delete all the users and logs 
	
	Note: Dont forget to run http://localhost:3000/create once again before using the app as database will be empty	
	
	
Required data:

[I] manager1 is connected to employee1 and employee2

[II] manager2 is connected to employee3 and employee4
_____________________________________________
|        Username          |    Password    |
|--------------------------|----------------|
|   manager1@email.com     | 	manager1    |
|   manager2@email.com     |	manager2    |
|   employee1@email.com    |	employee1   |
|   employee2@email.com    |	employee2   |
|   employee3@email.com    |	employee3   |
|   employee4@email.com    |	employee4   |			 	
|__________________________|________________|



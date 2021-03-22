# Distributed And Parallel Systems Project: Kahoot Clone
> This was the project we made for our distributed systems course using NodeJS along with some popular node modules. The main goal of this project was to teach ourselves how to go about building a distributed system as well as some of the challenges that arise when creating such applications.

## Challenges
* **Concurrency**: Displaying the same question to all quiz takers
* **Fault Tolerance**: Manage the sudden disconnections that may occur for both the quiz takers and the host
* **Transparency**: All quiz takers have the same quiz questions along with the same global timer for each question
* **Openness**: Add more available quizzes

## Node Modules Used
1. **Socket.io**: Add event-driven functionality to our application
1. **Express**: Handle data input/output among the server and web pages
1. **MongoDB**: Allow connection to a database to query quizzes

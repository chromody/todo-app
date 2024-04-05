const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const {v4:uuidv4} = require('uuid');

const dbSource = 'todo.db';
const db = new sqlite3.Database(dbSource);
const HTTP_PORT = 8000;
console.log("Listening to port " + HTTP_PORT);
var app=express();
app.use(cors());

class Task {
    constructor(strTaskName, strDueDate, strLocation, strInstructions, strStatus, strUUID) {
        this.TaskName = strTaskName;
        this.DueDate = strDueDate;
        this.Location = strLocation;
        this.Instructions = strInstructions;
        this.Status = strStatus;
        this.TaskID = strUUID;
    }
}

app.get('/', function(req,res,next) {
    console.log("Whats Up");
    res.status(200).send({message:"Success"})
})

app.get('/task/all', function(req, res, next) {
    let strCommand = 'SELECT * FROM tblTasks';
    db.all(strCommand,(err,row) => {
        if(err) {
            res.status(400).send({error:err.message})
        } else {
            res.status(200).json({message:"success", tasks:row})
        }
    })
})

//swap TaskName to TaskID for selecting a task
app.get('/task', function(req, res, next) {
    let strTaskID = req.query.TaskID;
    if (strTaskID) {
        let strCommand = 'SELECT * FROM tblTasks where TaskID = ?';
        let arrParameters = [strTaskID];
        db.all(strCommand, arrParameters, (err,row) => {
            if (err) {
                res.status(400).send({error:err.message})
            } else {
                if (row.length < 1) {
                    res.status(200).send({message:"error: task not found"})
                } else {
                    res.status(200).json({message:"success", task: row})
                }
            }

        })
    } else {
        res.status(200).json({message: "No Task ID Provided"})
    }
}) 

app.post('/task', function(req, res, next) {
    let strTaskName = req.query.TaskName;
    let strDueDate = req.query.DueDate;
    let strLocation = req.query.Location;
    let strInstructions = req.query.Instructions;
    let strStatus = req.query.Status;
    console.log(strTaskName)
    console.log(strDueDate)
    console.log(strLocation)
    console.log(strInstructions)
    console.log(strStatus)



    if (strTaskName && strDueDate && strLocation && strInstructions && strStatus) {
        let strTaskID = uuidv4();
        let strCommand = "INSERT INTO tblTasks VALUES(?,?,?,?,?,?)";
        let strParameters = [strTaskName, strDueDate, strLocation, strInstructions, strStatus, strTaskID];
        let objTask = (strTaskName, strDueDate, strLocation, strInstructions, strStatus, strTaskID);
        db.run(strCommand, strParameters, function(err,result) {
            if (err) {
                console.log('error with adding task: ' + err.message)
                res.status(401).send({error:err.message})
            } else {
                res.status(201).json({
                    message: "success",
                    task: objTask
                })
            }
        })
    } else {
        console.log('failed to send paramters to add task')
        res.status(401).send({message: "Error, missing parameters"})
    }
})

app.delete('/task', function(req, res, next) {
    console.log("successful delete")
    let strTaskID = req.query.TaskID;
    if (strTaskID) {
        let strCommand = "DELETE FROM tblTasks where TaskID = ?";
        let strParameters = [strTaskID];
        db.run(strCommand, strParameters, function(err, result) {
            if (err) {
                console.log('error: ' + err.message)
                res.status(401).send({error:err.message});
            } else {
                res.status(201).json({
                    message: 'success'
                })
            }
        })
    } else {
        res.status(401).send({message:'no passed identifier'})
    } 
})

app.put('/task', function(req, res, next) {
    let strTaskName = req.query.TaskName;
    let strDueDate = req.query.DueDate;
    let strLocation = req.query.Location;
    let strInstructions = req.query.Instructions;
    let strStatus = req.query.Status;
    let strTaskID = req.query.TaskID;
    console.log(strTaskName)
    console.log(strDueDate)
    console.log(strLocation)
    console.log(strInstructions)
    console.log(strStatus)
    console.log(strTaskID)



    if (strTaskName && strDueDate && strLocation && strInstructions && strStatus && strTaskID) {
        let strCommand = "UPDATE tblTasks SET TaskName = ?, DueDate = ?, Location = ?, Instructions = ?, Status = ?, TaskID = ? WHERE TaskID = ?";
        let strParameters = [strTaskName, strDueDate, strLocation, strInstructions, strStatus, strTaskID, strTaskID];
        db.run(strCommand, strParameters, function(err,result) {
            if (err) {
                console.log('error with updating task: ' + err.message)
                res.status(401).send({error:err.message})
            } else {
                res.status(201).json({
                    message: "success"
                })
            }
        })
    } else {
        console.log('failed to send paramters to add task')
        res.status(401).send({message: "Error, missing parameters"})
    }
})

app.listen(HTTP_PORT);

//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//Port environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(express.static('boardbackend'))

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

//The following is an example of an array of three boards. 
var nextBoardId = 4;
var boards = [
    { id: '0', name: "Planned", description: "Everything that's on the todo list.", tasks: ["0","1","2"] },
    { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: [] },
    { id: '3', name: "Done", description: "Completed tasks.", tasks: ["3"] }
];
var nextTaskId = 4;
var tasks = [
    { id: '0', boardId: '0', taskName: "Another task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false },
    { id: '1', boardId: '0', taskName: "Prepare exam draft", dateCreated: new Date(Date.UTC(2021, 00, 21, 16, 48)), archived: false },
    { id: '2', boardId: '0', taskName: "Discuss exam organisation", dateCreated: new Date(Date.UTC(2021, 00, 21, 14, 48)), archived: false },
    { id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true }
];

//Your endpoints go here
app.get('/api/v1/boards', function(req, res) {
    return res.status(200).json(boards);

});

app.get("/api/v1/boards/:id", function(request, response){
    //let boardTasks = []
    let boardId = request.params.id;
    let board = boards.filter(board => board.id === boardId);
    if (board=== null || board===undefined){
        return res.status(404).json({"Error": "Board with id "+req_id+" does not exist!"});
    };

    return response.status(200).json(board);
});

app.get("/api/v1/boards/:id/tasks", function(request, response){
    let boardId = request.params.id;
    let query = request.query.sort

    let result = tasks.filter(task => task.boardId === boardId);

    //https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    result.sort((a, b) => (a[query] > b[query]) ? 1 : -1);
    return response.status(200).json(result);
});

app.get("/api/v1/boards/:boardId/tasks/:taskId", function (request, response) {
    const boardId = request.params.boardId;
    const taskId = request.params.taskId;
    
    const task = tasks.filter(task => task.id === taskId && task.boardId === boardId);
    return response.status(200).json(task);
});
/*
app.get('/api/v1/boards/:bID/tasks', function(req, res) {
    let req_board = req.params.bID;
    let matching_tasks = []
    for (var i = 0; i < tasks.length; i++){
        // look for the entry with a matching `code` value
        if (tasks[i].boardId == req_board){
            matching_tasks.push(tasks[i])
        }
    }
    return res.status(200).json(matching_tasks);
    //res.status(200).send('Hello world!')
});
*/

app.post('/api/v1/boards', (req, res) => {
    if (req.body.name === undefined){
        return res.status(400).json({"message":"name is required in request body"})}
    var myBoard = {
        id: nextBoardId,
        name: req.body.name,
        description: req.body.description,
        tasks: []
    }
    boards.push(myBoard);
    nextBoardId = nextBoardId + 1;
    return res.status(201).json(myBoard);
});
app.post("/api/v1/boards/:boardId/tasks", function (request, response) {
    const boardId = request.params.boardId;
    //const boardTasks = tasks.filter(task => task.boardId === boardId);
    const taskName = request.body.taskName;
    if (
        taskName === undefined ||
        taskName === null
    ){
        return res.status(400).json({"error":"Task name expected"})
    }
    const newTask = {
        id: nextTaskId.toString(),
        taskName: taskName,
        boardId: boardId,
        dateCreated: Date.now(),
        archived: false,
    }

    tasks.push(newTask)
    nextTaskId = nextTaskId +1
    return response.status(201).json(newTask);
});

app.delete('/api/v1/boards/:id',(req, res) =>{
    let req_id = req.params.id;
    let req_board = boards.filter((boards) => boards.id == req_id)
    if(
        req_board === undefined ||
        req_board === null
    ){
        return res.status(404).json({"Error": "Board with id "+req_id+" does not exist!"})
    }
    var task_check = tasks.filter((task) => task.archived === false && task.boardId == req_id)
    if (task_check.length > 0){ 
        return res.status(400).json({"error":"Board with id "+req_id+" has unarchived task!"});
    }
    
    boards = boards.filter((boards) => boards.id != req_id)
    return res.status(200).json(req_board)

})

app.patch("/api/v1/boards/:boardId/tasks/:taskId", function (request, response) {
    const boardId = request.params.boardId;
    const taskId = request.params.taskId;
    const task = tasks.filter(task => task.id === taskId && task.boardId === boardId);
    if(
        task === undefined ||
        task === null
    ){
        return response.status(404).json({"Error": "Taks with id "+taskId+" does not exist!"})
    }
    task[0].archived = true
    return response.status(200).json(task);
});

app.delete("/api/v1/boards/:boardId/tasks/:taskId", function (request, response) {
    const boardId = request.params.boardId;
    const taskId = request.params.taskId;

    const our_task = tasks.filter((tasks) => tasks.id === taskId && tasks.boardId === boardId);
    if(
        our_task === undefined ||
        our_task === null
    ){
        return res.status(404).json({"Error": "Taks with id "+taskId+" does not exist!"})
    }
    var removed_task = tasks.filter((tasks) => tasks.id == taskId)
    tasks = tasks.filter((tasks) => tasks.id != taskId)
    return response.status(200).json(removed_task);
});


//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});
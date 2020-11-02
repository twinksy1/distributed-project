var socket = io();
var qNum = 1;

function updateDB() {
    var questions = [];
    var name = document.getElementById('name').value;

    for(var i=1; i<= qNum; i++) {
        // Question
        var q = document.getElementById('q' + i).value;
        // Answers
        var a1 = document.getElementById(i + 'a1').value;
        var a2 = document.getElementById(i + 'a2').value;
        var a3 = document.getElementById(i + 'a3').value;
        var a4 = document.getElementById(i + 'a4').value;
        // Correct answer
        var correct = document.getElementById('correct' + i).value;
        var answers = [a1, a2, a3, a4];
        questions.push({"question": q, "answers": answers, "correct": correct});
    }
    var quiz = {id: 0, "name": name, "questions": questions};
    socket.emit('newQuiz', quiz);
}

function addQuestion() {
    qNum += 1;

    var qDiv = document.getElementById('allQuestions');
    // New Question
    var newqDiv = document.createElement("div");
    var qLabel = document.createElement('label');
    var qField = document.createElement('input');
    // Available Answers
    var a1Label = document.createElement('label');
    var a1Field = document.createElement('input');

    var a2Label = document.createElement('label');
    var a2Field = document.createElement('input');

    var a3Label = document.createElement('label');
    var a3Field = document.createElement('input');

    var a4Label = document.createElement('label');
    var a4Field = document.createElement('input');
    // Correct Answer
    var cLabel = document.createElement('label');
    var cField = document.createElement('input');

    qLabel.innerHTML = "Question " + String(qNum) + ": ";
    qField.setAttribute('class', 'question');
    qField.setAttribute('id', 'q' + String(qNum));
    qField.setAttribute('type', 'text');

    a1Label.innerHTML = "Answer 1: ";
    a2Label.innerHTML = " Answer 2: ";
    a3Label.innerHTML = "Answer 3: ";
    a4Label.innerHTML = " Answer 4: ";
    cLabel.innerHTML = "Correct Answer (1-4): ";

    a1Field.setAttribute('id', String(qNum) + "a1");
    a1Field.setAttribute('type', 'text');
    a2Field.setAttribute('id', String(qNum) + "a2");
    a2Field.setAttribute('type', 'text');
    a3Field.setAttribute('id', String(qNum) + "a3");
    a3Field.setAttribute('type', 'text');
    a4Field.setAttribute('id', String(qNum) + "a4");
    a4Field.setAttribute('type', 'text');
    cField.setAttribute('id', 'correct' + String(qNum));
    cField.setAttribute('type', 'number');

    newqDiv.setAttribute('id', 'question-field');//Sets class of div

    newqDiv.appendChild(qLabel);
    newqDiv.appendChild(qField);
    newqDiv.appendChild(document.createElement('br'));
    newqDiv.appendChild(document.createElement('br'));
    newqDiv.appendChild(a1Label);
    newqDiv.appendChild(a1Field);
    newqDiv.appendChild(a2Label);
    newqDiv.appendChild(a2Field);
    newqDiv.appendChild(document.createElement('br'));
    newqDiv.appendChild(document.createElement('br'));
    newqDiv.appendChild(a3Label);
    newqDiv.appendChild(a3Field);
    newqDiv.appendChild(a4Label);
    newqDiv.appendChild(a4Field);
    newqDiv.appendChild(document.createElement('br'));
    newqDiv.appendChild(document.createElement('br'));
    newqDiv.appendChild(cLabel);
    newqDiv.appendChild(cField);

    qDiv.appendChild(document.createElement('br'));//Creates a break between each question
    qDiv.appendChild(newqDiv);//Adds the question div to the screen

    newqDiv.style.backgroundColor = randomColor();

}

function cancelQuiz() {
    if(confirm("Are you sure you want to cancel your quiz creation?")) {
        window.location.href = "../";
    }
}

socket.on('startGameFromCreator', function(data) {
    window.location.href = "../../host/?id=" + data;
});

function randomColor() {
    // Random background colors
    var colors = ['#4CAF50', '#f94a1e', '#3399ff', '#ff9933'];
    var randomNum = Math.floor(Math.random() * 4);
    return colors[randomNum];
}

function setBGColor() {
    var color = randomColor();
    document.getElementById('question-field').style.backgroundColor = color;
}

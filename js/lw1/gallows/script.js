const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wordContainer = document.getElementById("word-container");
const lettersContainer = document.getElementById("letters");
const restartButton = document.getElementById("restart");
const hintElement = document.getElementById("hint");

// выделить архитектуру

let words = [];
let selectedWord = "";
let guessedLetters = [];
let maxAttempts = 7;
let wrongGuesses = 0;

fetch("words.json")
    .then(response => response.json())
    .then(data => {
        words = data;
        startGame();
    })
    .catch(error => console.error("Ошибка загрузки слов:", error));

function startGame() {
    let randomIndex = Math.floor(Math.random() * words.length);
    let wordData = words[randomIndex];

    selectedWord = wordData.word;
    guessedLetters = new Array(selectedWord.length).fill("_");
    wrongGuesses = 0;
    hintElement.textContent = `Подсказка: ${wordData.hint}`;

    renderWord();
    renderLetters();
    drawHangman();
}

function renderWord() {
    wordContainer.innerHTML = "";
    guessedLetters.forEach(letter => {
        let span = document.createElement("span");
        span.classList.add("letter-box");
        span.textContent = letter;
        wordContainer.appendChild(span);
    });
}

function renderLetters() {
    lettersContainer.innerHTML = "";
    const alphabet = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

    alphabet.split("").forEach(letter => {
        let button = document.createElement("span");
        button.classList.add("letter");
        button.textContent = letter;
        button.addEventListener("click", () => checkLetter(letter, button));
        lettersContainer.appendChild(button);
    });
}

function checkLetter(letter, button) {
    if (!selectedWord.includes(letter)) {
        wrongGuesses++;
        button.classList.add("wrong");
    } else {
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === letter) {
                guessedLetters[i] = letter;
            }
        }
        button.classList.add("correct");
    }

    button.style.pointerEvents = "none"; // Блокируем повторный клик

    updateWordDisplay();
    drawHangman();
    checkGameOver();
}

// Обновление отображения слова
function updateWordDisplay() {
    const letterBoxes = document.querySelectorAll(".letter-box");
    guessedLetters.forEach((letter, index) => {
        letterBoxes[index].textContent = letter;
    });
}

// Проверка конца игры
function checkGameOver() {
    if (!guessedLetters.includes("_")) {
        alert(`Поздравляем! Вы угадали слово: ${selectedWord}`);
        startGame();
    } else if (wrongGuesses >= maxAttempts) {
        alert(`Вы проиграли! Загаданное слово было: ${selectedWord}`);
        startGame();
    }
}

function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(150, 250);
    ctx.moveTo(100, 250);
    ctx.lineTo(100, 50);
    ctx.lineTo(200, 50);
    ctx.lineTo(200, 80);
    ctx.stroke();

    if (wrongGuesses > 0) {
        ctx.beginPath();
        ctx.arc(200, 100, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (wrongGuesses > 1) {
        ctx.moveTo(200, 120);
        ctx.lineTo(200, 180);
        ctx.stroke();
    }
    if (wrongGuesses > 2) {
        ctx.moveTo(200, 130);
        ctx.lineTo(170, 160);
        ctx.stroke();
    }
    if (wrongGuesses > 3) {
        ctx.moveTo(200, 130);
        ctx.lineTo(230, 160);
        ctx.stroke();
    }
    if (wrongGuesses > 4) {
        ctx.moveTo(200, 180);
        ctx.lineTo(170, 220);
        ctx.stroke();
    }
    if (wrongGuesses > 5) {
        ctx.moveTo(200, 180);
        ctx.lineTo(230, 220);
        ctx.stroke();
    }
}

restartButton.addEventListener("click", startGame);

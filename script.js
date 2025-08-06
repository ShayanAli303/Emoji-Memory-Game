const welcomeScreen = document.getElementById('welcomeScreen');
const gameContainer = document.getElementById('gameContainer');
const gameOverScreen = document.getElementById('gameOverScreen');
const levelDisplay = document.getElementById('level');
const timeDisplay = document.getElementById('time');
const grid = document.getElementById('grid');
const popup = document.getElementById('level-popup');
const tickSound = document.getElementById('tickSound');
let tickingInterval = null;
let level = 1;
let timeLeft = 60;
let timerInterval;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matched = 0;
let cardCount = 0;

const emojis = [
  '😊', '😢', '😡', '😱', '😍', '😎', '😭', '😴',
  '😜', '🤔', '😇', '🤐', '😷', '🤒', '🤕', '😈',
  '👻', '💩', '😺', '🙈', '🐵', '🐶', '🐱', '🐯',
  '🦁', '🐮', '🐸', '🐼', '🐰', '🐷', '🐔', '🐧'
];

function startGame() {
  welcomeScreen.style.display = 'none';
  gameContainer.style.display = 'block';
  level = 1;
  loadLevel();
}

function loadLevel() {
  document.getElementById('gameContainer').classList.remove('hinge-10', 'hinge-50', 'hinge-100');
  matched = 0;
  grid.innerHTML = '';
  levelDisplay.textContent = level;

  let gridSize = level + 2; // 3x3, 4x4, 5x5...

  // ✅ Dynamically calculate card size based on screen
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;
  let padding = 20;
  let availableWidth = screenWidth - padding * 2;
  let availableHeight = screenHeight - 200; // space for header and timer
  let cardSize = Math.floor(Math.min(availableWidth / gridSize, availableHeight / gridSize));
  cardSize = Math.max(cardSize, 32); // don't let cards get too small

  // ✅ Apply dynamic grid layout
  grid.style.gridTemplateColumns = `repeat(${gridSize}, ${cardSize}px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, ${cardSize}px)`;

  let totalCards = gridSize * gridSize;
  cardCount = totalCards % 2 === 0 ? totalCards : totalCards - 1;

  const selectedEmojis = [];
  while (selectedEmojis.length < cardCount / 2) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    if (!selectedEmojis.includes(emoji)) {
      selectedEmojis.push(emoji);
    }
  }

  const cardEmojis = shuffle([...selectedEmojis, ...selectedEmojis]);
  if (totalCards % 2 !== 0) cardEmojis.push('❓');

  cardEmojis.forEach((emoji) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.innerHTML = `<span>${emoji}</span>`;
    card.addEventListener('click', () => handleCardClick(card));
    grid.appendChild(card);

    // ✅ Apply dynamic sizing to each card
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize}px`;
    card.querySelector('span').style.fontSize = `${cardSize * 0.6}px`; // Scale emoji size
  });

  timeLeft = 60;
  updateTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  previewCards();
}


function handleCardClick(card) {
  if (lockBoard || card.classList.contains('flipped')) return;

  card.classList.add('flipped');
  card.querySelector('span').style.visibility = 'visible';

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;

  const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
  if (isMatch) {
    matched += 2;
    resetCards();

    if (matched === cardCount) {
      clearInterval(timerInterval);
      showLevelPopup();
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard.querySelector('span').style.visibility = 'hidden';
      secondCard.querySelector('span').style.visibility = 'hidden';
      resetCards();
    }, 1000);
  }
}

function resetCards() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}
function startTickingSound() {
  if (!tickingInterval) {
    tickingInterval = setInterval(() => {
      tickSound.currentTime = 0;
      tickSound.play();
    }, 1000); // play every second
  }
}

function stopTickingSound() {
  if (tickingInterval) {
    clearInterval(tickingInterval);
    tickingInterval = null;
  }
}

function updateTimer() {
  timeDisplay.textContent = timeLeft;

  const container = document.getElementById('gameContainer');

  // Hinge progression logic
  container.classList.remove('hinge-10', 'hinge-50', 'hinge-100');

  if (timeLeft <= 0) {
    container.classList.add('hinge-100');
    clearInterval(timerInterval);
    setTimeout(showGameOver, 1500); // Let animation play before game over
    return;
  } else if (timeLeft <= 5) {
    container.classList.add('hinge-50');
  } else if (timeLeft <= 15) {
    container.classList.add('hinge-10');
  }

  // Pulse effect and tick sound
  if (timeLeft <= 15) {
    timeDisplay.classList.add('pulse');
    document.body.classList.add('pulsing-effect');
    startTickingSound()
  } else {
    timeDisplay.classList.remove('pulse');
    document.body.classList.remove('pulsing-effect');
    stopTickingSound()
  }
  timeLeft--;
}


function showLevelPopup() {
  popup.classList.remove('hidden');
  setTimeout(() => {
    popup.classList.add('hidden');
    level++;
    loadLevel();
  }, 1500);
}

function showGameOver() {
  gameContainer.style.display = 'none';
  gameOverScreen.style.display = 'block';
  document.body.classList.remove('pulsing');
  stopTickingSound();


}

function restartGame() {
  gameOverScreen.style.display = 'none';
  gameContainer.style.display = 'block';
  level = 1;
  loadLevel();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function previewCards() {
  const allCards = document.querySelectorAll('.card');
  allCards.forEach(card => {
    card.classList.add('flipped');
    card.querySelector('span').style.visibility = 'visible';
  });

  lockBoard = true;

  setTimeout(() => {
    allCards.forEach(card => {
      card.classList.remove('flipped');
      card.querySelector('span').style.visibility = 'hidden';
    });
    lockBoard = false;
  }, 3000);
}

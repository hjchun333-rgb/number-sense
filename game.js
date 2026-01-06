// === 게임 상태 관리 ===
const GameState = {
    playerName: '',
    playerChar: '🚀',
    currentScreen: 'start',

    // Stage 1: 10의 보수
    stage1Progress: 0,
    stage1Numbers: [],

    // Stage 2: 연산
    stage2Progress: 0,
    score: 0,
    startTime: null,
    currentQuestion: null,
    currentAnswer: null,
    chances: 2,

    // 기록
    history: [],
    dailyCount: 0,
    today: new Date().toISOString().split('T')[0]
};

// === 데이터 저장/로드 ===
function loadData() {
    const saved = localStorage.getItem('antigravity_data');
    if (saved) {
        const data = JSON.parse(saved);
        GameState.history = data.history || [];
        GameState.dailyCount = data.dailyCount || 0;

        // 오늘 날짜가 아니면 일일 카운트 리셋
        if (data.today !== GameState.today) {
            GameState.dailyCount = 0;
        }
    }
}

function saveData() {
    const data = {
        history: GameState.history,
        dailyCount: GameState.dailyCount,
        today: GameState.today
    };
    localStorage.setItem('antigravity_data', JSON.stringify(data));
}

// === 화면 전환 ===
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');
    GameState.currentScreen = screenId;
}

// === 캐릭터 선택 ===
function initCharacterSelect() {
    const charBtns = document.querySelectorAll('.char-btn');
    const charName = document.querySelector('.char-name');

    charBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            charBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            GameState.playerChar = btn.dataset.char;
            charName.textContent = btn.dataset.name;
        });
    });
}

// === 게임 시작 ===
function startGame() {
    const nameInput = document.getElementById('player-name');
    GameState.playerName = nameInput.value.trim() || '우주비행사';

    // 일일 제한 체크
    if (GameState.dailyCount >= 5) {
        alert('🛑 오늘은 이미 5번 연습했어요. 내일 또 만나요!');
        return;
    }

    // Stage 1 초기화
    GameState.stage1Progress = 0;
    GameState.stage1Numbers = shuffle([...Array(9)].map((_, i) => i + 1));

    showScreen('stage1');
    showPuzzle();
}

// === Stage 1: 10의 보수 퍼즐 ===
let currentPuzzleTarget = null;

function showPuzzle() {
    const num = GameState.stage1Numbers[GameState.stage1Progress];
    const target = 10 - num;
    currentPuzzleTarget = target;

    // 옵션 생성 (정답 + 오답 3개)
    let options = [target];
    while (options.length < 4) {
        const wrong = Math.floor(Math.random() * 9) + 1;
        if (!options.includes(wrong)) {
            options.push(wrong);
        }
    }
    options = shuffle(options);

    // UI 업데이트
    document.getElementById('puzzle-num').textContent = num;

    // 입력 필드 초기화
    const puzzleInput = document.getElementById('puzzle-answer-input');
    if (puzzleInput) {
        puzzleInput.value = '';
        puzzleInput.focus();
    }

    const optionsContainer = document.getElementById('puzzle-options');
    optionsContainer.innerHTML = options.map(opt =>
        `<button class="option-btn" data-value="${opt}">${opt}</button>`
    ).join('');

    // 옵션 클릭 이벤트
    optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => checkPuzzleAnswer(btn, target));
    });

    // 진행 바 업데이트
    updateProgress1();
    clearFeedback('feedback1');
}

function checkPuzzleAnswer(btn, target) {
    const value = parseInt(btn.dataset.value);
    const feedback = document.getElementById('feedback1');

    // 이미 클릭된 버튼 비활성화
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    if (value === target) {
        btn.classList.add('correct');
        showFeedback('feedback1', '✅ 퍼즐 합체! 에너지가 충전되었어요!', 'success');

        GameState.stage1Progress++;
        updateProgress1();

        setTimeout(() => {
            if (GameState.stage1Progress >= 9) {
                startStage2();
            } else {
                showPuzzle();
            }
        }, 800);
    } else {
        btn.classList.add('wrong');
        showFeedback('feedback1', '❌ 다시 생각해보세요!', 'error');

        setTimeout(() => {
            document.querySelectorAll('.option-btn').forEach(b => {
                b.disabled = false;
                b.classList.remove('wrong');
            });
            clearFeedback('feedback1');
        }, 600);
    }
}

function updateProgress1() {
    const progress = (GameState.stage1Progress / 9) * 100;
    document.getElementById('progress1').style.width = `${progress}%`;
    document.getElementById('progress1-text').textContent = `${GameState.stage1Progress} / 9`;
}

// === Stage 2: 연산 게임 ===
function startStage2() {
    GameState.stage2Progress = 0;
    GameState.score = 0;
    GameState.startTime = Date.now();
    GameState.chances = 2;

    showScreen('stage2');
    startTimer();
    showQuestion();
}

function showQuestion() {
    const qNum = GameState.stage2Progress + 1;
    let n1, n2, answer, questionText;

    if (qNum <= 10) {
        // 덧셈
        n1 = Math.floor(Math.random() * 24) + 1;
        n2 = Math.floor(Math.random() * 9) + 1;
        answer = n1 + n2;
        questionText = `${n1} + ${n2} = ?`;
    } else {
        // 뺄셈
        n1 = Math.floor(Math.random() * 24) + 1;
        n2 = Math.floor(Math.random() * 24) + 1;
        if (n1 < n2) [n1, n2] = [n2, n1];
        answer = n1 - n2;
        questionText = `${n1} - ${n2} = ?`;
    }

    GameState.currentAnswer = answer;
    GameState.chances = 2;

    // UI 업데이트
    document.getElementById('q-number').textContent = qNum;
    document.getElementById('question').textContent = questionText;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();

    updateChances();
    updateProgress2();
    clearFeedback('feedback2');
}

function checkAnswer() {
    const input = document.getElementById('answer-input');
    const userAnswer = parseInt(input.value);

    if (isNaN(userAnswer)) {
        showFeedback('feedback2', '숫자를 입력해주세요!', 'warning');
        return;
    }

    if (userAnswer === GameState.currentAnswer) {
        // 정답!
        GameState.score++;
        document.getElementById('score').textContent = GameState.score;
        showFeedback('feedback2', '⭐ 정답입니다! 에너지가 솟아나요!', 'success');

        GameState.stage2Progress++;
        updateProgress2();

        setTimeout(() => {
            if (GameState.stage2Progress >= 20) {
                endGame();
            } else {
                showQuestion();
            }
        }, 800);
    } else {
        // 오답
        GameState.chances--;
        updateChances();

        if (GameState.chances > 0) {
            showFeedback('feedback2', `❌ 틀렸어요! 남은 기회: ${GameState.chances}번`, 'warning');
            input.value = '';
            input.focus();
        } else {
            showFeedback('feedback2', `🚨 정답: ${GameState.currentAnswer}`, 'error');

            GameState.stage2Progress++;
            updateProgress2();

            setTimeout(() => {
                if (GameState.stage2Progress >= 20) {
                    endGame();
                } else {
                    showQuestion();
                }
            }, 1200);
        }
    }
}

function updateChances() {
    const chancesEl = document.getElementById('chances');
    const hearts = chancesEl.querySelectorAll('.chance');
    hearts.forEach((h, i) => {
        if (i >= GameState.chances) {
            h.classList.add('lost');
        } else {
            h.classList.remove('lost');
        }
    });
}

function updateProgress2() {
    const progress = (GameState.stage2Progress / 20) * 100;
    document.getElementById('progress2').style.width = `${progress}%`;
    document.getElementById('progress2-text').textContent = `${GameState.stage2Progress} / 20`;
}

// === 타이머 ===
let timerInterval = null;

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - GameState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        document.getElementById('timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// === 게임 종료 ===
function endGame() {
    stopTimer();

    const duration = Math.floor((Date.now() - GameState.startTime) / 1000);
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const accuracy = Math.round((GameState.score / 20) * 100);

    // 기록 저장
    GameState.dailyCount++;
    GameState.history.push({
        date: GameState.today,
        score: GameState.score,
        time: duration
    });

    // 최근 30개만 저장
    if (GameState.history.length > 30) {
        GameState.history = GameState.history.slice(-30);
    }

    saveData();

    // 결과 화면 업데이트
    document.getElementById('result-name').textContent = `${GameState.playerChar} ${GameState.playerName}님`;
    document.getElementById('result-score').textContent = `${GameState.score}/20`;
    document.getElementById('result-time').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('result-accuracy').textContent = `${accuracy}%`;
    document.getElementById('daily-count').textContent = `오늘 ${GameState.dailyCount}회 도전 (최대 5회)`;

    // 그래프 그리기
    drawGraph('graph');

    // 보상 표시 (3회 이상)
    const rewardContainer = document.getElementById('reward-container');
    if (GameState.dailyCount >= 3) {
        rewardContainer.style.display = 'block';
        const fortunes = [
            "오늘 당신의 연산은 우주에서 가장 빛났어요! ✨",
            "포기하지 않는 당신이 진정한 챔피언입니다! 🏆",
            "수학의 힘으로 중력을 이겨냈군요! 🚀",
            "내일은 오늘보다 더 빨라질 거예요! ⚡"
        ];
        document.getElementById('reward-fortune').textContent = fortunes[Math.floor(Math.random() * fortunes.length)];
    } else {
        rewardContainer.style.display = 'none';
    }

    showScreen('result');
}

// === 그래프 ===
function drawGraph(containerId) {
    const container = document.getElementById(containerId);
    const recent = GameState.history.slice(-7);

    if (recent.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">아직 기록이 없습니다</p>';
        return;
    }

    container.innerHTML = recent.map(rec => {
        const width = (rec.score / 20) * 100;
        const mins = Math.floor(rec.time / 60);
        const secs = rec.time % 60;
        const dateStr = rec.date.slice(5); // MM-DD

        return `
            <div class="graph-row">
                <span class="graph-date">${dateStr}</span>
                <div class="graph-bar-container">
                    <div class="graph-bar" style="width: ${width}%">${rec.score}</div>
                </div>
                <span class="graph-time">${mins}:${secs.toString().padStart(2, '0')}</span>
            </div>
        `;
    }).join('');
}

// === 기록 화면 ===
function showHistory() {
    loadData();
    drawGraph('history-graph');

    const listContainer = document.getElementById('history-list');
    const recent = GameState.history.slice(-10).reverse();

    if (recent.length === 0) {
        listContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">아직 기록이 없습니다</p>';
    } else {
        listContainer.innerHTML = recent.map(rec => {
            const mins = Math.floor(rec.time / 60);
            const secs = rec.time % 60;
            return `
                <div class="history-item">
                    <span class="history-date">${rec.date}</span>
                    <span class="history-score">⭐ ${rec.score}/20</span>
                    <span class="history-time">⏱️ ${mins}:${secs.toString().padStart(2, '0')}</span>
                </div>
            `;
        }).join('');
    }

    showScreen('history');
}

// === 피드백 표시 ===
function showFeedback(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `feedback ${type}`;
}

function clearFeedback(elementId) {
    const el = document.getElementById(elementId);
    el.textContent = '';
    el.className = 'feedback';
}

// === 유틸리티 ===
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// === 이벤트 리스너 초기화 ===
function init() {
    loadData();
    initCharacterSelect();

    // 시작 버튼
    document.getElementById('btn-start').addEventListener('click', startGame);

    // 기록 보기 버튼
    document.getElementById('btn-history').addEventListener('click', showHistory);

    // 돌아가기 버튼
    document.getElementById('btn-back').addEventListener('click', () => showScreen('start'));

    // 정답 제출
    document.getElementById('btn-submit').addEventListener('click', checkAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });

    // 다시 도전
    document.getElementById('btn-retry').addEventListener('click', startGame);

    // 처음으로
    document.getElementById('btn-home').addEventListener('click', () => {
        stopTimer();
        showScreen('start');
    });

    console.log('🚀 안티그래비티 연산 게임이 로드되었습니다!');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);

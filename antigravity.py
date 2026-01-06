import random
import time
import json
import datetime
import os

# --- 시각 효과 설정 (ANSI 컬러) ---
class C:
    HEADER = '\033[95m'  # 보라
    PURPLE = '\033[95m'  # 보라 (HEADER와 동일)
    BLUE = '\033[94m'    # 파랑
    CYAN = '\033[96m'    # 하늘
    GREEN = '\033[92m'   # 초록
    YELLOW = '\033[93m'  # 노랑
    RED = '\033[91m'     # 빨강
    BOLD = '\033[1m'     # 굵게
    END = '\033[0m'      # 초기화

# --- 데이터 저장 및 로드 시스템 ---
def load_data(name):
    filename = f"{name}_record.json"
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"name": name, "char": "🚀", "history": [], "daily": {}}

def save_data(data):
    filename = f"{data['name']}_record.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# --- 유틸리티 함수 ---
def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def draw_graph(history):
    print(f"\n{C.CYAN}📈 [최근 7회 성장 그래프]{C.END}")
    recent = history[-7:]
    for i, rec in enumerate(recent):
        stars = "★" * rec['score']
        print(f"{C.YELLOW}{rec['date'][-5:]}{C.END} | {stars:<20} ({rec['time']}초)")

# --- 메인 게임 로직 ---
def run_antigravity():
    clear()
    print(f"{C.BOLD}{C.PURPLE}✨ 안티그래비티 연산 세계에 오신 것을 환영합니다! ✨{C.END}")
    user_name = input(f"\n{C.BOLD}이름을 입력해 주세요: {C.END}").strip()
    
    data = load_data(user_name)
    
    if not data['history']:
        print(f"\n{C.CYAN}함께할 캐릭터를 골라주세요!{C.END}")
        print("1. 🚀 용감한 우주비행사  2. 🤖 똑똑한 로봇  3. 👽 신비한 외계인")
        choice = input("선택 (1~3): ")
        data['char'] = {"1":"🚀", "2":"🤖", "3":"👽"}.get(choice, "🌟")
    
    today = str(datetime.date.today())
    daily_count = data['daily'].get(today, 0)

    if daily_count >= 5:
        print(f"\n{C.RED}🛑 {user_name}님! 오늘은 이미 5번 연습했어요. 내일 또 만나요!{C.END}")
        return

    print(f"\n{C.BOLD}{C.BLUE}반가워요, {data['char']} {user_name}님! 연산 에너지를 모아볼까요?{C.END}")
    time.sleep(1)

    # --- [1단계] 10의 보수 퍼즐 (9문제) ---
    clear()
    print(f"{C.YELLOW}🔋 [1단계] 에너지 코어 충전: 10의 보수 퍼즐{C.END}")
    print("9개의 퍼즐을 맞춰 10을 완성하세요!")
    
    nums = list(range(1, 10))
    random.shuffle(nums)
    for i, n in enumerate(nums):
        target = 10 - n
        opts = random.sample([x for x in range(1, 10) if x != target], 3) + [target]
        random.shuffle(opts)
        
        while True:
            print(f"\n{C.BOLD}[{i+1}/9]  {n} + [ ? ] = 10{C.END}")
            for idx, o in enumerate(opts): print(f"({idx+1}) {o}  ", end="")
            try:
                ans_idx = int(input(f"\n{C.CYAN}번호 선택: {C.END}")) - 1
                if opts[ans_idx] == target:
                    print(f"{C.GREEN}✅ 퍼즐 합체!{C.END}")
                    break
                else: print(f"{C.RED}❌ 숫자가 맞지 않아요!{C.END}")
            except: pass

    # --- [2단계] 본 게임 20문제 ---
    clear()
    print(f"{C.BOLD}{C.BLUE}🚀 [2단계] 중력 탈출! 20문제를 해결하세요!{C.END}")
    time.sleep(1)
    
    start_time = time.time()
    score = 0
    
    for i in range(1, 21):
        if i <= 10: # 덧셈
            n1, n2 = random.randint(1, 24), random.randint(1, 9)
            q, ans = f"{n1} + {n2}", n1 + n2
        else: # 뺄셈
            n1, n2 = random.randint(1, 24), random.randint(1, 24)
            if n1 < n2: n1, n2 = n2, n1
            q, ans = f"{n1} - {n2}", n1 - n2

        print(f"\n{C.BOLD}문제 {i}. {q} = ?{C.END}")
        
        chance = 2
        while chance > 0:
            try:
                user_ans = int(input(f"   {C.CYAN}답: {C.END}"))
                if user_ans == ans:
                    # 정답 시 문제와 동일한 강조(BOLD) 색상
                    print(f"   {C.BOLD}⭐ 정답입니다! 에너지가 솟아나요!{C.END}")
                    score += 1
                    break
                else:
                    chance -= 1
                    if chance == 1:
                        print(f"   {C.YELLOW}❌ 남은 기회 1번{C.END}")
                    else:
                        print(f"   {C.RED}🚨 정답: {ans}{C.END}")
            except: pass

    duration = int(time.time() - start_time)
    
    # 기록 저장
    data['daily'][today] = daily_count + 1
    data['history'].append({"date": today, "score": score, "time": duration})
    save_data(data)

    # --- 결과 및 그래프 ---
    clear()
    print(f"\n{C.PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{C.END}")
    print(f"{C.BOLD}👑 오늘의 연산왕 리포트 ({user_name}님) 👑{C.END}")
    print(f"✅ 맞힌 문제: {score} / 20")
    print(f"⏱️ 걸린 시간: {duration}초")
    print(f"{C.PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{C.END}")

    draw_graph(data['history'])

    # --- 3회 이상 보상 ---
    if daily_count + 1 >= 3:
        print(f"\n{C.YELLOW}🎁 [안티그래비티 상점 오픈]{C.END}")
        print(f"🏅 획득 칭호: {C.BOLD}{C.GREEN}[수학 천재]{C.END}")
        fortunes = [
            "오늘 당신의 연산은 우주에서 가장 빛났어요! ✨",
            "포기하지 않는 당신이 진정한 챔피언입니다! 🏆",
            "수학의 힘으로 중력을 이겨냈군요! 🚀",
            "내일은 오늘보다 더 빨라질 거예요! ⚡"
        ]
        print(f"💌 행운의 메시지: {C.BOLD}{random.choice(fortunes)}{C.END}")

    print(f"\n{C.CYAN}오늘 총 {daily_count + 1}회 도전했습니다. (최대 5회){C.END}")
    print(f"{C.BOLD}수고하셨습니다! 다음에 또 만나요!{C.END}\n")

if __name__ == "__main__":
    run_antigravity()

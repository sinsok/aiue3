from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import random
import os

app = Flask(__name__)

GAME_STATE_FILE = "data/state.json"

def load_game_state():
    if not os.path.exists(GAME_STATE_FILE):
        return {}
    with open(GAME_STATE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_game_state(state):
    with open(GAME_STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=4)


def add_log(state, message):
    print(f"[Game Log] {message}")  # コンソールにログを出力
    
    if "log" not in state:
        state["log"] = []
    state["log"].append(message)

    # ログの長さを制限（例: 最大50件まで保持）
    if len(state["log"]) > 50:
        state["log"].pop(0)
    
    return state


@app.route("/")
def index():
    return redirect(url_for("guest"))

@app.route("/host", methods=["GET", "POST"])
def host():
    if request.method == "POST":
        data = request.form
        state = {
            "theme": data["theme"],
            "current_player_index": 0,
            "player_count": int(data["player_count"]),
            "players": [],
            "used_kana": [],
            "game_started": False,
            "game_finished": False,
            "consecutive_turns": 0,
            "log": ["ゲームが開始されました。"]
        }
        save_game_state(state)
        return redirect(url_for("guest"))
    return render_template("host.html")

@app.route("/reset")
def reset_game():
    #ゲームをリセットする
    state = {
        "theme": "",
        "current_player_index": 0,
        "player_count": int(data["player_count"]),
        "players": [],
        "used_kana": [],
        "log": ["ゲームがリセットされました。"]
    }
    save_game_state(state)
    return jsonify({"result": "success", "message": "ゲームをリセットしました。"})

@app.route('/guest', endpoint='guest')
def guest():
    return render_template('guest.html')

@app.route("/join", methods=["POST"])
def join_game():
    # game_state 関数を呼び出し、その戻り値にアクセスする
    state = load_game_state()
    data = request.get_json()
    player_name = data.get("playerName")
    keyword = data.get("keyword")

    if not player_name or not keyword:
        return jsonify({"result": "error", "message": "プレイヤーネームとキーワードを入力してください。"})

    if len(keyword) < 2 or len(keyword) > 7:
        return jsonify({"result": "error", "message": "キーワードは2～7文字にしてください。"})

    if any(char not in "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんー" for char in keyword):
        return jsonify({"result": "error", "message": "キーワードはひらがな（清音＋伸ばし棒）のみを使用してください。"})

    state["players"].append({
        "name": player_name,
        "keyword": keyword,
        "revealed": "？" * 7,
        "eliminated": False
    })

    # プレイヤーインデックスを付与
    player_index = None
    for i, player in enumerate(state["players"]):
        if player["name"] == player_name:
            player_index = i
            break

    save_game_state(state)
    if player_index is not None:
        return jsonify({"player_index": player_index})
    else:
        return jsonify({"error": "Player not found"}), 400

@app.route("/waiting")
def waiting():
    state = load_game_state()
    if not state:
        return "ゲームはまだ開始されていません。ホストを設定してください。"
    return render_template("waiting.html", players=state["players"], player_count=state["player_count"])

@app.route("/game")
def game():
    state = load_game_state()
    return render_template("game.html")



@app.route("/game_action", methods=["POST"])
def game_action():
    state = load_game_state()
    data = request.get_json()
    selected_kana = data.get("kana")
    current_player = state["players"][state["current_player_index"]]

    # 使用済み文字に追加
    if selected_kana not in state["used_kana"]:
        state["used_kana"].append(selected_kana)
        state = add_log(state, f'{current_player["name"]}が「{selected_kana}」を選択しました。')

        hit = False
                
        # 全プレイヤーのキーワードをチェック
        for player in state["players"]:
            hit = False
            # キーワード内の選択された文字の位置を特定し、その位置に文字を表示
            new_revealed = list(player["revealed"])
            for i, char in enumerate(player["keyword"]):
                if char == selected_kana:
                    new_revealed[i] = selected_kana
                    hit = True
            if hit:
                player["revealed"] = "".join(new_revealed)
                state = add_log(state, f'{player["name"]}のキーワードに「{selected_kana}」がヒットしました！')
                # キーワードの中で？以外の文字が全て公開されているかチェック
                revealed_chars = set(char for char in player["revealed"] if char != "？")
                keyword_chars = set(player["keyword"])
                
                # キーワードが完全に公開されたかチェック
                if revealed_chars == keyword_chars:
                    state = add_log(state, f'{player["name"]}のキーワードが完全に公開され、失格となりました。')
                    player["eliminated"] = True

        # 勝者チェック
        active_players = [p for p in state["players"] if not p.get("eliminated", False)]
        if len(active_players) == 1:
            winner = active_players[0]
            state = add_log(state, f'🎉 {winner["name"]}の勝利！ ゲーム終了')
            state["game_finished"] = True
        elif len(active_players) == 0:
            state = add_log(state, f'全員失格！ 引き分け')
            state["game_finished"] = True

        # ゲームが終了していない場合のみ、次のプレイヤーに手番を移す
        if not state.get("game_finished"):
            # ヒットがあり、連続手番が2回未満の場合は同じプレイヤーの手番を継続
            if hit and state.get("consecutive_turns", 0) < 1:
                state["consecutive_turns"] = state.get("consecutive_turns", 0) + 1
                state = add_log(state, f'ヒットしたので{current_player["name"]}の手番が続きます。')
            else:
                # 次のプレイヤーを探す
                state["consecutive_turns"] = 0  # 連続手番カウンターをリセット
                next_player_found = False
                initial_index = state["current_player_index"]
                
                while not next_player_found:
                    state["current_player_index"] = (state["current_player_index"] + 1) % state["player_count"]
                    # 一周して戻ってきた場合はエラー防止のため中断
                    if state["current_player_index"] == initial_index:
                        break
                    
                    # 失格していないプレイヤーが見つかった場合
                    if not state["players"][state["current_player_index"]]["eliminated"]:
                        next_player_found = True
                        current_player = state["players"][state["current_player_index"]]
                        state = add_log(state, f'次は{current_player["name"]}のターンです。')

    else:
        state = add_log(state, f'{current_player["name"]}が既に使用された「{selected_kana}」を選択しました。')

    save_game_state(state)
    return jsonify({"result": "success"})


@app.route("/game_state", methods=["GET"])
def game_state():
    state = load_game_state()
    return jsonify(state)

if __name__ == "__main__":
    app.run(debug=True)

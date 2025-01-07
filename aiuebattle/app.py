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

def add_log(message):
    #ゲームログにメッセージを追加する
    state = load_game_state()
    if "log" not in state:
        state["log"] = []
    state["log"].append(message)

    # ログの長さを制限（例: 最大50件まで保持）
    if len(state["log"]) > 50:
        state["log"].pop(0)
    save_game_state(state)

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
            "game_started": False
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

    state["players"].append({"name": player_name, "keyword": keyword, "revealed": []})
    save_game_state(state)
    return jsonify({"result": "success"})

@app.route("/waiting")
def waiting():
    state = load_game_state()
    if not state:
        return "ゲームはまだ開始されていません。ホストを設定してください。"
    #即ゲーム開始されると違和感があるので廃止
    if len(state["players"]) == state["player_count"]:
        state["game_started"] = True
        save_game_state(state)
        return redirect(url_for("game"))
    return render_template("waiting.html", players=state["players"], player_count=state["player_count"])

@app.route("/game")
def game():
    state = load_game_state()
    if not state.get("game_started"):
        return redirect(url_for("waiting"))
    return render_template("game.html", state=state)


@app.route("/game", methods=["POST"])
def game_action():
    state = load_game_state()
    data = request.get_json()
    selected_kana = data.get("kana")
    current_player = state["players"][state["current_player_index"]]

    # 使用済み文字に追加
    if selected_kana not in state["used_kana"]:
        state["used_kana"].append(selected_kana)

        # 公開情報を更新
        if selected_kana in current_player["keyword"]:
            current_player["revealed"].append(selected_kana)
            add_log(f'{current_player["name"]}が「{selected_kana}」を選択し、ヒットしました！')
        else:
            add_log(f'{current_player["name"]}が「{selected_kana}」を選択しましたが、ヒットしませんでした。')

        # 手番を次のプレイヤーに変更
        state["current_player_index"] = (state["current_player_index"] + 1) % len(state["players"])
    else:
        add_log(f'{current_player["name"]}が既に使用された「{selected_kana}」を選択しました。')

    return jsonify({"result": "success"})


@app.route("/game_state", methods=["GET"])
def game_state():
    state = load_game_state()
    return jsonify(state)

if __name__ == "__main__":
    app.run(debug=True)

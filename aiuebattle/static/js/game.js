function getPlayerIndexFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("player_index");
}

function updateLog(log) {
    const logBox = document.querySelector("#logBox");
    const logItems = logBox.querySelectorAll("p");
    
    // ログボックスを空にする
    logBox.innerHTML = "";
    
    // logが配列の場合は全要素を追加、文字列の場合は単一の要素として追加
    const logs = Array.isArray(log) ? log : [log];
    
    logs.forEach(message => {
        const logItem = document.createElement("p");
        logItem.textContent = message;
        logBox.appendChild(logItem);
        logBox.scrollTop = logBox.scrollHeight;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const kanaButtons = document.querySelectorAll("#hiragana-board .kana-button");
    const playerList = document.querySelector("#playerList");
    const themeDisplay = document.querySelector("#themeDisplay");
    const playerIndex = getPlayerIndexFromUrl();

    const keywordDisplay = document.querySelector("#keyword");
    const playerNameDisplay = document.querySelector("#player-name");

    // テーマ、プレイヤー名、キーワードを取得
    fetch("/game_state")
        .then((response) => response.json())
        .then((state) => {
            playerNameDisplay.textContent = state.players[playerIndex].name;
            keywordDisplay.textContent = state.players[playerIndex].keyword;
            themeDisplay.textContent = `${state.theme}`;
        });

    // ゲーム状態を更新する関数
    const updateGameState = () => {
        fetch("/game_state")
            .then((response) => response.json())
            .then((state) => {
                const currentPlayerIndex = state.current_player_index;
                const isMyTurn = parseInt(playerIndex, 10) === currentPlayerIndex;

                // ゲーム終了時またはターンが自分でない場合はボタンを無効化
                kanaButtons.forEach((button) => {
                    const kana = button.textContent;
                    if (state.used_kana.includes(kana)) {
                        button.disabled = true;
                        button.classList.add('used');  // 使用済みクラスを追加
                    } else if (!isMyTurn) {
                        button.disabled = true;
                        button.classList.remove('used');  // 未使用のボタンからusedクラスを削除
                    } else {
                        button.disabled = false;
                        button.classList.remove('used');
                    }
                });

                // プレイヤーリストを更新
                playerList.innerHTML = "";
                state.players.forEach((player, index) => {
                    const playerItem = document.createElement("li");
                    
                    // プレイヤー名を表示
                    const nameElement = document.createElement("span");
                    nameElement.textContent = player.name;
                    nameElement.style.display = "inline-block"; // インラインブロックに設定
                    nameElement.style.width = "200px"; // 固定幅を設定

                    // 失格表示
                    const eliminatedElement = document.createElement("span");
                    eliminatedElement.textContent = player.eliminated ? " 【失格】" : "";
                    
                    // 失格の場合、取り消し線をプレイヤー名にも適用
                    if (player.eliminated) {
                        nameElement.style.textDecoration = "line-through";  // 取り消し線
                        playerItem.style.textDecoration = "line-through";  // 取り消し線
                        nameElement.style.color = "#888";  // グレーアウト
                        playerItem.style.color = "#888";  // グレーアウト
                    } else if (currentPlayerIndex === index) {
                        nameElement.style.color = "red";  // 手番プレイヤーを赤色で表示
                    }

                    // キーワード表示
                    const keywordElement = document.createElement("span");
                    keywordElement.textContent = ` キーワード：${player.revealed}`;
                    
                    // 要素をリストアイテムに追加
                    playerItem.appendChild(nameElement);
                    playerItem.appendChild(keywordElement);
                    playerItem.appendChild(eliminatedElement);
                    
                    playerList.appendChild(playerItem);
                });

                // ログメッセージを更新
                if (state.log && state.log.length > 0) {
                    updateLog(state.log);
                }

                // ゲーム終了かつ新しいゲームが開始されている場合のみボタンを表示
                const returnButton = document.querySelector("#returnToGuest");
                const hiraganaBoard = document.querySelector("#hiragana-board");
                
                if (!state.game_started && !state.game_finished && state.theme) {
                    if (returnButton) {
                        returnButton.style.display = "block";
                        // returnToGuestボタンのクリックイベントを追加
                        returnButton.addEventListener("click", () => {
                            window.location.href = "/guest";
                        });
                    }
                    // returnToGuestが表示される時にhiragana-boardを非表示にする
                    if (hiraganaBoard) {
                        hiraganaBoard.style.display = "none";
                    }
                }
            })
            .catch((error) => {
                console.error("ゲーム状態の更新に失敗しました:", error);
            });
    };

    // 50音ボタンのクリックイベントを追加
    kanaButtons.forEach((button) => {
        button.addEventListener("click", () => {
            console.log(`ボタンがクリックされました: ${button.textContent}`); // デバッグログ
            fetch("/game_action", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ kana: button.textContent }),
            })
            .then((response) => response.json())
            .then((data) => {
                updateLog(data.log);
                updateGameState(); // 状態を即時更新
            })
            .catch((error) => {
                console.error("アクションの送信に失敗しました:", error);
            });
        });
    });

    // 初回の更新を実行
    updateGameState();
    // 1秒ごとにゲーム状態を更新
    setInterval(updateGameState, 1000);
});

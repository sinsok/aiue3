document.addEventListener("DOMContentLoaded", () => {
    const logBox = document.querySelector("#logBox");
    const kanaButtons = document.querySelectorAll(".kana-button");
    const playerList = document.querySelector("#playerList");
    const themeDisplay = document.querySelector("#themeDisplay");

    // ゲーム状態を更新する関数
    const updateGameState = () => {

        fetch("/game_state")
            .then((response) => response.json())
            .then((state) => {
                // テーマを更新
                themeDisplay.textContent = `テーマ: ${state.theme}`;

                // プレイヤーリストを更新
                playerList.innerHTML = "";
                state.players.forEach((player, index) => {
                    const playerItem = document.createElement("li");
                    playerItem.textContent = `${player.name} (キーワード: ${player.revealed.join("")})`;
                    if (state.current_player_index === index) {
                        playerItem.style.color = "red"; // 手番プレイヤーを赤色で表示
                    }
                    playerList.appendChild(playerItem);
                });

                // 50音表ボタンの状態を更新
                kanaButtons.forEach((button) => {
                    const kana = button.textContent;
                    button.disabled = state.used_kana.includes(kana);
                });

                // ログメッセージを更新
                if (state.log && state.log.length > 0) {
                    logBox.innerHTML = state.log.map((entry) => `<p>${entry}</p>`).join("");
                }
            })
            .catch((error) => {
                console.error("ゲーム状態の更新に失敗しました:", error);
            });
    };

    // 初回の更新を実行
    updateGameState();
    // 5秒ごとにゲーム状態を更新
    setInterval(updateGameState, 5000);

});

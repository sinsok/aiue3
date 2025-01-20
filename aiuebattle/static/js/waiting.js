function getPlayerIndexFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("player_index");
}

document.addEventListener("DOMContentLoaded", () => {
    const playerCount = document.querySelector("#playerCount");
    const waitMessage = document.querySelector("#waitMessage");
	const playerIndex = getPlayerIndexFromUrl();
    if (!playerIndex) {
        alert("プレイヤー情報が見つかりません。");
        return;
    }
    // サーバーからゲーム状態を定期的に取得する
    const updateWaitState = () => {
        fetch("/game_state")
            .then((response) => response.json())
            .then((state) => {
                const totalPlayers = state.players.length;
                const requiredPlayers = state.player_count || 0; // 必要なプレイ人数

                playerCount.textContent = `参加者: ${totalPlayers} / ${requiredPlayers}`;
				if (requiredPlayers == 0){
                    waitMessage.textContent = "ゲームがリセットされました...";
                    setTimeout(() => {
                        window.location.href = "/guest"; // ゲストページへ移動
                    }, 2000); // 2秒後にゲストページへ遷移
				}
                if (totalPlayers === requiredPlayers) {
                    // プレイヤーが揃った時点でgame_startedをTrueに設定
                    fetch("/start_game", {
                        method: "POST"
                    }).then(() => {
                        waitMessage.textContent = "ゲームを開始します...";
                        setTimeout(() => {
                            window.location.href = `/game?player_index=${playerIndex}`; // ゲームページへ移動
                        }, 2000); // 2秒後にゲームページへ遷移
                    });
                }
            })
            .catch(() => {
                waitMessage.textContent = "サーバーとの通信に失敗しました。";
            });
    };

    setInterval(updateWaitState, 5000); // 5秒ごとに状態を更新
    updateWaitState(); // 初回の状態更新
});

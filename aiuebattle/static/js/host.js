document.addEventListener("DOMContentLoaded", () => {

	//★ゲーム登録
    const form = document.querySelector("form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // フォームデータの取得
        const formData = new FormData(form);
        const theme = formData.get("theme");
        const playerCount = formData.get("player_count");

        // サーバーにPOSTリクエストを送信
        fetch("/host", {
            method: "POST",
            body: formData,
        })
            .then(() => {
                // 新しいタブでゲスト用ページを開く
                window.open("/guest", "_blank");
            })
            .catch((error) => {
                console.error("エラーが発生しました:", error);
            });
    });
	
	document.getElementById("startButton").addEventListener("click", function () {
		// ゲーム開始時の処理
		document.getElementById("startButton").disabled = true;
		document.getElementById("resetButton").disabled = false;
	});

	//★ゲームリセット
    const resetButton = document.getElementById("resetButton");
    const resetStatus = document.getElementById("resetStatus");

    const resetGame = () => {
        fetch("/reset", {
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.result === "success") {
                    resetStatus.textContent = data.message;
                    resetStatus.style.color = "green";
					resetButton.disabled = false;
					resetStatus.disabled = true;
                } else {
                    resetStatus.textContent = "リセットに失敗しました。";
                    resetStatus.style.color = "red";
                }
            })
            .catch((error) => {
                console.error("リセット中にエラーが発生しました:", error);
                resetStatus.textContent = "リセット中にエラーが発生しました。";
                resetStatus.style.color = "red";
            });
    };

    // リセットボタンのイベントリスナーを設定
    resetButton.addEventListener("click", resetGame);
});

document.addEventListener("DOMContentLoaded", () => {
    const themeDisplay = document.querySelector("#themeDisplay");
    const guestForm = document.querySelector("#guestForm");
    const errorMessage = document.querySelector("#errorMessage");

    // サーバーからテーマを取得する
    const fetchTheme = () => {
        fetch("/game_state")
            .then((response) => response.json())
            .then((state) => {
                if (state.theme) {
                    themeDisplay.textContent = `テーマ: ${state.theme}`;
                } else {
                    errorMessage.textContent = "ホストがまだゲームを開始していません。";
                }
            })
            .catch(() => {
                errorMessage.textContent = "サーバーとの通信に失敗しました。";
            });
    };

    // フォーム送信時にプレイヤーデータを送信
    guestForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const playerName = document.querySelector("#playerName").value.trim();
        const keyword = document.querySelector("#keyword").value.trim();

        fetch("/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName, keyword }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.result === "success") {
                    window.location.href = "/waiting"; // 待機ページへ移動
                } else {
                    errorMessage.textContent = data.message || "エラーが発生しました。";
                }
            })
            .catch(() => {
                errorMessage.textContent = "サーバーとの通信に失敗しました。";
            });
    });

    fetchTheme(); // 初回テーマ取得
});

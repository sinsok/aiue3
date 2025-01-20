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
                if (data.result === "error") {
                    // エラーメッセージを表示
                    errorMessage.textContent = data.message;
                } else if (data.player_index !== undefined) {
                    // 成功時は待機画面にリダイレクト
                    window.location.href = `/waiting?player_index=${data.player_index}`;
                } else {
                    errorMessage.textContent = "予期せぬエラーが発生しました。もう一度試してください。";
                }
            })
            .catch((error) => {
                console.error("参加エラー:", error);
                errorMessage.textContent = "サーバーとの通信に失敗しました。";
            });
    });

    fetchTheme(); // 初回テーマ取得
});


@echo off
rem ↑コマンドをユーザに見せないオプション

rem
rem 仮想環境からアプリケーションを開始する
rem

rem 処理START

call C:\Users\k-hirano.ICC\aiue\Scripts\activate

cd /d %~dp0\
python app.py

rem 処理END

rem 続行するには何かキーを押してください...
rem pause

rem バッチ処理終了
exit

rem ↓コメント入力欄とする↓

rem echo arg1: %1		arg1: "argtest.bat"
rem echo arg~1: %~1		arg~1: argtest.bat
rem echo arg~f1: %~f1	arg~f1: C:\Users\hkuno\mybin\argtest.bat
rem echo arg~d1: %~d1	arg~d1: C:
rem echo arg~p1: %~p1	arg~p1: \Users\hkuno\mybin\
rem echo arg~n1: %~n1	arg~n1: argtest
rem echo arg~x1: %~x1	arg~x1: .bat
rem echo arg~a1: %~a1	arg~a1: --a--------
rem echo arg~t1: %~t1	arg~t1: 2016/12/09 10:44
rem echo arg~z1: %~z1	arg~z1: 260


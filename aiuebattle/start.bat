
@echo off
rem ���R�}���h�����[�U�Ɍ����Ȃ��I�v�V����

rem
rem ���z������A�v���P�[�V�������J�n����
rem

rem ����START

call C:\Users\k-hirano.ICC\aiue\Scripts\activate

cd /d %~dp0\
python app.py

rem ����END

rem ���s����ɂ͉����L�[�������Ă�������...
rem pause

rem �o�b�`�����I��
exit

rem ���R�����g���͗��Ƃ��遫

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


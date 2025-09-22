#include "App.h"
#include "MainWindow.h"

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int nCmdShow)
{
    return App(hInstance).Run(MainWindow(), nCmdShow);
}
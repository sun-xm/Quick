#include "App.h"
#include "MainDialog.h"

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int nCmdShow)
{
    return App(hInstance).Run(MainDialog(), nCmdShow);
}
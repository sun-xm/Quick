#include "AppDialog.h"
#include <App.h>

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int nCmdShow)
{
    return App(hInstance).Run(AppDialog(), nCmdShow);
}
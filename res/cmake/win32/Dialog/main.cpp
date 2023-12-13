#include "AppDialog.h"
#include <Application.h>

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int nCmdShow)
{
    return Application(hInstance).Run(AppDialog(), nCmdShow);
}
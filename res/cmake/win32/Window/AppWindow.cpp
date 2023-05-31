#include "AppWindow.h"

AppWindow::AppWindow()
{
}

bool AppWindow::OnCreated()
{
    if (!Window::OnCreated())
    {
        return false;
    }

    this->Text(L"__name__");

    return true;
}
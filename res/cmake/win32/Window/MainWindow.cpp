#include "MainWindow.h"
#include "App.h"

MainWindow::MainWindow()
{
}

bool MainWindow::OnCreated()
{
    if (!Window::OnCreated())
    {
        return false;
    }

    this->Text(App::Name);

    return true;
}
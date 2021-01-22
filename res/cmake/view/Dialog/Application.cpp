#include "Application.h"
#include "resource.h"

using namespace std;

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPWSTR lpCmdLine, int nCmdShow)
{
    Application app(hInstance);
    if (!app.Create(nullptr))
    {
        return -1;
    }

    return app.Modal();
}

Application::Application(HINSTANCE instance) : Dialog(IDD_APP, instance)
{
}

bool Application::OnCreated()
{
    if (!Dialog::OnCreated())
    {
        return false;
    }

    this->RegisterCommand(IDOK, [=]{ this->Destroy(); });
    this->RegisterCommand(IDCANCEL, [=]{ this->Destroy(); });

    return true;
}
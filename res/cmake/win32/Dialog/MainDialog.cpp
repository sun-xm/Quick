#include "MainDialog.h"
#include "App.h"
#include "resource.h"

using namespace std;

MainDialog::MainDialog() : Dialog(IDD_APP)
{
}

bool MainDialog::OnCreated()
{
    if (!Dialog::OnCreated())
    {
        return false;
    }

    this->Text(App::Name);

    this->RegisterCommand(IDOK, [=]{ this->Destroy(); PostQuitMessage(IDOK); return true; });
    this->RegisterCommand(IDCANCEL, [=]{ this->Destroy(); PostQuitMessage(IDCANCEL); return true; });

    return true;
}
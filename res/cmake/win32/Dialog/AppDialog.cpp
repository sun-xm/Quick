#include "AppDialog.h"
#include "resource.h"

using namespace std;

AppDialog::AppDialog() : Dialog(IDD_APP)
{
}

bool AppDialog::OnCreated()
{
    if (!Dialog::OnCreated())
    {
        return false;
    }

    this->Text(L"Test");

    this->RegisterCommand(IDOK, [=]{ this->Destroy(); PostQuitMessage(IDOK); return true; });
    this->RegisterCommand(IDCANCEL, [=]{ this->Destroy(); PostQuitMessage(IDCANCEL); return true; });

    return true;
}
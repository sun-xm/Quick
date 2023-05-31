#include "Spinner.h"
#include <CommCtrl.h>

using namespace std;

Spinner::Spinner() : Control()
{
}

Spinner::Spinner(HWND hWnd) : Control(hWnd)
{
}

void Spinner::Buddy(HWND hWnd)
{
    this->Send(UDM_SETBUDDY, (WPARAM)hWnd);
}

HWND Spinner::Buddy() const
{
    return (HWND)this->Send(UDM_GETBUDDY);
}

void Spinner::SetPos(int pos)
{
    this->Send(UDM_SETPOS32, 0, (LPARAM)pos);
}

bool Spinner::GetPos(int& pos) const
{
    BOOL success;
    pos = (int)this->Send(UDM_GETPOS32, 0, (LPARAM)&success);
    auto err = GetLastError();
    return success ? false : true;
}

void Spinner::Range(int min, int max)
{
    this->Send(UDM_SETRANGE32, (WPARAM)min, (LPARAM)max);
}

void Spinner::Range(int& min, int& max)
{
    this->Send(UDM_GETRANGE32, (WPARAM)&min, (LPARAM)&max);
}
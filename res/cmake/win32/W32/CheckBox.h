#pragma once

#include "Control.h"

class CheckBox : public Control
{
public:
    CheckBox();
    CheckBox(HWND);

    bool Create(HWND parent, UINT id, const std::wstring& text, DWORD style = BS_AUTOCHECKBOX, HINSTANCE instance = nullptr);

    void Check();
    void Uncheck();
    void Indetermine();

    bool IsChecked() const;
    bool IsUnchecked() const;
    bool IsIndeterminate() const;
};
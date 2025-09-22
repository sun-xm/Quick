#pragma once

#include <Application.h>

class App : public Application
{
public:
    App(HINSTANCE);

    static const wchar_t* Name;
};
#pragma once

#include "Dialog.h"

class Application : public Dialog
{
public:
    Application(HINSTANCE);

protected:
    bool OnCreated() override;
};
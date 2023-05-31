#pragma once

#include "Dialog.h"

class AppDialog : public Dialog
{
public:
    AppDialog();

protected:
    bool OnCreated() override;
};
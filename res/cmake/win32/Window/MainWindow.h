#pragma once

#include <Window.h>

class MainWindow : public Window
{
public:
    MainWindow();

protected:
    bool OnCreated() override;
};
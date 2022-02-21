#pragma once

#include "DialogItem.h"

class Spin : public DialogItem
{
public:
    HWND Buddy(HWND hwnd);
    void Range(int low, int high);
};
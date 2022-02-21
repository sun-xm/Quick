#pragma once

#include "DialogItem.h"

class Slider : public DialogItem
{
public:
    int  Position() const;
    void Position(int pos, bool redraw = true);

    int  Min() const;
    int  Max() const;
    void Range(int min, int max, bool redraw = true);
};
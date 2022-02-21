#include "Slider.h"
#include <CommCtrl.h>

int Slider::Position() const
{
    return (int)this->Send(TBM_GETPOS);
}

void Slider::Position(int pos, bool redraw)
{
    this->Send(TBM_SETPOS, redraw ? TRUE : FALSE, (LPARAM)pos);
}

int Slider::Min() const
{
    return (int)this->Send(TBM_GETRANGEMIN);
}

int Slider::Max() const
{
    return (int)this->Send(TBM_GETRANGEMIN);
}

void Slider::Range(int min, int max, bool redraw)
{
    this->Send(TBM_SETRANGEMIN, FALSE, (LPARAM)min);
    this->Send(TBM_SETRANGEMAX, redraw ? TRUE : FALSE, (LPARAM)max);
}
#include <Window.h>

class AppWindow : public Window
{
public:
    AppWindow();

protected:
    bool OnCreated() override;
};
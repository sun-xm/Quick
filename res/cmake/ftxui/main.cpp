#include <ftxui/component/component.hpp>
#include <ftxui/component/screen_interactive.hpp>

using namespace ftxui;
using namespace std;

struct UI
{
    UI()
    {
        this->root = Container::Vertical
        ({
            Renderer([this]{ return text(this->message); }) | center,

            Button("Click", [this]{ this->message = L"Clicked"; }, ButtonOption::Ascii()) | center,

            Renderer([]{ return text(L"Press ESC/CTRL-C to exit"); })

        }) | border | size(WIDTH, LESS_THAN, 1000) | size(HEIGHT, LESS_THAN, 1000);

        this->root = Container::Horizontal({ this->root, Renderer([]{ return filler(); }) }); // align to left
    }

    Component root;
    wstring message;
};

int main(int argc, char* argv[])
{
    auto screen = ScreenInteractive::Fullscreen();

    UI ui;
    ui.message = L"Hello FTXUI";

    screen.Loop(CatchEvent(ui.root, [&screen](Event e)
    {
        if (Event::Escape == e)
        {
            screen.Exit();
            return true;
        }

        return false;
    }));

    return 0;
}
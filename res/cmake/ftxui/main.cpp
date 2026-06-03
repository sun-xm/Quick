#include <ftxui/component/component.hpp>
#include <ftxui/component/screen_interactive.hpp>

using namespace ftxui;
using namespace std;

struct UI
{
    UI()
    {
        auto btnopt = ButtonOption();
        btnopt.transform = [](const EntryState& es)
        {
            auto e = hbox({ text("["), text(es.label), text("]") });
            return es.focused ? e | underlined : e;
        };

        auto inpopt = InputOption();
        inpopt.multiline = false;

        this->root = Container::Vertical
        ({
            Renderer([this]{ return text(this->message) | center | color(Color::Blue); }),

            Input(&this->input, "<input>", inpopt),

            Button("Click", [this]{ this->message = this->input; }, btnopt) | bold | center,

            Renderer([]{ return text("Press ESC/CTRL-C to exit"); })

        }) | border;

        this->root = Container::Horizontal({ this->root, Renderer([]{ return filler(); }) }); // align to left
    }

    Component root;
    string message;
    string input;
};

int main(int argc, char* argv[])
{
    UI ui;
    ui.message = "Hello FTXUI";

    auto screen = ScreenInteractive::Fullscreen();
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
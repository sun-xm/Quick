#include <ftxui/component/component.hpp>
#include <ftxui/component/screen_interactive.hpp>

using namespace ftxui;
using namespace std;

struct Style
{
    static ButtonOption Button()
    {
        ButtonOption option;
        option.transform = [](const EntryState& state)
        {
            auto label = text(state.label);
            if (state.focused)
            {
                label |= underlined;
            }
            return hbox({ text("["), label, text("]") });
        };
        return option;
    }
};

struct UI : Component
{
    UI(Closure exit) : confirm(false), title("Hello FTXUI")
    {
        (Component&)*this =

        Container::Vertical
        ({
            Renderer([this]{ return text(this->title); }) | center,
            Button("Exit", [this]{ this->confirm = true; }, Style::Button()) | center
        }) | border |

        Modal(Container::Horizontal
        ({
            Button("Confirm", exit, Style::Button()),
            Renderer([]{ return text("  "); }),
            Button("Cancel", [this]{ this->confirm = false; }, Style::Button())
        }) | border, &this->confirm);
    }

    bool   confirm;
    string title;
};

int main(int argc, char* argv[])
{
    auto screen = ScreenInteractive::FitComponent();
    screen.Loop(CatchEvent(UI(screen.ExitLoopClosure()), [&screen](Event e)
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
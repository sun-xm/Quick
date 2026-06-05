cmake_minimum_required(VERSION 3.14)
project(__name__)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
set(FETCHCONTENT_QUIET OFF)
FetchContent_Declare(
    ftxui
    GIT_PROGRESS ON
    GIT_SHALLOW ON
    GIT_REPOSITORY https://github.com/ArthurSonzogni/FTXUI.git
    GIT_TAG v6.1.9
    SOURCE_DIR "${CMAKE_CURRENT_LIST_DIR}/cache/ftxui"
)
FetchContent_MakeAvailable(ftxui)

add_executable(${PROJECT_NAME} main.cpp)
target_link_libraries(
    ${PROJECT_NAME}
    PRIVATE
        ftxui::component
        ftxui::dom
        ftxui::screen
)
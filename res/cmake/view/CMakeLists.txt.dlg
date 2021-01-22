cmake_minimum_required(VERSION 3.10)
project(__name__)

set(View ./View)

add_compile_definitions(WIN32 _WINDOWS _UNICODE UNICODE)
add_link_options(/SUBSYSTEM:WINDOWS)
include_directories(${View})
add_executable(${PROJECT_NAME}
               Application.cpp
               __name__.rc
               ${View}/Dialog.cpp
               ${View}/DialogItem.cpp
               ${View}/View.cpp)
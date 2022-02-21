cmake_minimum_required(VERSION 3.10)
project(__name__)

set(VIEW_DIR ./View)
file(GLOB VIEW_CPP ${VIEW_DIR}/*.cpp)

add_compile_definitions(WIN32 _WINDOWS _UNICODE UNICODE)
add_link_options(/SUBSYSTEM:WINDOWS)
include_directories(${VIEW_DIR})
add_executable(${PROJECT_NAME}
               ${VIEW_CPP}
               Application.cpp)
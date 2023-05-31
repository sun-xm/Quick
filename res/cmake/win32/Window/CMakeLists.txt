cmake_minimum_required(VERSION 3.10)
project(Test)

set(W32_DIR "${CMAKE_CURRENT_LIST_DIR}/W32")
file(GLOB W32_CPP ${W32_DIR}/*.cpp)
file(GLOB APP_CPP ${CMAKE_CURRENT_LIST_DIR}/*.cpp)

add_compile_definitions(WIN32 _WINDOWS _UNICODE UNICODE)
add_link_options(/SUBSYSTEM:WINDOWS)
include_directories(${W32_DIR})
add_executable(${PROJECT_NAME} WIN32
               ${APP_CPP}
               ${W32_CPP})
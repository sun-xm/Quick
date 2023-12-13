cmake_minimum_required(VERSION 3.10)
project(__name__)

set(W32_DIR "${CMAKE_CURRENT_LIST_DIR}/W32")
file(GLOB W32_CPP ${W32_DIR}/*.cpp)
file(GLOB APP_CPP ${CMAKE_CURRENT_LIST_DIR}/*.cpp)

add_executable(${PROJECT_NAME} WIN32
               ${APP_CPP}
               ${W32_CPP})

target_include_directories(${PROJECT_NAME} PRIVATE ${W32_DIR})

target_compile_definitions(${PROJECT_NAME} PRIVATE WIN32 _WINDOWS _UNICODE UNICODE)

target_link_options(${PROJECT_NAME} PRIVATE /SUBSYSTEM:WINDOWS)
cmake_minimum_required(VERSION 3.7)
project(__name__)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

if(CMAKE_VERSION VERSION_LESS "3.7.0")
    set(CMAKE_INCLUDE_CURRENT_DIR ON)
endif()

if(WIN32)
    set(Qt5_DIR "$ENV{Qt5_DIR}\\lib\\cmake\\Qt5") # Example C:\Qt\Qt5.9.9\5.9.9\msvc2013_64\lib\cmake\Qt5
    add_executable(${PROJECT_NAME} WIN32
                   main.cpp
                   mainwindow.cpp
                   mainwindow.ui)
else()
    add_executable(${PROJECT_NAME}
                   main.cpp
                   mainwindow.cpp
                   mainwindow.ui)
endif()

find_package(Qt5 COMPONENTS Widgets REQUIRED)
target_link_libraries(${PROJECT_NAME} Qt5::Widgets)
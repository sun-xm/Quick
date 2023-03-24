cmake_minimum_required(VERSION 3.8.2)
project(__name__ LANGUAGES CSharp)

include(CSharpUtilities)

file(GLOB APP_SRC "*.cs")
file(GLOB PPT_SRC "Properties/*.cs")

add_executable(${PROJECT_NAME} ${APP_SRC} ${PPT_SRC})

set_property(TARGET ${PROJECT_NAME} PROPERTY VS_DOTNET_TARGET_FRAMEWORK_VERSION "v4.5.1")
set_property(TARGET ${PROJECT_NAME} PROPERTY VS_DOTNET_REFERENCES
    "Microsoft.CSharp"
    "System"
    "System.Core"
    "System.Data"
    "System.Data.DataSetExtensions"
    "System.Xml"
    "System.Xml.Linq"
)
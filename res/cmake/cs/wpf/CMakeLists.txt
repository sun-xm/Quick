cmake_minimum_required(VERSION 3.8.2)
project(__name__ LANGUAGES CSharp)

include(CSharpUtilities)

file(GLOB APP_SRC "*.xaml" "*.cs")
file(GLOB PPT_SRC "Properties/*")

csharp_set_xaml_cs_properties(${APP_SRC})
csharp_set_designer_cs_properties(${PPT_SRC})

add_executable(${PROJECT_NAME}
               ${APP_SRC}
               ${PPT_SRC}
               App.config)

set_property(SOURCE App.xaml PROPERTY VS_XAML_TYPE "ApplicationDefinition")
set_property(TARGET ${PROJECT_NAME} PROPERTY VS_DOTNET_TARGET_FRAMEWORK_VERSION "v4.5.1")
set_property(TARGET ${PROJECT_NAME} PROPERTY WIN32_EXECUTABLE TRUE)
set_property(TARGET ${PROJECT_NAME} PROPERTY VS_DOTNET_REFERENCES
    "Microsoft.CSharp"
    "PresentationCore"
    "PresentationFramework"
    "System"
    "System.Core"
    "System.Data"
    "System.Data.DataSetExtensions"
    "System.Net.Http"
    "System.Xaml"
    "System.Xml"
    "System.Xml.Linq"
    "WindowsBase"
)
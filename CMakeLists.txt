cmake_minimum_required(VERSION 3.2)
project(web-gba-emu CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(extern/NanoBoyAdvance)

add_executable(main src/main.cpp)
set_target_properties(main PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/dist)

target_link_libraries(main PRIVATE platform-core)
target_link_options(main PRIVATE
    -lembind
    -lidbfs.js
    -sASSERTIONS
    -sEXPORTED_RUNTIME_METHODS=callMain,setValue
    -sPTHREAD_POOL_SIZE=2
    -sTOTAL_MEMORY=512mb
    --preload-file ${CMAKE_SOURCE_DIR}/src/assets/bios.bin@bios.bin
)

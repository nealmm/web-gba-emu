cmake_minimum_required(VERSION 3.2)
project(web-gba-emu CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(extern/NanoBoyAdvance)

#[[add_executable(main src/main.cpp)
set_target_properties(main PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/dist)

target_link_libraries(main PRIVATE platform-core)
target_link_options(main PRIVATE
    "SHELL:-lembind"
    "SHELL:-lidbfs.js"
    "SHELL:-sASSERTIONS"
    "SHELL:-sEXPORTED_RUNTIME_METHODS=callMain,setValue"
    "SHELL:-sPTHREAD_POOL_SIZE=2"
    "SHELL:-sTOTAL_MEMORY=1024MB"
    "SHELL:--preload-file ${CMAKE_SOURCE_DIR}/src/assets/bios.bin@bios.bin"
)]]

set(CMAKE_CXX_FLAGS "-pthread -sUSE_SDL=2")
set(EMCC_LINK_FLAGS
  "-lembind\
   -lidbfs.js\
   --preload-file ${CMAKE_CURRENT_LIST_DIR}/src/assets/bios.bin@bios.bin\
   -sEXPORTED_RUNTIME_METHODS=callMain,setValue\
   -sPTHREAD_POOL_SIZE=2\
   -sTOTAL_MEMORY=1024MB\
   -sASSERTIONS"
)

add_executable(main src/main.cpp)
set_target_properties(main PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/dist LINK_FLAGS ${EMCC_LINK_FLAGS})
target_link_libraries(main platform-core)

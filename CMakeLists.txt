cmake_minimum_required(VERSION 3.2)
project(web-gba-emu CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(extern/NanoBoyAdvance)

add_executable(main src/main.cpp)
set_target_properties(main PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_LIST_DIR}/dist)

target_link_libraries(main PRIVATE platform-core)
target_link_options(main PRIVATE
  "SHELL:-sASSERTIONS"
  "SHELL:-sTOTAL_MEMORY=2gb"
  "SHELL:-sPTHREAD_POOL_SIZE=2"
  "SHELL:--preload-file ${CMAKE_CURRENT_LIST_DIR}/src/assets/bios.bin@bios.bin"
  "SHELL:--preload-file ${CMAKE_CURRENT_LIST_DIR}/src/assets/game.gba@game.gba"
)

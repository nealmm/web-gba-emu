#include <iostream>

#include <SDL.h>

#include <emscripten.h>
#include <emscripten/bind.h>

#include <nba/device/input_device.hpp>
#include <nba/device/video_device.hpp>

#include <platform/config.hpp>
#include <platform/device/sdl_audio_device.hpp>
#include <platform/loader/bios.hpp>
#include <platform/loader/rom.hpp>
#include <platform/emulator_thread.hpp>

SDL_Window *window;
SDL_Renderer *renderer;
SDL_Surface *surface;
u32 *framebuffer;

fs::path save_path;
fs::file_time_type last_sync_time;
bool syncing_save = false;

auto input_dev = std::make_shared<nba::BasicInputDevice>();

void set_key_status(nba::InputDevice::Key key, bool pressed) {
    input_dev->SetKeyStatus(key, pressed);
}

namespace emscripten {
    EMSCRIPTEN_BINDINGS(input) {
        enum_<nba::InputDevice::Key>("Key")
            .value("Up", nba::InputDevice::Key::Up)
            .value("Down", nba::InputDevice::Key::Down)
            .value("Left", nba::InputDevice::Key::Left)
            .value("Right", nba::InputDevice::Key::Right)
            .value("Start", nba::InputDevice::Key::Start)
            .value("Select", nba::InputDevice::Key::Select)
            .value("A", nba::InputDevice::Key::A)
            .value("B", nba::InputDevice::Key::B)
            .value("L", nba::InputDevice::Key::L)
            .value("R", nba::InputDevice::Key::R);

        function("setKeyStatus", &set_key_status);
    }
}

struct Screen : nba::VideoDevice {
    void Draw(u32 *buffer) {
        framebuffer = buffer;
    }
};

void frame() {
    if (SDL_MUSTLOCK(surface)) {
        SDL_LockSurface(surface);
    }

    u32 *pixels = (u32*)surface->pixels;

    for (int i = 0; i < 38400; i++) {
        pixels[i] = framebuffer[i];
    }

    if (SDL_MUSTLOCK(surface)) {
        SDL_UnlockSurface(surface);
    }

    SDL_Texture *texture = SDL_CreateTextureFromSurface(renderer, surface);

    SDL_RenderClear(renderer);
    SDL_RenderCopy(renderer, texture, NULL, NULL);
    SDL_RenderPresent(renderer);
    SDL_DestroyTexture(texture);

    if (!syncing_save) {
        auto last_write_time = fs::last_write_time(save_path);

        if (last_write_time > last_sync_time) {
            last_sync_time = last_write_time;
            syncing_save = true;

            EM_ASM({
                FS.syncfs(false, () => {
                    Module.setValue($0, false, 'i8');
                });
            }, &syncing_save);
        }
    }
}

int main(int argc, char *argv[]) {
    SDL_Init(SDL_INIT_VIDEO);
    SDL_CreateWindowAndRenderer(240, 160, 0, &window, &renderer);

    surface = SDL_CreateRGBSurface(0, 240, 160, 32, 0, 0, 0, 0);

    auto config = std::make_shared<nba::PlatformConfig>();

    config->video_dev = std::make_shared<Screen>();
    config->audio_dev = std::make_shared<nba::SDL2_AudioDevice>();
    config->input_dev = input_dev;

    auto core = nba::CreateCore(config);

    auto rom_path = fs::path{argv[1]};
    save_path = "saves" / fs::path{argv[1]}.replace_extension(".sav");

    auto save_type = config->cartridge.backup_type;

    auto force_gpio = nba::GPIODeviceType::None;

    if (config->cartridge.force_rtc) {
        force_gpio = force_gpio | nba::GPIODeviceType::RTC;
    }

    if (config->cartridge.force_solar_sensor) {
        force_gpio = force_gpio | nba::GPIODeviceType::SolarSensor;
    }

    switch (nba::BIOSLoader::Load(core, "bios.bin")) {
        case nba::BIOSLoader::Result::CannotFindFile:
            std::cerr << "Cannot find BIOS file" << std::endl;
            return -1;

        case nba::BIOSLoader::Result::CannotOpenFile:
            std::cerr << "Cannot open BIOS file" << std::endl;
            return -1;

        case nba::BIOSLoader::Result::BadImage:
            std::cerr << "Bad BIOS image" << std::endl;
            return -1;

        case nba::BIOSLoader::Result::Success:
            break;
    }

    switch (nba::ROMLoader::Load(core, rom_path, save_path, save_type, force_gpio)) {
        case nba::ROMLoader::Result::CannotFindFile:
            std::cerr << "Cannot find ROM file" << std::endl;
            return -1;

        case nba::ROMLoader::Result::CannotOpenFile:
            std::cerr << "Cannot open ROM file" << std::endl;
            return -1;

        case nba::ROMLoader::Result::BadImage:
            std::cerr << "Bad ROM image" << std::endl;
            return -1;

        case nba::ROMLoader::Result::Success:
            break;
    }

    auto emu_thread = std::make_unique<nba::EmulatorThread>(core);
    emu_thread->Start();

    emscripten_set_main_loop(frame, 0, 1);
}

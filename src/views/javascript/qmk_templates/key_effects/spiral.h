#ifndef DISABLE_RGB_MATRIX_CLOCKWISE_SOLID_SNAKE
RGB_MATRIX_EFFECT(CLOCKWISE_SPIRAL)
#    ifdef RGB_MATRIX_CUSTOM_EFFECT_IMPLS

#        include "color.h"

// 0, 15, 86, 7, 16, 31, 75, 64, 34, 47, 62, 52

//                | edge start                                                                                                                                     | edge end
uint8_t keys[] = {103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 32, 49, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 63, 50, 33, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 48, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 51, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52};

uint8_t prev_time = 0;
uint8_t dist_time = 45;
bool    dir       = true;
Color   CLOCKWISE_SPIRAL_math(Color base_color, Color anim_color, int16_t dx, int16_t dy, uint8_t time, uint8_t lid) {
    // uint8_t lid
    uint32_t mytime = g_rgb_counters.tick * get_anim_speed() / 20.0;
    // uint16_t mytime = scale16by8(g_rgb_counters.tick, rgb_matrix_config.speed / 8);
    bool     fowards = true;
    uint8_t key = 0;
    uint8_t t_length = 3 / get_anim_speed();

    for (int i = 0; i < t_length; i++) {
        fowards = ((mytime - i) % 238) > 119;
        key     = fowards ? (mytime - i) % 119 : 119 - (mytime - i) % 119;
        if (lid == 1 && lid == keys[key] && key == 119) {
            continue;
        }
        if (lid == keys[key]) return anim_color;
    }

    return base_color;
}

bool CLOCKWISE_SPIRAL(effect_params_t* params) { return my_effect_runner_dx_dy(params, &CLOCKWISE_SPIRAL_math); }

#    endif  // RGB_MATRIX_CUSTOM_EFFECT_IMPLS
#endif      // DISABLE_RGB_MATRIX_CLOCKWISE_SPIRAL

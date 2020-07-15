#include "color.h"

//Layer Coloring

REPLACE_WITH_LAYER_COLOR

LidLayer LidLayers[LAYER_COUNT] = {

REPLACE_WITH_LAYER_ARRAYS

    // [_BASE] = { L_BASE, //this number represents the length of the following array
    //     _BASE_Colors
    // },
    // [_MEDIA] = { L_MEDIA, //this number represents the length of the following array
    //     _MEDIA_Colors
    // },
    // [_TYPELIGHT] = { L_TYPELIGHT, //this number represents the length of the following array
    //     _TYPELIGHT_Colors
    // },
    // [_GAME] = { L_GAME, //this number represents the length of the following array
    //     _GAME_Colors
    // },
    // [_CSGO] = { L_CSGO,
    //     _CSGO_Colors
    // },
    // [_MUSE] = { L_MUSE, 
    //     _MUSE_Colors
    // }
};


Color get_lid_color(uint8_t lid) {
    int lo, mi, hi;
    LidColor* c = LidLayers[g_top_layer].layer;
    hi = LidLayers[g_top_layer].length - 1;
    lo = 0;
    while (hi >= lo) {
        mi = (hi - lo) / 2 + lo;
        if (c[mi].start_lid <= lid && c[mi].start_lid+c[mi].length-1 >= lid) return c[mi].color;
        if (c[mi].start_lid > lid) hi = mi - 1;
        else lo = mi + 1;
    }
    return lid < EDGE_LED_START ? (Color)BLACK : (Color)C_BASE;
}

void rgb_set_color_at(int lid, Color color) {
    float b = get_brightness();
    rgb_matrix_set_color(lid, color.r * b, color.g * b, color.b * b);
}

// bool my_effect_runner_reactive(uint8_t start, effect_params_t* params, my_reactive_effect_f effect_func) {
//     RGB_MATRIX_USE_LIMITS(led_min, led_max);

//     uint8_t count = g_last_hit_tracker.count;
//     for (uint8_t i = led_min; i < led_max; i++) {
//         RGB_MATRIX_TEST_LED_FLAGS();
//         Color rgb = get_lid_color(i);
//         for (uint8_t j = start; j < count; j++) {
//             uint8_t  lid  = g_last_hit_tracker.index[j];
//             int16_t  dx   = g_led_config.point[i].x - g_last_hit_tracker.x[j];
//             int16_t  dy   = g_led_config.point[i].y - g_last_hit_tracker.y[j];
//             uint8_t  dist = sqrt16(dx * dx + dy * dy);
//             uint16_t tick = g_last_hit_tracker.tick[j];
//             if (g_heldKeys[lid]) tick = 0;
//             else tick = scale16by8(tick - g_releaseTime[lid], rgb_matrix_config.speed);
//             rgb = effect_func(rgb, (j + (g_colorOffset ? 1 : 0)) % 2 ? (Color)C_TYPING : (Color)GREEN, dx, dy, dist, tick);
//         }
//         rgb_set_color_at(i, rgb);
//         // rgb_matrix_set_color(i, rgb.r, rgb.g, rgb.b);
//     }
//     return led_max < DRIVER_LED_TOTAL;
// }

bool my_effect_runner_reactive(uint8_t start, effect_params_t* params, my_reactive_effect_f effect_func) {
    RGB_MATRIX_USE_LIMITS(led_min, led_max);

    uint8_t count = g_animDataLength;
    for (uint8_t i = led_min; i < led_max; i++) {
        RGB_MATRIX_TEST_LED_FLAGS();
        Color rgb;
        if (i > 86 && edge_mode == 0) rgb = (Color)BLACK;
        else rgb = get_lid_color(i);
        for (uint8_t j = start; j < count; j++) {
            uint32_t tick_pressed = g_rgb_counters.tick - g_animData[j].pressed_time;
            uint32_t tick_released = tick_pressed - g_animData[j].held_time;
            bool     held = g_animData[j].held;
            if (!held && (tick_released) > 20000) continue;
            uint8_t  lid  = g_animData[j].lid;
            Color    c    = g_animData[j].color;
            int16_t  dx   = g_led_config.point[i].x - g_led_config.point[lid].x;
            int16_t  dy   = g_led_config.point[i].y - g_led_config.point[lid].y;
            uint8_t  dist = sqrt16(dx * dx + dy * dy);
            tick_pressed  = (uint32_t)(tick_pressed * (rgb_matrix_config.speed / 255.0));
            tick_released = (uint32_t)(tick_released * (rgb_matrix_config.speed / 255.0));
            rgb = effect_func(rgb, c, dx, dy, dist, tick_pressed, tick_released, held);
        }
        rgb_set_color_at(i, rgb);
    }
    return led_max < DRIVER_LED_TOTAL;
}

int pritned = 0;
bool my_effect_runner_dx_dy(effect_params_t* params, my_dx_dy_f effect_func) {
    RGB_MATRIX_USE_LIMITS(led_min, led_max);

    uint8_t time = scale16by8(g_rgb_counters.tick, rgb_matrix_config.speed / 2);
    for (uint8_t i = led_min; i < led_max; i++) {
        Color rgb;
        if (i > 86 && edge_mode == 0) rgb = (Color)BLACK;
        else rgb = get_lid_color(i);
        int16_t dx   = g_led_config.point[i].x - k_rgb_matrix_center.x;
        int16_t dy   = g_led_config.point[i].y - k_rgb_matrix_center.y;
        RGB hi = hsv_to_rgb(rgb_matrix_config.hsv);
        // if (pritned++ == 0){
            // dprintf("h:%d, s:%d\n", rgb_matrix_config.hsv.h, rgb_matrix_config.hsv.s);
        // }
        rgb  = effect_func(rgb, (Color){hi.r, hi.g, hi.b}, dx, dy, time, i);
        rgb_set_color_at(i, rgb);
    }
    return led_max < DRIVER_LED_TOTAL;
}


bool equal_colors(Color *c1, Color *c2) {
    return c1->r == c2->r && c1->g == c2->g && c1->b == c2->b;
}

Color change_bright(Color c, float bright) {
    bright = bright > 1 ? 1 : bright;
    c.r = c.r* bright;
    c.g = c.g* bright;
    c.b = c.b* bright;
    return c;
}
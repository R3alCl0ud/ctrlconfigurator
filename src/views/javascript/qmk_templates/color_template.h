#ifndef R3ALCL0UD_COLOR_H
#define R3ALCL0UD_COLOR_H

#include QMK_KEYBOARD_H
#include "layer_names.h"
#include <print.h>
#include "lib/lib8tion/lib8tion.h"

typedef struct color {
    uint8_t r;
    uint8_t g;
    uint8_t b;
} Color;

typedef struct lidcolor {
    uint8_t  start_lid;
    int   length;
    Color color;
} LidColor;

typedef struct lidlayer {
    int      length;
    LidColor* layer;
} LidLayer;

typedef struct animdata {
    uint32_t pressed_time;
    uint32_t held_time;
    uint8_t  lid;
    Color    color;
    bool     held;
} AnimData;

#define hex_to_color(a) {(a >> 16) & 255, (a >> 8) & 255, a & 255}
#define get_brightness() (rgb_matrix_config.hsv.v / 255.0)
#define get_anim_speed() (rgb_matrix_config.speed / 255.0)

#define EDGE_LED_START 87
#define EDGE_LED_COUNT 32

// COLORS duh...

#define C_BASE {0x00, 0xE5, 0xFF} // default layer
#define C_HIGHLIGHT {0x00, 0xf5, 0x10} // green that caps and scroll were originally planned to use
#define C_MEDIA {0xcc, 0x00, 0xf5} // media layer color
#define C_TYPE {0x00, 0xf5, 0x10} // green for lightnig controls layer
#define C_TYPING {0xFF, 0x00, 0x4D} // typing color?

#define BLACK  {0, 0, 0}
#define YELLOW {0xFF, 0xFF, 0}
#define RED    {0xFF, 0, 0}
#define GREEN  {0, 0xFF, 0}
#define BLUE   {0, 0, 0xFF}
#define MAGENTA {0xFF, 0, 0xFF}
#define PURPLE {0xC8, 0, 0x99}
#define WHITE  {0xFF, 0xFF, 0xFF}

#define CSGORANGE hex_to_color(0xb26f26)
#define C_MUSE    {0xF3, 0x0A, 0x79}

LidLayer LidLayers[LAYER_COUNT];

REPLACE_COLOR_COUNTS

typedef Color (*my_reactive_effect_f)(Color base_color, Color anim_color, int16_t dx, int16_t dy, uint8_t dist, uint32_t tick_pressed, uint32_t tick_released, bool held);
typedef Color (*my_dx_dy_f)(Color base_color, Color anim_color, int16_t dx, int16_t dy, uint8_t time, uint8_t lid);

Color get_lid_color(uint8_t lid);
bool my_effect_runner_reactive(uint8_t start, effect_params_t* params, my_reactive_effect_f effect_func);
bool my_effect_runner_dx_dy(effect_params_t* params, my_dx_dy_f effect_func);
void rgb_set_color_at(int lid, Color color);
bool equal_colors(Color *c1, Color *c2);
Color change_bright(Color c, float bright);

extern int g_top_layer;
extern AnimData g_animData[LED_HITS_TO_REMEMBER];
extern uint8_t g_animDataLength;
extern int edge_mode;
extern const point_t k_rgb_matrix_center;
#endif //R3ALCL0UD_COLOR_H
#ifdef RGB_MATRIX_KEYREACTIVE_ENABLED
#    if !defined(DISABLE_RGB_MATRIX_SOLID_RIPPLE) || !defined(DISABLE_RGB_MATRIX_SOLID_MULTIRIPPLE)

#        ifndef DISABLE_RGB_MATRIX_SOLID_RIPPLE
RGB_MATRIX_EFFECT(SOLID_RIPPLE)
#        endif

#        ifndef DISABLE_RGB_MATRIX_SOLID_MULTIRIPPLE
RGB_MATRIX_EFFECT(SOLID_MULTIRIPPLE)
#        endif

#        ifdef RGB_MATRIX_CUSTOM_EFFECT_IMPLS

#include "color.h"

Color SOLID_RIPPLE_math(Color base_color, Color anim_color, int16_t dx, int16_t dy, uint8_t dist, uint32_t tick_pressed, uint32_t tick_released, bool held) {
    uint16_t effect = (tick_pressed / 2) - dist;
    if (effect > 0 && effect < 64) {
        uint8_t weight = abs(effect - 32) << 3;
        uint8_t inv_weight = qsub8(255, weight);
        base_color.r = qadd8(scale16by8(anim_color.r, inv_weight), scale16by8(base_color.r, weight));
        base_color.g = qadd8(scale16by8(anim_color.g, inv_weight), scale16by8(base_color.g, weight));
        base_color.b = qadd8(scale16by8(anim_color.b, inv_weight), scale16by8(base_color.b, weight));
    }
    return base_color;
}

#            ifndef DISABLE_RGB_MATRIX_SOLID_RIPPLE
bool SOLID_RIPPLE(effect_params_t* params) { return my_effect_runner_reactive(qsub8(g_animDataLength, 1), params, &SOLID_RIPPLE_math); }
#            endif

#            ifndef DISABLE_RGB_MATRIX_SOLID_MULTIRIPPLE
bool SOLID_MULTIRIPPLE(effect_params_t* params) { return my_effect_runner_reactive(0, params, &SOLID_RIPPLE_math); }
#            endif

#        endif  // RGB_MATRIX_CUSTOM_EFFECT_IMPLS
#    endif      // !defined(DISABLE_RGB_MATRIX_RIPPLE) && !defined(DISABLE_RGB_MATRIX_MULTIRIPPLE)
#endif
#ifdef RGB_MATRIX_KEYREACTIVE_ENABLED
#    if !defined(DISABLE_RGB_MATRIX_SOLID_FADEKEY) || !defined(DISABLE_RGB_MATRIX_SOLID_MULTIFADEKEY)

#        ifndef DISABLE_RGB_MATRIX_SOLID_FADEKEY
RGB_MATRIX_EFFECT(SOLID_FADEKEY)
#        endif

#        ifndef DISABLE_RGB_MATRIX_SOLID_MULTIFADEKEY
RGB_MATRIX_EFFECT(SOLID_MULTIFADEKEY)
#        endif

#        ifdef RGB_MATRIX_CUSTOM_EFFECT_IMPLS

#include "color.h"

Color SOLID_FADEKEY_math(Color base_color, Color anim_color, int16_t dx, int16_t dy, uint8_t dist, uint32_t tick_pressed, uint32_t tick_released, bool held) {
    if (dist > 0) return base_color;
    else if (held) return anim_color;
    else if (dist == 0 && !(tick_released >= 255)) {
        uint8_t weight = qsub8(255, tick_released);
        base_color.r = qadd8(scale16by8(anim_color.r, weight), scale16by8(base_color.r, tick_released));
        base_color.g = qadd8(scale16by8(anim_color.g, weight), scale16by8(base_color.g, tick_released));
        base_color.b = qadd8(scale16by8(anim_color.b, weight), scale16by8(base_color.b, tick_released));
    }
    return base_color;
}

#            ifndef DISABLE_RGB_MATRIX_SOLID_FADEKEY
bool SOLID_FADEKEY(effect_params_t* params) { return my_effect_runner_reactive(qsub8(g_animDataLength, 1), params, &SOLID_FADEKEY_math); }
#            endif

#            ifndef DISABLE_RGB_MATRIX_SOLID_MULTIFADEKEY
bool SOLID_MULTIFADEKEY(effect_params_t* params) { return my_effect_runner_reactive(0, params, &SOLID_FADEKEY_math); }
#            endif

#        endif  // RGB_MATRIX_CUSTOM_EFFECT_IMPLS
#    endif      // !defined(DISABLE_RGB_MATRIX_FADEKEY) && !defined(DISABLE_RGB_MATRIX_MULTIFADEKEY)
#endif
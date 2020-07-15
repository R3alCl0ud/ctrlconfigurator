#include "keymap.h"
    
int edge_mode = 0;

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    [_BASE] = LAYOUT(
        KC_ESC, KC_F1, KC_F2, KC_F3, KC_F4, KC_F5, KC_F6, KC_F7, KC_F8, KC_F9, KC_F10, KC_F11, KC_F12,            KC_PSCR, KC_SLCK, KC_PAUS, \
        KC_GRV, KC_1, KC_2, KC_3, KC_4, KC_5, KC_6, KC_7, KC_8, KC_9, KC_0, KC_MINS, KC_EQL, KC_BSPC,   KC_INS, KC_HOME, KC_PGUP, \
        KC_TAB, KC_Q, KC_W, KC_E, KC_R, KC_T, KC_Y, KC_U, KC_I, KC_O, KC_P, KC_LBRC, KC_RBRC, KC_BSLS,   KC_DEL, KC_END, KC_PGDN, \
        KC_CAPS, KC_A, KC_S, KC_D, KC_F, KC_G, KC_H, KC_J, KC_K, KC_L, KC_SCLN, KC_QUOT, KC_ENT, \
        KC_LSFT, KC_Z, KC_X, KC_C, KC_V, KC_B, KC_N, KC_M, KC_COMM, KC_DOT, KC_SLSH, KC_RSFT,                              KC_UP, \
        KC_LCTL, KC_LGUI, KC_LALT,                   KC_SPACE,                            KC_RALT, MO(_MEDIA), KC_APP, KC_RCTL,            KC_LEFT, KC_DOWN, KC_RGHT \
    ),
    [_MEDIA] = LAYOUT(
        TO(_BASE), DBG_TOG, _______, _______, _______, KC_MUTE, _______, KC_VOLD, KC_VOLU, KC_MSTP, KC_MPRV, KC_MPLY, KC_MNXT,            _______, _______, _______, \
        _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______,   _______, _______, _______, \
        _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, MO(_TYPELIGHT), _______, _______, _______,   _______, _______, _______, \
        _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, \
        _______, _______, _______, _______, _______, MD_BOOT, NK_TOGG, _______, _______, _______, _______, _______,                              _______, \
        _______, TOG_GUI, _______,                   _______,                            _______, _______, _______, _______,            _______, _______, _______ \
    ),
    [_TYPELIGHT] = LAYOUT(
        _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______,            _______, _______, _______, \
        _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______, _______,   _______, _______, _______, \
        _______, RGB_VAI, SUS_UP, DEC_UP, RGB_SPI, EDG_MUP, _______, _______, _______, _______, _______, _______, _______, _______,   _______, _______, _______, \
        _______, RGB_VAD, SUS_DN, DEC_DN, RGB_SPD, EDG_MDN, _______, _______, _______, _______, _______, _______, _______, \
        _______, RGB_TOG, RGB_MOD, _______, _______, _______, _______, _______, _______, _______, _______, _______,                              RGB_SAI, \
        _______, _______, _______,                   _______,                            _______, _______, _______, _______,            RGB_HUI, RGB_SAD, RGB_HUD \
    )
};    

// ------------------------------------------------------------------------------------------------------ //
// functions are second class citizens, they go at the back of the code. specifically below this line:    //
// ------------------------------------------------------------------------------------------------------ //

uint8_t row_colm_to_lid(uint8_t row, uint8_t column) {
    static int lidLayout[11][8] = {{0,  1,  2,  3,  4,  5,  6,  7},      //
                                   {16, 17, 18, 19, 20, 21, 22, 23},  //
                                   {33, 34, 35, 36, 37, 38, 39, 40},  //
                                   {50, 51, 52, 53, 54, 55, 56, 57},  //
                                   {63, 64, 65, 66, 67, 68, 69, 70},  //
                                   {76, 77, 78, 79, 80, 81, 82, 83},  //
                                   {8,  9,  10, 11, 12, 13, 14, 15},    //
                                   {24, 25, 26, 27, 28, 29, 30, 31},  //
                                   {41, 42, 43, 44, 45, 46, 47, 48},  //
                                   {58, 59, 60, 61, 62, 75, 49, 32},  //
                                   {71, 72, 73, 74, 84, 85, 86, NO_LED}};
    return lidLayout[row][column];
}

layer_state_t layer_state_set_user(layer_state_t state) {
    g_top_layer = get_highest_layer(state);
    g_active_layers = state;
    return state;
}

// LED (caps lock, scroll lock, etc) state changes.
bool led_update_user(led_t led_state) {
    g_led_state = led_state;
    return true;
}

void sort_LidColor_list(LidColor list[], int length) {
    int i, j;
    int smallest = 0;
    LidColor tmp;
    for (i = 0; i < length; ++i) {
        smallest = i;
        for (j = i+1; j < length; j++) {
            if (list[j].start_lid < list[smallest].start_lid) smallest = j;
        }
        if (smallest != i) {
            tmp = list[i];
            list[i] = list[smallest];
            list[smallest] = tmp;
        }
    }
}

// Runs just one time when the keyboard initializes.
void matrix_init_user(void) {
    g_enableGUI = true;
    g_top_layer = 0;
    g_active_layers = 1;
    g_animDataLength = 0;

    sort_LidColor_list(LidLayers[_BASE].layer, L_BASE);
    sort_LidColor_list(LidLayers[_MEDIA].layer, L_MEDIA);
    sort_LidColor_list(LidLayers[_TYPELIGHT].layer, L_TYPELIGHT);
    sort_LidColor_list(LidLayers[_GAME].layer, L_GAME);
    sort_LidColor_list(LidLayers[_CSGO].layer, L_CSGO);
    sort_LidColor_list(LidLayers[_MUSE].layer, L_MUSE);
    
    if (rgb_matrix_config.hsv.h != 120) {
        rgb_matrix_sethsv_noeeprom(176, 255, 255);
    }
    if (rgb_matrix_config.mode != 3) {
        rgb_matrix_mode_noeeprom(3);  // sets animation shit I guess, was told to put comment here, will need to change if more bullshit animations are added
    }
}

// Runs constantly in the background, in a loop.
void matrix_scan_user(void) {
}

void rgb_matrix_indicators_user(void) {
    if (rgb_matrix_get_flags() == LED_FLAG_NONE) return;
    int i;

    if (edge_mode > 1) {
        for (i = EDGE_LED_START; i < EDGE_LED_START + EDGE_LED_COUNT; i++) {
            rgb_set_color_at(i, (Color)BLACK);
        }
    }

    if (rgb_matrix_get_flags() != (LED_FLAG_KEYLIGHT | LED_FLAG_MODIFIER)) {
        i = ((int)(g_rgb_counters.tick * get_anim_speed() / 20.0) % 32);
        switch (edge_mode) {
            case 2:
                rgb_set_color_at(87 + i, get_lid_color(87 + i));
                rgb_set_color_at(87 + ((i - 1) % 32), get_lid_color(87 + ((i - 1) % 32)));
                rgb_set_color_at(87 + ((i - 2) % 32), get_lid_color(87 + ((i - 2) % 32)));
                break;
            case 3:
                rgb_set_color_at(87 + i, (87 + i) % 2 ? (Color)RED : (Color)GREEN);
                rgb_set_color_at(87 + ((i - 1) % 32), (87 + ((i - 1) % 32)) % 2 ? (Color)RED : (Color)GREEN);
                rgb_set_color_at(87 + ((i - 2) % 32), (87 + ((i - 2) % 32)) % 2 ? (Color)RED : (Color)GREEN);
                break;
            case 1:
            default:
                break;
        }
    }

    if (rgb_matrix_get_flags() == LED_FLAG_UNDERGLOW) return;

    //CAPS LOCK Coloring
    if (g_led_state.caps_lock) {
        rgb_set_color_at(50, (Color)C_TYPING);
    }
    //SCROLL LOCK Coloring
    if (g_led_state.scroll_lock) {
        rgb_set_color_at(14, (Color)C_TYPING);
    }
    //windows key unlit if toggled off
    if (!g_enableGUI) {
        rgb_set_color_at(77, (Color)BLACK);
    }
    //_MEDIA Toggle WINDOWS key
    if (g_top_layer == _MEDIA || g_top_layer == _TYPELIGHT || g_top_layer == _CSGO) {
        rgb_set_color_at(77, g_enableGUI  ? (Color)GREEN : (Color)RED);
    }
    
}

// Color animate_color(uint8_t this_lid, uint8_t pressed_lid, uint32_t time_since_press, Color main_color, Color active_color) {
//     Color new_color;
//     float weight = (time_since_press / (2000.0 * get_anim_speed() + 1));
//     weight = weight > 1 ? 1 : weight;
//     if (this_lid == pressed_lid) {
//         new_color.r = (uint8_t) (main_color.r * weight + active_color.r * (1.0 - weight));
//         new_color.r = (uint8_t) (main_color.g * weight + active_color.g * (1.0 - weight));
//         new_color.r = (uint8_t) (main_color.b * weight + active_color.b * (1.0 - weight));
//     } else {
//         new_color = main_color;
//     }
//     return new_color;
// }

// void fade_key(uint8_t lid, Color type_color, Color base_color) {
//     AnimKey *key = &(_ANIM_KEYS[lid]);
//     uint32_t dt  = (g_rgb_counters.tick - key->time);
//     if (key->is_held) {
//         return rgb_set_color_at(lid, type_color);
//     } else if (key->time == 0 || dt > 5000) {
//         return rgb_set_color_at(lid, base_color);
//     } else {
//         float speed = (rgb_matrix_config.speed / 255.0);
//         if (((TYPE_SUSTAIN + TYPE_DECAY)) > (dt * speed)) {
//             float weight = (dt * speed) / ((TYPE_SUSTAIN + TYPE_DECAY));
//             int newR = (int) ((type_color.r * (1.0 - weight)) + (base_color.r * weight));
//             int newG = (int) ((type_color.g * (1.0 - weight)) + (base_color.g * weight));
//             int newB = (int) ((type_color.b * (1.0 - weight)) + (base_color.b * weight));
//             return rgb_set_color_at(lid, (Color) {newR, newG, newB});
//         } else {
//             if (equal_colors(&(Color)BLACK, &base_color)) return; // return early instead of redrawing black to the LED
//             return rgb_set_color_at(lid, base_color);
//         }
//     }
// }

void shift_array(AnimData arr[], uint8_t len) {
    for (uint8_t i = 1; i < len; i++) {
        arr[i-1] = arr[i];
    }
}

bool process_record_user(uint16_t keycode, keyrecord_t* record) {
    static uint32_t key_timer;
    uint8_t lid = row_colm_to_lid(record->event.key.row, record->event.key.col);
    if (record->event.pressed) {
        if (g_animDataLength < LED_HITS_TO_REMEMBER) {
            g_animData[g_animDataLength].pressed_time = g_rgb_counters.tick;
            g_animData[g_animDataLength].held = true;
            g_animData[g_animDataLength].lid = lid;
            g_colorOffset = !g_colorOffset;
            g_animData[g_animDataLength].color = g_colorOffset ? (Color)C_TYPING : (Color)GREEN;
            g_animDataLength++;
        } else {
            shift_array(g_animData, g_animDataLength);
            g_animData[g_animDataLength - 1].pressed_time = g_rgb_counters.tick;
            g_animData[g_animDataLength - 1].held = true;
            g_animData[g_animDataLength - 1].lid = lid;
            g_colorOffset = !g_colorOffset;
            g_animData[g_animDataLength - 1].color = g_colorOffset ? (Color)C_TYPING : (Color)GREEN;
        }
    } else {
        for (int i = g_animDataLength - 1; i >= 0; i--) {
            if (g_animData[i].lid == lid && g_animData[i].held) {
                g_animData[i].held = false;
                g_animData[i].held_time = g_rgb_counters.tick - g_animData[i].pressed_time;
                break;
            }
        }
    }

    switch (keycode) {
        case U_T_AUTO:
            if (record->event.pressed && MODS_SHIFT && MODS_CTRL) {
                TOGGLE_FLAG_AND_PRINT(usb_extra_manual, "USB extra port manual mode");
            }
            return false;
        case U_T_AGCR:
            if (record->event.pressed && MODS_SHIFT && MODS_CTRL) {
                TOGGLE_FLAG_AND_PRINT(usb_gcr_auto, "USB GCR auto mode");
            }
            return false;
        case DBG_TOG:
            if (record->event.pressed) {
                TOGGLE_FLAG_AND_PRINT(debug_enable, "Debug mode");
            }
            return false;
        case DBG_MTRX:
            if (record->event.pressed) {
                TOGGLE_FLAG_AND_PRINT(debug_matrix, "Debug matrix");
            }
            return false;
        case DBG_KBD:
            if (record->event.pressed) {
                TOGGLE_FLAG_AND_PRINT(debug_keyboard, "Debug keyboard");
            }
            return false;
        case DBG_MOU:
            if (record->event.pressed) {
                TOGGLE_FLAG_AND_PRINT(debug_mouse, "Debug mouse");
            }
            return false;
        case MD_BOOT:
            if (record->event.pressed) {
                key_timer = timer_read32();
            } else {
                if (timer_elapsed32(key_timer) >= 500) {
                    reset_keyboard();
                }
            }
            return false;
        case EDG_MUP:
            if (record->event.pressed) {
                edge_mode = (edge_mode + 1) % EDGE_MODES;
            }
            return false;
        case EDG_MDN:
            if (record->event.pressed) {
                edge_mode = (edge_mode + (EDGE_MODES - 1)) % EDGE_MODES;
            }
            return false;
        case RGB_TOG:
            if (record->event.pressed) {
                switch (rgb_matrix_get_flags()) {
                    case LED_FLAG_ALL: {
                        rgb_matrix_set_flags(LED_FLAG_KEYLIGHT | LED_FLAG_MODIFIER);
                        rgb_matrix_set_color_all(0, 0, 0);
                    } break;
                    case LED_FLAG_KEYLIGHT | LED_FLAG_MODIFIER: {
                        rgb_matrix_set_flags(LED_FLAG_UNDERGLOW);
                        rgb_matrix_set_color_all(0, 0, 0);
                    } break;
                    case LED_FLAG_UNDERGLOW: {
                        rgb_matrix_set_flags(LED_FLAG_NONE);
                        rgb_matrix_disable_noeeprom();
                    } break;
                    default: {
                        rgb_matrix_set_flags(LED_FLAG_ALL);
                        rgb_matrix_enable_noeeprom();
                    } break;
                }
            }
            return false;
        case TOG_GUI:
            if (record->event.pressed) {
                g_enableGUI = !g_enableGUI;
            }
            // keypress_rgb_stuff(keycode, record);
            return false;
        case KC_LGUI:
        case KC_RGUI:
            if (!g_enableGUI) return false;
        default:
            if (record->event.pressed) {
                dprintf("Lid: %i\nAnim Speed = %d\nconfig.HSV.h: %d", row_colm_to_lid(record->event.key.row, record->event.key.col), rgb_matrix_config.speed,rgb_matrix_config.hsv.h);
                // dprintf("");
            }
            return true;  // Process all other keycodes normally
    }
}
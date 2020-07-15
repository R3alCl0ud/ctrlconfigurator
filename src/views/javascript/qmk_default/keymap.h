#include QMK_KEYBOARD_H
#include <print.h>

#include "color.h"

#define MODS_SHIFT (get_mods() & MOD_MASK_SHIFT)
#define MODS_CTRL (get_mods() & MOD_MASK_CTRL)
#define MODS_ALT (get_mods() & MOD_MASK_ALT)

enum ctrl_keycodes {
    U_T_AUTO = SAFE_RANGE,  // USB Extra Port Toggle Auto Detect / Always Active
    U_T_AGCR,               // USB Toggle Automatic GCR control
    DBG_TOG,                // DEBUG Toggle On / Off
    DBG_MTRX,               // DEBUG Toggle Matrix Prints
    DBG_KBD,                // DEBUG Toggle Keyboard Prints
    DBG_MOU,                // DEBUG Toggle Mouse Prints
    MD_BOOT,                // Restart into bootloader after hold timeout
    DEC_UP,                 // Increase decay
    DEC_DN,                 // Decrease decay
    SUS_UP,                 // Increase sustain
    SUS_DN,                 // Decrease Sustain
    TOG_GUI,                // Toggle windows/super key
    EDG_MUP,
    EDG_MDN
};

// typedef struct animkey {
//     uint32_t time;
//     bool is_held;
// } AnimKey;

// typedef struct animationlayer {
//     uint8_t lid;
//     uint32_t start_time_5ms;
//     struct animationlayer *next;
//     struct animationlayer *prev;
// } AnimationLayer;

// typedef struct animationlayers {
//     int length;
//     AnimationLayer *HEAD;
// } AnimationLayers;



#define TYPE_SUSTAIN 200
#define TYPE_DECAY 100

#define EDGE_MODES 4

AnimData        g_animData[LED_HITS_TO_REMEMBER];
uint8_t         g_animDataLength;
bool            g_colorOffset;


bool            g_enableGUI;
int             g_top_layer;
led_t           g_led_state;
keymap_config_t keymap_config;
layer_state_t   g_active_layers;
//AnimationLayers g_animations;

//def functions
bool          ghpprocess_record_user(uint16_t keycode, keyrecord_t* record);
bool          led_update_user(led_t led_state);
void          matrix_init_user(void);
void          matrix_scan_user(void);
layer_state_t layer_state_set_user(layer_state_t state);

//our functions
uint8_t row_colm_to_lid(uint8_t row, uint8_t column);
void sort_LidColor_list(LidColor list[], int length);
// Color animate_color(uint8_t this_lid, uint8_t pressed_lid, uint32_t time_since_press, Color main_color, Color active_color);
// void fade_key(uint8_t lid, Color type_color, Color base_color);
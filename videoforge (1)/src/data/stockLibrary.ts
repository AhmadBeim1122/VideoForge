export interface StockItem {
  id: string;
  shortName: string; // "Stock 01" ... "Stock 38"
  fullName: string;
  color: string;
  gradient?: string;
  category: 'Solid' | 'Studio' | 'Vibrant' | 'Dark' | 'Pastel';
}

// 38 Bundled Ready-Made Backgrounds
export const STOCK_BACKGROUNDS: StockItem[] = [
  { id: 'stock_01', shortName: 'Stock 01', fullName: 'solid_charcoal_noir_matte_v1.png', color: '#18181B', category: 'Dark' },
  { id: 'stock_02', shortName: 'Stock 02', fullName: 'deep_cyber_slate_studio_dark.png', color: '#0F172A', category: 'Dark' },
  { id: 'stock_03', shortName: 'Stock 03', fullName: 'forge_signature_amber_yellow.png', color: '#FFC800', category: 'Vibrant' },
  { id: 'stock_04', shortName: 'Stock 04', fullName: 'studio_clean_neutral_white.png', color: '#FAFAFA', category: 'Studio' },
  { id: 'stock_05', shortName: 'Stock 05', fullName: 'warm_travertine_ivory_creme.png', color: '#F5F5F0', category: 'Studio' },
  { id: 'stock_06', shortName: 'Stock 06', fullName: 'crimson_scarlet_bold_punch.png', color: '#EF4444', category: 'Vibrant' },
  { id: 'stock_07', shortName: 'Stock 07', fullName: 'electric_sky_cobalt_blue.png', color: '#3B82F6', category: 'Vibrant' },
  { id: 'stock_08', shortName: 'Stock 08', fullName: 'emerald_nordic_pine_green.png', color: '#10B981', category: 'Vibrant' },
  { id: 'stock_09', shortName: 'Stock 09', fullName: 'violet_synthwave_sunset_deep.png', color: '#8B5CF6', category: 'Vibrant' },
  { id: 'stock_10', shortName: 'Stock 10', fullName: 'fuchsia_magenta_cyber_pulse.png', color: '#D946EF', category: 'Vibrant' },
  { id: 'stock_11', shortName: 'Stock 11', fullName: 'monochrome_pure_pitch_black.png', color: '#000000', category: 'Dark' },
  { id: 'stock_12', shortName: 'Stock 12', fullName: 'deep_space_indigo_midnight.png', color: '#1E1B4B', category: 'Dark' },
  { id: 'stock_13', shortName: 'Stock 13', fullName: 'rich_espresso_dark_timber.png', color: '#271C19', category: 'Dark' },
  { id: 'stock_14', shortName: 'Stock 14', fullName: 'bordeaux_wine_lux_velvet.png', color: '#4A044E', category: 'Dark' },
  { id: 'stock_15', shortName: 'Stock 15', fullName: 'petrol_marine_abyss_teal.png', color: '#042F2E', category: 'Dark' },
  { id: 'stock_16', shortName: 'Stock 16', fullName: 'sunset_orange_radiant_heat.png', color: '#F97316', category: 'Vibrant' },
  { id: 'stock_17', shortName: 'Stock 17', fullName: 'cyber_lime_high_contrast.png', color: '#84CC16', category: 'Vibrant' },
  { id: 'stock_18', shortName: 'Stock 18', fullName: 'cyan_aqua_bright_lagoon.png', color: '#06B6D4', category: 'Vibrant' },
  { id: 'stock_19', shortName: 'Stock 19', fullName: 'bubblegum_rose_blush_vivid.png', color: '#F43F5E', category: 'Vibrant' },
  { id: 'stock_20', shortName: 'Stock 20', fullName: 'warm_apricot_golden_sun.png', color: '#FBBF24', category: 'Vibrant' },
  { id: 'stock_21', shortName: 'Stock 21', fullName: 'mist_cool_gray_editorial.png', color: '#E2E8F0', category: 'Studio' },
  { id: 'stock_22', shortName: 'Stock 22', fullName: 'concrete_industrial_stone.png', color: '#94A3B8', category: 'Studio' },
  { id: 'stock_23', shortName: 'Stock 23', fullName: 'graphite_steel_anodized.png', color: '#475569', category: 'Studio' },
  { id: 'stock_24', shortName: 'Stock 24', fullName: 'paper_parchment_warm_fiber.png', color: '#E7E5E4', category: 'Studio' },
  { id: 'stock_25', shortName: 'Stock 25', fullName: 'powder_sky_serene_soft.png', color: '#BAE6FD', category: 'Pastel' },
  { id: 'stock_26', shortName: 'Stock 26', fullName: 'sage_matcha_soft_herb.png', color: '#BBF7D0', category: 'Pastel' },
  { id: 'stock_27', shortName: 'Stock 27', fullName: 'lavender_dream_soft_lilac.png', color: '#DDD6FE', category: 'Pastel' },
  { id: 'stock_28', shortName: 'Stock 28', fullName: 'peach_blossom_gentle_glow.png', color: '#FED7AA', category: 'Pastel' },
  { id: 'stock_29', shortName: 'Stock 29', fullName: 'butter_lemon_soft_cream.png', color: '#FEF08A', category: 'Pastel' },
  { id: 'stock_30', shortName: 'Stock 30', fullName: 'millennial_pink_cashmere.png', color: '#FECDD3', category: 'Pastel' },
  { id: 'stock_31', shortName: 'Stock 31', fullName: 'gradient_dark_ember_aurora.png', color: '#1E1B4B', gradient: 'linear-gradient(135deg, #1E1B4B, #3B0764)', category: 'Dark' },
  { id: 'stock_32', shortName: 'Stock 32', fullName: 'gradient_twilight_hyperdrive.png', color: '#0F172A', gradient: 'linear-gradient(135deg, #0F172A, #1E293B)', category: 'Dark' },
  { id: 'stock_33', shortName: 'Stock 33', fullName: 'gradient_warm_citrus_burst.png', color: '#EA580C', gradient: 'linear-gradient(135deg, #EA580C, #FBBF24)', category: 'Vibrant' },
  { id: 'stock_34', shortName: 'Stock 34', fullName: 'gradient_deep_oceanic_trench.png', color: '#0C4A6E', gradient: 'linear-gradient(135deg, #0C4A6E, #0284C7)', category: 'Vibrant' },
  { id: 'stock_35', shortName: 'Stock 35', fullName: 'gradient_synth_tokyo_night.png', color: '#4C1D95', gradient: 'linear-gradient(135deg, #4C1D95, #BE185D)', category: 'Vibrant' },
  { id: 'stock_36', shortName: 'Stock 36', fullName: 'gradient_monochrome_silver.png', color: '#334155', gradient: 'linear-gradient(135deg, #334155, #64748B)', category: 'Studio' },
  { id: 'stock_37', shortName: 'Stock 37', fullName: 'gradient_golden_hour_dusk.png', color: '#78350F', gradient: 'linear-gradient(135deg, #78350F, #D97706)', category: 'Studio' },
  { id: 'stock_38', shortName: 'Stock 38', fullName: 'gradient_arctic_glacier_chill.png', color: '#0E7490', gradient: 'linear-gradient(135deg, #0E7490, #38BDF8)', category: 'Studio' },
];

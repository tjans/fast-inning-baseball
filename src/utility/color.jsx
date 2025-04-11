export function darkenHexColor(hex, percent) {
    // Helper function to convert hex to RGB
    function hexToRgb(hex) {
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Helper function to convert RGB to hex
    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join('');
    }

    // Helper function to darken RGB values
    function darkenRgb(r, g, b, percent) {
        const t = percent / 100;
        return {
            r: Math.round(r * (1 - t)),
            g: Math.round(g * (1 - t)),
            b: Math.round(b * (1 - t))
        };
    }

    // Convert hex to RGB
    let rgb = hexToRgb(hex);
    if (!rgb) {
        throw new Error('Invalid hex color format');
    }

    // Darken the RGB values
    let darkenedRgb = darkenRgb(rgb.r, rgb.g, rgb.b, percent);

    // Convert darkened RGB back to hex
    return rgbToHex(darkenedRgb.r, darkenedRgb.g, darkenedRgb.b);
}
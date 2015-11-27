'use strict';

/**
 * Fusion deux objets entre eux
 * @param (object) a
 * @param (object) b
 * @return object
 */
function extend(a, b) {
    var c = {};
    for(var p in a) c[p] = (b[p] == null) ? a[p] : b[p];
    return c;
}

/**
 * Calcul la position de l'élement
 * @param (object) obj
 * return object
 */
function offset(obj) {
    var ol = 0,
        ot = 0;
    if (obj.offsetParent) {
        do {
            ol += obj.offsetLeft;
            ot += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return {
        left: ol,
        top: ot
    };
}
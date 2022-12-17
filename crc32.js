/*_____________________________________________________________________________
 │                                                                            |
 │ COPYRIGHT (C) 2022 Mihai Baneu                                             |
 │                                                                            |
 | Permission is hereby  granted,  free of charge,  to any person obtaining a |
 | copy of this software and associated documentation files (the "Software"), |
 | to deal in the Software without restriction,  including without limitation |
 | the rights to  use, copy, modify, merge, publish, distribute,  sublicense, |
 | and/or sell copies  of  the Software, and to permit  persons to  whom  the |
 | Software is furnished to do so, subject to the following conditions:       |
 |                                                                            |
 | The above  copyright notice  and this permission notice  shall be included |
 | in all copies or substantial portions of the Software.                     |
 |                                                                            |
 | THE SOFTWARE IS PROVIDED  "AS IS",  WITHOUT WARRANTY OF ANY KIND,  EXPRESS |
 | OR   IMPLIED,   INCLUDING   BUT   NOT   LIMITED   TO   THE  WARRANTIES  OF |
 | MERCHANTABILITY,  FITNESS FOR  A  PARTICULAR  PURPOSE AND NONINFRINGEMENT. |
 | IN NO  EVENT SHALL  THE AUTHORS  OR  COPYRIGHT  HOLDERS  BE LIABLE FOR ANY |
 | CLAIM, DAMAGES OR OTHER LIABILITY,  WHETHER IN AN ACTION OF CONTRACT, TORT |
 | OR OTHERWISE, ARISING FROM,  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR  |
 | THE USE OR OTHER DEALINGS IN THE SOFTWARE.                                 |
 |____________________________________________________________________________|
 |                                                                            |
 |  Author: Mihai Baneu                           Last modified: 16.Dec.2022  |
 |                                                                            |
 |___________________________________________________________________________*/

 /**
  * Add a byte to the CRC32 calculation. Pico version of this as described in:
  * https://forums.raspberrypi.com/viewtopic.php?t=310479
  * @param {*} crc the previous crc value
  * @param {*} byt the next byte to be added
  * @returns the new crc
  */
function crc32_add_byte(crc, byt)
{
    var b = byt << 24;
    for (n = 8; n; n--, b <<= 1)
        crc = (crc << 1) ^ (((crc ^ b) & 0x80000000) ? 0x04C11DB7 : 0);
    return crc;
}

/**
 * Calculate the CRC32 over a byte array.
 * @param {*} data array containing the crc bytes
 * @returns the crc
 */
function crc32(data) {
    var crc = 0xFFFFFFFF;
    var splitted = Array();

    for (var i = 0; i < data.length; i++)
        crc = crc32_add_byte(crc, data[i])

        Array.prototype.push32 = function (num) {
            this.push((num >> 24) & 0xFF,
                      (num >> 16) & 0xFF,
                      (num >>  8) & 0xFF,
                      (num      ) & 0xFF  );
        };

    splitted.push((crc      ) & 0xFF,
                  (crc >>  8) & 0xFF,
                  (crc >> 16) & 0xFF,
                  (crc >> 24) & 0xFF);

    return splitted;
}

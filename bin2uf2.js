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
 |  Author: Mihai Baneu                           Last modified: 30.Dec.2022  |
 |                                                                            |
 |___________________________________________________________________________*/

const UF2_MAGIC_START0            = 0x0A324655;
const UF2_MAGIC_START1            = 0x9E5D5157;
const UF2_MAGIC_END               = 0x0AB16F30;
const UF2_FLAG_NOT_MAIN_FLASH     = 0x00000001;
const UF2_FLAG_FILE_CONTAINER     = 0x00001000;
const UF2_FLAG_FAMILY_ID_PRESENT  = 0x00002000;
const UF2_FLAG_MD5_PRESENT        = 0x00004000;
const RP2040_FAMILY_ID            = 0xe48bff56;

function push_32bit(block, data)
{
    block.push( (data      ) & 0xFF,
                (data >>  8) & 0xFF,
                (data >> 16) & 0xFF,
                (data >> 24) & 0xFF);
}

function create_uf2_block(data, target_address, block_no, num_blocks)
{
    var block = [];

    push_32bit(block, UF2_MAGIC_START0);
    push_32bit(block, UF2_MAGIC_START1);
    push_32bit(block, UF2_FLAG_FAMILY_ID_PRESENT);
    push_32bit(block, target_address);
    push_32bit(block, 256);
    push_32bit(block, block_no);
    push_32bit(block, num_blocks);
    push_32bit(block, RP2040_FAMILY_ID);

    for (var i = 0; i < data.length; i++) {
        block.push(data[i] & 0xFF);
    }

    for (var i = 0; i < 476 - data.length; i++) {
        block.push(0);
    }

    push_32bit(block, UF2_MAGIC_END);

    return block;
}

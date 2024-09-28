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
 
RP {
    condition: false

    targetCoreCount:  '2'     // dual core
    targetCoreType:   '0'     // M0+
    targetRam:        '4'     // floor(log2(256k / 16k))
    targetFlash:      '0'     // floor(log2(0 / 16k))

    sizeofRam:        264*1024

    seriesAsmFlags: [
        '-mcpu=cortex-m0plus',
        '-mlittle-endian',
        '-mthumb'
    ]

    seriesCFlags: [
        '-mcpu=cortex-m0plus',
        '-mlittle-endian',
        '-mthumb'
    ]

    seriesCxxFlags: [
        '-mcpu=cortex-m0plus',
        '-mlittle-endian',
        '-mthumb'
    ]

    seriesLinkerFlags: [
        '-mcpu=cortex-m0plus',
        '-mlittle-endian',
        '-mthumb'
    ]

}

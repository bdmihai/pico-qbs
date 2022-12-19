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

var BinaryFile = require('qbs.BinaryFile');
var Process    = require('qbs.Process');
var Checksum   = require('crc32.js');

function prepareAssembler(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.pico.asmFlags);
    flags = flags.uniqueConcat(product.pico.seriesAsmFlags);
    flags = flags.uniqueConcat(product.pico.targetAsmFlags);

    var defines = [];
    defines = defines.uniqueConcat(product.pico.defines);
    defines = defines.uniqueConcat(product.pico.seriesDefines);
    defines = defines.uniqueConcat(product.pico.targetDefines);

    var includePaths = [];
    includePaths = includePaths.uniqueConcat(product.pico.includePaths);
    includePaths = includePaths.uniqueConcat(product.pico.seriesIncludePaths);
    includePaths = includePaths.uniqueConcat(product.pico.targetIncludePaths);

    var args = flags;
    args = args.concat(defines.map(function(define) { return '-D' + define }));
    includePaths.forEach(function(path) { args.push('-I', path); });
    args.push('-x', 'assembler-with-cpp');
    args.push('-c', input.filePath);
    args.push('-o', output.filePath);

    var cmd = new Command(product.pico.assemblerPath, args);
    cmd.workingDirectory = product.sourceDirectory;
    cmd.description = 'assembling ' + input.fileName;
    cmd.highlight = 'compiler';
    cmd.jobPool = 'compiler';
    return cmd;
}


function prepareCompiler(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.pico.cFlags);
    flags = flags.uniqueConcat(product.pico.seriesCFlags);
    flags = flags.uniqueConcat(product.pico.targetCFlags);

    var defines = [];
    defines = defines.uniqueConcat(product.pico.defines);
    defines = defines.uniqueConcat(product.pico.seriesDefines);
    defines = defines.uniqueConcat(product.pico.targetDefines);

    var includePaths = [];
    includePaths = includePaths.uniqueConcat(product.pico.includePaths);
    includePaths = includePaths.uniqueConcat(product.pico.seriesIncludePaths);
    includePaths = includePaths.uniqueConcat(product.pico.targetIncludePaths);

    var args = flags;
    args = args.concat(defines.map(function(define) { return '-D' + define }));
    includePaths.forEach(function(path) { args.push('-I', path); });
    args.push('-c', input.filePath);
    args.push('-o', output.filePath);

    var cmd = new Command(product.pico.compilerPath, args);
    cmd.workingDirectory = product.sourceDirectory;
    cmd.description = 'compiling ' + input.fileName;
    cmd.highlight = 'compiler';
    cmd.jobPool = 'compiler';
    return cmd;
}

function prepareCxxCompiler(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.pico.cxxFlags);
    flags = flags.uniqueConcat(product.pico.seriesCxxFlags);
    flags = flags.uniqueConcat(product.pico.targetCxxFlags);

    var defines = [];
    defines = defines.uniqueConcat(product.pico.defines);
    defines = defines.uniqueConcat(product.pico.seriesDefines);
    defines = defines.uniqueConcat(product.pico.targetDefines);

    var includePaths = [];
    includePaths = includePaths.uniqueConcat(product.pico.includePaths);
    includePaths = includePaths.uniqueConcat(product.pico.seriesIncludePaths);
    includePaths = includePaths.uniqueConcat(product.pico.targetIncludePaths);

    var args = flags;
    args = args.concat(defines.map(function(define) { return '-D' + define }));
    includePaths.forEach(function(path) { args.push('-I', path); });
    args.push('-c', input.filePath);
    args.push('-o', output.filePath);

    var cmd = new Command(product.pico.cxxCompilerPath, args);
    cmd.description = 'compiling ' + input.fileName;
    cmd.highlight = 'compiler';
    cmd.jobPool = 'compiler';
    return cmd;
}

function prepareArchiver(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.pico.archiverFlags);
    flags = flags.uniqueConcat(product.pico.seriesArchiverFlags);
    flags = flags.uniqueConcat(product.pico.targetArchiverFlags);

    var args = [flags.join(''), output.filePath];
    args = args.concat(inputs.obj.map(function(obj) { return obj.filePath }));

    var cmd = new Command(product.pico.archiverPath, args);
    cmd.description = 'archiving ' + output.fileName;
    cmd.highlight = 'linker';
    cmd.jobPool = 'linker';
    return cmd;
}

function prepareAppLinker(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.pico.linkerFlags);
    flags = flags.uniqueConcat(product.pico.seriesLinkerFlags);
    flags = flags.uniqueConcat(product.pico.targetLinkerFlags);

    var libraryPaths = [];
    libraryPaths = libraryPaths.uniqueConcat(product.pico.libraryPaths);
    libraryPaths = libraryPaths.uniqueConcat(product.pico.seriesLibraryPaths);
    libraryPaths = libraryPaths.uniqueConcat(product.pico.targetLibraryPaths);

    var libraries = [];
    libraries = libraries.uniqueConcat(product.pico.libraries);
    libraries = libraries.uniqueConcat(product.pico.seriesLibraries);
    libraries = libraries.uniqueConcat(product.pico.targetLibraries);

    var args = flags;
    args = args.concat(libraryPaths.map(function(path) { return '-L' + path }));
    args = args.concat('-L' + product.destinationDirectory);
    args = args.concat(libraries.map(function(lib) { return '-l' + lib }));
    args.push('-Wl,--start-group');
    args = args.concat(inputs.lib.map(function(lib) { return '-l' + lib.baseName.substr(3, lib.baseName.length) }));
    args.push('-Wl,--end-group');
    args = args.concat(inputs.linkerscript.map(function(linkerscript) { return '-Wl,-T' + linkerscript.filePath }));
    args.push('-o', outputs.app[0].filePath);
    args.push('-Wl,-Map=' + outputs.map[0].filePath);

    var commands = [];
    var cmd = new Command(product.pico.compilerPath, args); // use the compiler for the final linking
    cmd.description = 'linking ' + outputs.app[0].fileName;
    cmd.highlight = 'linker';
    cmd.jobPool = 'linker';
    commands.push(cmd);

    args = ['-O', 'binary', outputs.app[0].filePath, outputs.bin[0].filePath];
    var cmd = new Command(product.pico.objcopyPath, args); // generate the binary file
    cmd.description = 'generating binary file for flashing ' + outputs.bin[0].fileName;
    cmd.highlight = 'linker';
    cmd.jobPool = 'linker';
    commands.push(cmd);

    args = [/*'-Ax',*/ outputs.app[0].filePath];
    var cmd = new Command(product.pico.sizePath, args); // show the size of the executable total
    cmd.jobPool = 'linker';
    cmd.silent = true;
    commands.push(cmd);

    var cmd = new JavaScriptCommand();
    cmd.silent = true;
    cmd.sourceCode = function() {
        var p = new Process();
        try {
            args = ['--radix=x', outputs.app[0].filePath];
            p.exec(product.pico.nmPath, args, true);
            var lines = p.readStdOut().trim().split(/\r?\n/g);
            var tags = ['__data_start', '__data_end', '__text_start', '__text_end', '__rodata_start', '__rodata_end', '__bss_start', '__bss_end', '__heap_start', '__heap_end', '__stack_start', '__stack_end' ], symbols = [];
            lines.forEach(function(line) {
                //console.info(line);
                items = line.trim().split(' ');
                if (tags.some(function(tag) { return items.contains(tag); })) {
                    symbols.push({ name: items[2], value: parseInt(items[0], 16) });
                }
            });
            //symbols.forEach(function(tag) {
            //    console.info(tag.name + ' = ' + tag.value);
            //});
            console.info('Target device ' + product.pico.targetFamily + product.pico.targetType + product.pico.targetCore + product.pico.targetLine + product.pico.targetPins + product.pico.targetFlash);
            console.info('  .text   (FLASH)         =  ' + (symbols.filter(function(item) { return item.name === '__text_end'})[0].value - symbols.filter(function(item) { return item.name === '__text_start'})[0].value));
            console.info('  .rodata (FLASH)         =  ' + (symbols.filter(function(item) { return item.name === '__rodata_end'})[0].value - symbols.filter(function(item) { return item.name === '__rodata_start'})[0].value));
            console.info('  .data   (RAM,FLASH)     =  ' + (symbols.filter(function(item) { return item.name === '__data_end'})[0].value - symbols.filter(function(item) { return item.name === '__data_start'})[0].value));
            console.info('  .bss    (RAM)           =  ' + (symbols.filter(function(item) { return item.name === '__bss_end'})[0].value - symbols.filter(function(item) { return item.name === '__bss_start'})[0].value));
            console.info('  .heap   (RAM)           =  ' + (symbols.filter(function(item) { return item.name === '__heap_end'})[0].value - symbols.filter(function(item) { return item.name === '__heap_start'})[0].value));
            console.info('  .stack  (RAM)           =  ' + (symbols.filter(function(item) { return item.name === '__stack_end'})[0].value - symbols.filter(function(item) { return item.name === '__stack_start'})[0].value));
        } finally {
            p.close();
        }
    };
    commands.push(cmd);

    return commands;
}

function prepareBootLinker(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.pico.linkerFlags);
    flags = flags.uniqueConcat(product.pico.seriesLinkerFlags);
    flags = flags.uniqueConcat(product.pico.targetLinkerFlags);

    var libraryPaths = [];
    libraryPaths = libraryPaths.uniqueConcat(product.pico.libraryPaths);
    libraryPaths = libraryPaths.uniqueConcat(product.pico.seriesLibraryPaths);
    libraryPaths = libraryPaths.uniqueConcat(product.pico.targetLibraryPaths);

    var libraries = [];
    libraries = libraries.uniqueConcat(product.pico.libraries);
    libraries = libraries.uniqueConcat(product.pico.seriesLibraries);
    libraries = libraries.uniqueConcat(product.pico.targetLibraries);

    var args = flags;
    args = args.concat(libraryPaths.map(function(path) { return '-L' + path }));
    args = args.concat('-L' + product.destinationDirectory);
    args = args.concat(libraries.map(function(lib) { return '-l' + lib }));
    args.push('-Wl,--start-group');
    args = args.concat(inputs.lib.map(function(lib) { return '-l' + lib.baseName.substr(3, lib.baseName.length) }));
    args.push('-Wl,--end-group');
    args = args.concat(inputs.linkerscript.map(function(linkerscript) { return '-Wl,-T' + linkerscript.filePath }));
    args.push('-o', outputs.boot[0].filePath);
    args.push('-Wl,-Map=' + outputs.map[0].filePath);

    var commands = [];
    var cmd = new Command(product.pico.compilerPath, args); // use the compiler for the final linking
    cmd.description = 'linking ' + outputs.boot[0].fileName;
    cmd.highlight = 'linker';
    cmd.jobPool = 'linker';
    commands.push(cmd);

    args = ['-O', 'binary', outputs.boot[0].filePath, outputs.bin[0].filePath];
    var cmd = new Command(product.pico.objcopyPath, args); // generate the binary file
    cmd.description = 'generating binary file for flashing ' + outputs.bin[0].fileName;
    cmd.highlight = 'linker';
    cmd.jobPool = 'linker';
    commands.push(cmd);

    args = ['-O', 'binary', outputs.boot[0].filePath, outputs.bin[0].filePath];
    var cmd = new JavaScriptCommand();
    cmd.description = 'patching binary file for flashing ' + outputs.bin[0].fileName;
    cmd.input = outputs.bin[0].filePath;
    cmd.output = outputs.bin[0].filePath;
    cmd.sourceCode = function() {
        /* read the binary containing the program */
        var infile = BinaryFile(input, BinaryFile.ReadOnly);
        var data = infile.read(252);
        infile.close();

        /* write back to the file */
        var outfile = BinaryFile(output, BinaryFile.ReadWrite);
        outfile.seek(252);
        outfile.write(Checksum.crc32(data));
        outfile.close();
    };
    cmd.jobPool = 'linker';
    commands.push(cmd);

    args = [/*'-Ax',*/ outputs.boot[0].filePath];
    var cmd = new Command(product.pico.sizePath, args); // show the size of the executable total
    cmd.jobPool = 'linker';
    cmd.silent = true;
    commands.push(cmd);

    var cmd = new JavaScriptCommand();
    cmd.silent = true;
    cmd.sourceCode = function() {
        var p = new Process();
        try {
            args = ['--radix=x', outputs.boot[0].filePath];
            p.exec(product.pico.nmPath, args, true);
            var lines = p.readStdOut().trim().split(/\r?\n/g);
            var tags = ['__text_start', '__text_end', '__data_start', '__data_end'], symbols = [];
            lines.forEach(function(line) {
                items = line.trim().split(' ');
                if (tags.some(function(tag) { return items.contains(tag); })) {
                    symbols.push({ name: items[2], value: parseInt(items[0], 16) });
                }
            });

            console.info('Target device ' + product.pico.targetFamily + product.pico.targetCoreCount + product.pico.targetCoreType + product.pico.targetRam + product.pico.targetFlash + '-' + product.pico.targetSerialFlash);
            console.info('  .text   (BOOT2)   =  ' + (symbols.filter(function(item) { return item.name === '__text_end'})[0].value - symbols.filter(function(item) { return item.name === '__text_start'})[0].value));
            console.info('  .data   (CRC)     =  ' + (symbols.filter(function(item) { return item.name === '__data_end'})[0].value - symbols.filter(function(item) { return item.name === '__data_start'})[0].value));
        } finally {
            p.close();
        }
    };
    commands.push(cmd);

    return commands;
}

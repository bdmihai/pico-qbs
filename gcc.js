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
 |  Author: Mihai Baneu                           Last modified: 20.Dec.2022  |
 |                                                                            |
 |___________________________________________________________________________*/

var BinaryFile = require('qbs.BinaryFile');
var Process    = require('qbs.Process');
var Checksum   = require('crc32.js');
var Bin2UF2    = require('bin2uf2.js');

function prepareAssembler(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.rp.asmFlags);
    flags = flags.uniqueConcat(product.rp.seriesAsmFlags);
    flags = flags.uniqueConcat(product.rp.targetAsmFlags);

    var defines = [];
    defines = defines.uniqueConcat(product.rp.defines);
    defines = defines.uniqueConcat(product.rp.seriesDefines);
    defines = defines.uniqueConcat(product.rp.targetDefines);

    var includePaths = [];
    includePaths = includePaths.uniqueConcat(product.rp.includePaths);
    includePaths = includePaths.uniqueConcat(product.rp.seriesIncludePaths);
    includePaths = includePaths.uniqueConcat(product.rp.targetIncludePaths);

    var args = flags;
    args.push('-x', 'assembler-with-cpp');
    args = args.concat(defines.map(function(define) { return '-D' + define }));
    includePaths.forEach(function(path) { args.push('-I', path); });
    args.push('-c', input.filePath);
    args.push('-o', output.filePath);

    var cmd = new Command(product.rp.assemblerPath, args);
    cmd.workingDirectory = product.sourceDirectory;
    cmd.description = 'assembling ' + input.fileName;
    cmd.highlight = 'compiler';
    cmd.jobPool = 'compiler';
    return cmd;
}

function prepareCompiler(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.rp.cFlags);
    flags = flags.uniqueConcat(product.rp.seriesCFlags);
    flags = flags.uniqueConcat(product.rp.targetCFlags);

    var defines = [];
    defines = defines.uniqueConcat(product.rp.defines);
    defines = defines.uniqueConcat(product.rp.seriesDefines);
    defines = defines.uniqueConcat(product.rp.targetDefines);

    var includePaths = [];
    includePaths = includePaths.uniqueConcat(product.rp.includePaths);
    includePaths = includePaths.uniqueConcat(product.rp.seriesIncludePaths);
    includePaths = includePaths.uniqueConcat(product.rp.targetIncludePaths);

    var args = flags;
    args = args.concat(defines.map(function(define) { return '-D' + define }));
    includePaths.forEach(function(path) { args.push('-I', path); });
    args.push('-c', input.filePath);
    args.push('-o', output.filePath);

    var cmd = new Command(product.rp.compilerPath, args);
    cmd.workingDirectory = product.sourceDirectory;
    cmd.description = 'compiling ' + input.fileName;
    cmd.highlight = 'compiler';
    cmd.jobPool = 'compiler';
    return cmd;
}

function prepareCxxCompiler(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.rp.cxxFlags);
    flags = flags.uniqueConcat(product.rp.seriesCxxFlags);
    flags = flags.uniqueConcat(product.rp.targetCxxFlags);

    var defines = [];
    defines = defines.uniqueConcat(product.rp.defines);
    defines = defines.uniqueConcat(product.rp.seriesDefines);
    defines = defines.uniqueConcat(product.rp.targetDefines);

    var includePaths = [];
    includePaths = includePaths.uniqueConcat(product.rp.includePaths);
    includePaths = includePaths.uniqueConcat(product.rp.seriesIncludePaths);
    includePaths = includePaths.uniqueConcat(product.rp.targetIncludePaths);

    var args = flags;
    args = args.concat(defines.map(function(define) { return '-D' + define }));
    includePaths.forEach(function(path) { args.push('-I', path); });
    args.push('-c', input.filePath);
    args.push('-o', output.filePath);

    var cmd = new Command(product.rp.cxxCompilerPath, args);
    cmd.description = 'compiling ' + input.fileName;
    cmd.highlight = 'compiler';
    cmd.jobPool = 'compiler';
    return cmd;
}

function prepareArchiver(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.rp.archiverFlags);
    flags = flags.uniqueConcat(product.rp.seriesArchiverFlags);
    flags = flags.uniqueConcat(product.rp.targetArchiverFlags);

    var args = [flags.join(''), output.filePath];
    args = args.concat(inputs.obj.map(function(obj) { return obj.filePath }));

    var cmd = new Command(product.rp.archiverPath, args);
    cmd.description = 'archiving ' + output.fileName;
    cmd.highlight = 'linker';
    cmd.jobPool = 'linker';
    return cmd;
}

function prepareAppLinker(project, product, inputs, outputs, input, output, explicitlyDependsOn) {
    var flags = [];
    flags = flags.uniqueConcat(product.rp.linkerFlags);
    flags = flags.uniqueConcat(product.rp.seriesLinkerFlags);
    flags = flags.uniqueConcat(product.rp.targetLinkerFlags);

    var libraryPaths = [];
    libraryPaths = libraryPaths.uniqueConcat(product.rp.libraryPaths);
    libraryPaths = libraryPaths.uniqueConcat(product.rp.seriesLibraryPaths);
    libraryPaths = libraryPaths.uniqueConcat(product.rp.targetLibraryPaths);

    var libraries = [];
    libraries = libraries.uniqueConcat(product.rp.libraries);
    libraries = libraries.uniqueConcat(product.rp.seriesLibraries);
    libraries = libraries.uniqueConcat(product.rp.targetLibraries);

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
    var cmd = new Command(product.rp.compilerPath, args); // use the compiler for the final linking
    cmd.description = 'linking ' + outputs.app[0].fileName;
    cmd.highlight = 'linker';
    cmd.jobPool = 'linker';
    commands.push(cmd);

    args = ['-O', 'binary', '--keep-section=.boot2', outputs.app[0].filePath, outputs.bin[0].filePath];
    var cmd = new Command(product.rp.objcopyPath, args); // generate the binary file
    cmd.description = 'generating binary file for flashing ' + outputs.bin[0].fileName;
    cmd.highlight = 'linker';
    cmd.jobPool = 'linker';
    commands.push(cmd);

    var cmd = new JavaScriptCommand();
    cmd.description = 'patching binary file for flashing ' + outputs.bin[0].fileName;
    cmd.input = outputs.bin[0].filePath;
    cmd.output = outputs.bin[0].filePath;
    cmd.sourceCode = function() {
        /* read the binary containing the program */
        var infile = BinaryFile(input, BinaryFile.ReadOnly);
        var data = infile.read(252);
        infile.close();

        var crc = Checksum.crc32(data);

        /* write back to the file */
        var outfile = BinaryFile(output, BinaryFile.ReadWrite);
        outfile.seek(252);
        outfile.write(crc);
        outfile.close();
    };
    cmd.jobPool = 'linker';
    commands.push(cmd);

    var cmd = new JavaScriptCommand();
    cmd.description = 'creating UF2 file from binary file for flashing ' + outputs.uf2[0].fileName;
    cmd.input = outputs.bin[0].filePath;
    cmd.output = outputs.uf2[0].filePath;
    cmd.sourceCode = function() {
        var infile = BinaryFile(input, BinaryFile.ReadOnly);
        var outfile = BinaryFile(output, BinaryFile.WriteOnly);
        var target_address = 0x10000000;
        var num_blocks = Math.floor(infile.size() / 256) + ((infile.size() % 256) ? 1 : 0);

        for (var block_no = 0; block_no < num_blocks; block_no++, target_address += 256) {
            /* read the binary containing the program */
            var data = infile.read(256);

            /* build a standard rp2040 uf2 block */
            var block = Bin2UF2.create_uf2_block(data, target_address, block_no, num_blocks);

            /* write back to the uf2 file */
            outfile.write(block);
        }
        
        infile.close();
        outfile.close();        
    };
    cmd.jobPool = 'linker';
    commands.push(cmd);

    args = [/*'-Ax',*/ outputs.app[0].filePath];
    var cmd = new Command(product.rp.sizePath, args); // show the size of the executable total
    cmd.jobPool = 'linker';
    cmd.silent = true;
    commands.push(cmd);

    var cmd = new JavaScriptCommand();
    cmd.silent = true;
    cmd.sourceCode = function() {
        const p = new Process();
        try {
            args = ['--format=sysv', '--radix=10', outputs.app[0].filePath];
            p.exec(product.rp.sizePath, args, true);
            const lines = p.readStdOut().trim().split(/\r?\n/g);
            const sectionList  = [ 
                { name: '.boot2',      type: 'FLASH,RAM'},
                { name: '.text',       type: 'FLASH'},
                { name: '.rodata',     type: 'FLASH' },
                { name: '.data',       type: 'FLASH,RAM'},
                { name: '.bss',        type: 'RAM,0'},
                { name: '.heap',       type: 'RAM'},
                { name: '.stack0',     type: 'RAM'},
                { name: '.stack1',     type: 'RAM'}
            ];
            var ramSize = 0; flashSize = 0;
            
            console.info(outputs.app[0].filePath);
            lines.forEach(function(line) {
                items = line.trim().split(' ').filter(function(i) {return i} );

                sectionList.forEach(function(section) {
                    if (section.name === items[0]) {
                        section.size = items[1]
                        section.start = parseInt(items[2], 10).toString(16);
                        section.end = (parseInt(items[2], 10) + parseInt(items[1], 10)).toString(16);

                        console.info(
                            '   ' + section.name + 
                            ' '.repeat(18 - section.name.length) + '(' + section.type + ')' + 
                            ' '.repeat(10 - section.type.length) + '= ' + 
                            ' '.repeat(8 - section.size.length) + section.size + 
                            ' '.repeat(6) + '0x' + '0'.repeat(8 - section.start.length) + section.start + ' - ' + '0x' + '0'.repeat(8 - section.end.length) + section.end);

                        if (section.type.contains('FLASH')) {
                            flashSize += parseInt(section.size, 10);
                        }
                        if (section.type.contains('RAM')) {
                            ramSize += parseInt(section.size, 10);
                        }
                    }
                });
            });

            console.info('Total used by ' + 
                product.rp.targetFamily + product.rp.targetCoreCount + product.rp.targetCoreType + product.rp.targetRam + product.rp.targetFlash + '-' + product.rp.targetSerialFlash + 
                ' (' + product.rp.sizeofFlash/(1024*1024) + 'MB, ' + product.rp.sizeofRam/1024 + 'kB): ' +
                flashSize + ' (' + Math.ceil(flashSize/product.rp.sizeofFlash * 100) + '% FLASH) and ' + 
                ramSize + ' (' + Math.ceil(ramSize/product.rp.sizeofRam * 100) + '% RAM) ');
        } finally {
            p.close();
        }
    };
    commands.push(cmd);

    return commands;
}

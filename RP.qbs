/*_____________________________________________________________________________
 │                                                                            |
 │ COPYRIGHT (C) 2023 Mihai Baneu                                             |
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
 |  Author: Mihai Baneu                           Last modified: 28.Jan.2023  |
 |                                                                            |
 |___________________________________________________________________________*/
 
import qbs.File
import qbs.FileInfo
import qbs.TextFile
import qbs.Utilities
import qbs.Probes
import qbs.ModUtils
import 'gcc.js' as Gcc
import 'pio.js' as Pio

Module {
    condition: false

    property string toolchainPrefix: 'arm-none-eabi-'

    property string assemblerName:        toolchainPrefix + 'gcc'
    property string compilerName:         toolchainPrefix + 'gcc'
    property string cxxCompilerName:      toolchainPrefix + 'c++'
    property string linkerName:           toolchainPrefix + 'ld'
    property string archiverName:         toolchainPrefix + 'ar'
    property string objcopyName:          toolchainPrefix + 'objcopy'
    property string objdumpName:          toolchainPrefix + 'objdump'
    property string sizeName:             toolchainPrefix + 'size'
    property string nmName:               toolchainPrefix + 'nm'

    property string toolchainPath: ''

    property string assemblerPath:        toolchainPath + assemblerName
    property string compilerPath:         toolchainPath + compilerName
    property string cxxCompilerPath:      toolchainPath + cxxCompilerName
    property string linkerPath:           toolchainPath + linkerName
    property string archiverPath:         toolchainPath + archiverName
    property string objcopyPath:          toolchainPath + objcopyName
    property string objdumpPath:          toolchainPath + objdumpName
    property string sizePath:             toolchainPath + sizeName
    property string nmPath:               toolchainPath + nmName

    Probes.PathProbe {
        id: pioasmProbe
        names: 'pioasm'
        searchPaths: [ FileInfo.cleanPath(project.sourceDirectory + '/../tools/pioasm/bin') ]
    }
    property string pioasmPath: pioasmProbe.found ? pioasmProbe.filePath : 'pioasm'

    property string targetFamily: 'RP'    // e.g.   - RP
    property string targetCoreCount       // e.g.   - 2   dual core
    property string targetCoreType        // e.g.   - 0   type of core e.g. M0+
    property string targetRam             // e.g.   - 4   floor(log2(ram / 16k)))
    property string targetFlash           // e.g.   - 0   floor(log2(nonvolatile / 16k))
    property string targetSerialFlash     // e.g.   - W25Q64JV (winbond 64 Mbit Quad SPI data flash)
    
    property int sizeofFlash: 0
    property int sizeofRam: 0

    property stringList defines
    property stringList seriesDefines
    property stringList targetDefines

    property pathList includePaths: [ product.buildDirectory + '/codegen/pioasm' ]
    property pathList seriesIncludePaths
    property pathList targetIncludePaths

    property stringList pioFlags
    property stringList seriesPioFlags
    property stringList targetPioFlags

    property stringList asmFlags: [
        '-ffunction-sections',
        '-fdata-sections',
        '-Og',
        '-ggdb'
    ]
    property stringList seriesAsmFlags
    property stringList targetAsmFlags

    property stringList cFlags: [
        '-std=gnu11',
        '-masm-syntax-unified',
        '-ffreestanding',
        '-ffunction-sections',
        '-fdata-sections',
        '-fstack-usage',
        '-Wall',
        '-Wextra',
        '-Og',
        '-ggdb'
    ]
    property stringList seriesCFlags
    property stringList targetCFlags

    property stringList cxxFlags: [
        '-std=gnu++17',
        '-masm-syntax-unified',
        '-ffunction-sections',
        '-fdata-sections',
        '-fstack-usage',
        '-fno-unwind-tables',
        '-fno-exceptions',
        '-fno-rtti',
        '-fno-threadsafe-statics',
        '-fno-use-cxa-atexit',
        '-Wall',
        '-Wextra',
        '-Og',
        '-ggdb'
    ]
    property stringList seriesCxxFlags
    property stringList targetCxxFlags

    property stringList archiverFlags: [ 
        'c', 
        'r' 
    ]
    property stringList seriesArchiverFlags
    property stringList targetArchiverFlags

    property stringList linkerFlags: [
        '-specs=nosys.specs',
        '-nostartfiles',
        '-nodefaultlibs',
        '-nolibc',
        '-nostdlib',
        '-Wl,--no-warn-rwx-segments', // disable the warning about rwx segments 
        '-Wl,--gc-sections',
        '-Og',
        '-ggdb'
    ]
    property stringList seriesLinkerFlags
    property stringList targetLinkerFlags

    property pathList libraryPaths
    property pathList seriesLibraryPaths
    property pathList targetLibraryPaths

    property stringList libraries
    property stringList seriesLibraries
    property stringList targetLibraries

    FileTagger {
        patterns: [ '*.pio' ]
        fileTags: ['pio']
    }

    FileTagger {
        patterns: [ '*.s', '*.S' ]
        fileTags: ['asm']
    }

    FileTagger {
        patterns: ['*.c']
        fileTags: ['c']
    }

    FileTagger {
        patterns: ['*.cpp', '*.cxx', '*.c++', '*.cc']
        fileTags: ['cpp']
    }

    FileTagger {
        patterns: ['*.h', '*.hpp', '*.hxx', '*.h++']
        fileTags: ['hpp']
    }

    FileTagger {
        patterns: ['*.a']
        fileTags: ['lib']
    }

    FileTagger {
        patterns: ['*.ld']
        fileTags: ['linkerscript']
    }

    Rule {
        name: 'pioasm'
        inputs: ['pio']

        Artifact {
            fileTags: ['hpp']
            filePath: FileInfo.joinPaths(product.buildDirectory, 'codegen/pioasm', FileInfo.relativePath(product.sourceDirectory, input.filePath) + '.h')
        }

        prepare: {
            return Pio.prepareGenerator.apply(Pio, arguments);
        }
    }

    Rule {
        name: 'assembler'
        inputs: ['asm']

        Artifact {
            fileTags: ['obj']
            filePath: FileInfo.joinPaths(Utilities.getHash(input.baseDir), input.fileName + '.o')
        }

        prepare: {
            return Gcc.prepareAssembler.apply(Gcc, arguments);
        }
    }

    Rule {
        name: 'compiler'
        inputs: ['c']
        explicitlyDependsOn: ['hpp']

        Artifact {
            fileTags: ['obj']
            filePath: FileInfo.joinPaths(Utilities.getHash(input.baseDir), input.fileName + '.o')
        }

        prepare: {
            return Gcc.prepareCompiler.apply(Gcc, arguments);
        }
    }

    Rule {
        name: 'cxxCompiler'
        inputs: ['cpp']
        explicitlyDependsOn: ['hpp']

        Artifact {
            fileTags: ['obj']
            filePath: FileInfo.joinPaths(Utilities.getHash(input.baseDir), input.fileName + '.o')
        }

        prepare: {
            return Gcc.prepareCxxCompiler.apply(Gcc, arguments);
        }
    }

    Rule {
        name: 'archiver'
        inputs: ['obj']
        multiplex: true

        Artifact {
            fileTags: ['lib']
            filePath: FileInfo.joinPaths(product.destinationDirectory, 'lib' + product.targetName + '.a')
        }

        prepare: {
            return Gcc.prepareArchiver.apply(Gcc, arguments);
        }
    }

    Rule {
        name: 'applinker'
        multiplex: true
        inputs: ['lib', 'linkerscript']
        inputsFromDependencies: ['lib', 'linkerscript']
        outputFileTags: ['app', 'map', 'bin', 'uf2']
        outputArtifacts: {
            var artifacts = [
                {
                    filePath: FileInfo.joinPaths(product.destinationDirectory, product.targetName + '.elf'),
                    fileTags: ['app']
                },
                {
                    filePath: FileInfo.joinPaths(product.destinationDirectory, product.targetName + '.map'),
                    fileTags: ['map']
                },
                {
                    filePath: FileInfo.joinPaths(product.destinationDirectory, product.targetName + '.bin'),
                    fileTags: ['bin']
                },
                {
                    filePath: FileInfo.joinPaths(product.destinationDirectory, product.targetName + '.uf2'),
                    fileTags: ['uf2']
                }
            ];
            return artifacts;
        }

        prepare: {
            return Gcc.prepareAppLinker.apply(Gcc, arguments);
        }
    }

    Scanner {
        inputs: ['linkerscript']
        recursive: true
        scan: {
            console.debug('scanning linkerscript ' + filePath + ' for dependencies');
            var retval = [];
            var linkerScript = new TextFile(filePath, TextFile.ReadOnly);
            var regexp = /[\s]*INCLUDE[\s]+(\S+).*/ // 'INCLUDE filename'
            var match;
            while (!linkerScript.atEof()) {
                match = regexp.exec(linkerScript.readLine());
                if (match) {
                    var dependencyFileName = match[1];
                    retval.push(dependencyFileName);
                    console.debug('linkerscript ' + filePath + ' depends on ' + dependencyFileName);
                }
            }
            linkerScript.close();
            return retval;
        }
        searchPaths: {
            var retval = [];
            for (var i = 0; i < (product.rp.libraryPaths || []).length; i++) {
                retval.push(product.rp.libraryPaths[i]);
                console.debug('linkerscript include added ' + product.rp.libraryPaths[i]);
            }
            var regexp = /[\s]*SEARCH_DIR[\s]*\((\S+)\).*/ // 'SEARCH_DIR(path)'
            var match;
            var linkerScript = new TextFile(input.filePath, TextFile.ReadOnly);
            while (!linkerScript.atEof()) {
                match = regexp.exec(linkerScript.readLine());
                if(match) {
                    var additionalPath = match[1];
                    // path can be quoted to use non-latin letters, remove quotes if present
                    if (additionalPath.startsWith('\"') && additionalPath.endsWith('\"'))
                        additionalPath = additionalPath.slice(1, additionalPath.length - 1);
                    retval.push(additionalPath);
                    console.debug('linkerscript include added ' + additionalPath);
                }
            }
            linkerScript.close();
            return retval;
        }
    }

    validate: {
        if (!pioasmProbe.found) {
            throw ModUtils.ModuleError(
                    'Could not find pioasm binary at any of the following locations:\n\t' +
                    pioasmProbe.candidatePaths.join('\n\t'));
        }
    }
}

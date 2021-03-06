// asy.js

// Assembler for logisim computer
const fs = require('fs');

const instructions = {
    NOP:     0,   // 0
    JMPI:    1,   // 1
    JMP:     2,   // 2
    JMPC:    3,   // 3
    JMPZ:    4,   // 4
    LDA:     5,   // 5
    LDAI:    6,   // 6
    LDB:     7,   // 7
    LDBI:    8,   // 8
    OUT:     9,   // 9
    ADDI:    10,   // a
    ADD:     11,   // b
    SUBI:    12,   // c
    SUB:     13,   // d
    STO:     14,   // e
    HLT:     15,   // f
}

// var keys = Object.keys(instructions);
// var values = Object.values(instructions).map(n => n.toString(16))

// var b16inst = {};
// keys.forEach((key, i) => b16inst[key] = values[i]);
//console.log(b16inst);

    // NOP: '0',
    // JMPI: '1',
    // JMP: '2',
    // JMPC: '3',
    // JMPZ: 'f',
    // LDAI: '4',
    // LDA: '5',
    // OUTA: '6',
    // LDBI: '7',
    // OUTI: '8',
    // OUT: '9',
    // ADDI: 'a',
    // ADD: 'b',
    // SUBI: 'c',
    // SUB: 'd',
    // STOI: 'e',
    // HLT: '1f'

let codes = '';
for(let i = 0; i<= 127; i++) {
    codes += (i + 127) + ' ' + i + "\n";
}
console.log(codes);


const power = `
# mantissa
255 3
# exponent
254 5
LDA 255
STOI 253
OUT 253
LDA 254
SUBI 1
STOI 250
LDA 255
SUBI 1
STOI 252
:start
LDA 252
STOI 251
:inner
LDA 253
ADD 255
STOI 253
LDA 251
SUBI 1
STOI 251
LDA 253
JMPZ next
JMPI inner
:next
OUT 253
STOI 255
LDA 250
SUBI 1
STOI 250
JMPZ end
JMPI start
:end
HLT
`

const divide = `
253 112
254 27
255 0
:start
LDA 253
SUB 254
JMPZ end
JMPC carryend
STOI 253
LDA 255
ADDI 1
STOI 255
OUT 255
JMPI start
:end
LDA 255
ADDI 1
STOI 255
OUT 255
HLT
:carryend
LDA 255
OUT 255
HLT
`;

const fibo = `
255 0
254 1
LDA 254
:start
ADD 255
JMPC end
STO 255
OUT 255
ADD 254
JMPC end
STO 254
OUT 254
JMPI start
:end
HLT
`;


const divisor = `
253 15
254 5
LDA 254
SUBI 1
STOI 255
:start
LDA 254
OUT 254
SUB 255
STOI 254
JMPC retry
JMPZ end
JMPI start
:end
LDA 255
OUT 255
HLT
:retry
LDA 253
STOI 254
LDA 255
SUBI 1
STOI 255
OUT 255
JMPI start
`;

const prime = `
253 11
254 11
LDA 254
SUBI 1
STOI 255
:start
LDA 254
OUT 254
JMPZ end
SUB 255
STOI 254
JMPC retry
JMPI start
:end
LDA 255
OUT 255
HLT
:retry
LDA 253
STOI 254
LDA 255
SUBI 1
STOI 255
OUT 255
JMPI start
`;


const assemble = (program) => {
    const lines = program.split("\n").filter(l => l.length > 0);

    const mem = new Array(65536).fill(0);
    let address = 0;
    let labels= {}
    let add = 0;
    try {
        // Labels pass
        lines.map((l, i) => {
            if (l.indexOf('#') === 0) {
                return null;
            }
            if (l.indexOf(':') === 0) {
                const lab = l.replace(':', '');
                labels[lab] = address;
                return null;
            }
            if (l.indexOf(' ') > 0) {
                //has an argument
                const sp = l.split(' ');
                if (typeof instructions[sp[0]] !== 'undefined') {
                    // Each argument is two bytes
                    address += (sp.length - 1) * 2 + 1;
                }
            } else {
                address += 1;
            }
            return l;
        })
        // Syntax pass
        .filter(n => n !== null).forEach((l, i) => {
            
            if (l.indexOf(':') === 0) {
                return;
            }
            if (l.indexOf(' ') > 0) {
                //has an argument
                const sp = l.split(' ');
                if (typeof instructions[sp[0]] === 'undefined') {
                    //This is an adress value, create it there
                    
                    const val = parseInt(sp[1], 10);
                    if (isNaN(val)) {
                        throw new Error('Instruction ' + l + ' is undefined at line ' + i);
                    }
                    
                    console.log('creating address value for ', sp);
    
                    mem[parseInt(sp[0], 10)] = val.toString(16);
                    add--;
                } else {
                    console.log('creating instruction for ', sp[0]);
                    mem[i + add] = instructions[sp[0]].toString(16);
                    add++;
                    // Is it a label ?
                    let ramAddress = parseInt(sp[1], 10);

                    if (typeof labels[sp[1]] !== 'undefined') {
                        console.log('is a label ', sp[1]);
                        ramAddress = labels[sp[1]];
                    }

                    //This should be two byes, split it
                    const topByte = ramAddress >> 8;
                    const bottomByte = ramAddress & 0xff;
                    mem[i + add] = bottomByte.toString(16);
                    add++;
                    mem[i + add] = topByte.toString(16);
                }
            } else {
                
                if (typeof instructions[l] === 'undefined') {
                    throw new Error('Instruction ' + l + ' is undefined at line ' + i);
                }
                console.log('single elementt ', l);
                address += 1;
                mem[i + add] = instructions[l].toString(16);
            }
        });
        console.log(labels);
    } catch (er) {
        return console.error(er);
    }
    return mem;
}

const jmp = `
5000 255
:start
LDA 5000
ADDI 1
JMPC end
STO 5001
OUT 5001
JMPI start
:end
HLT
`

mem = assemble(fibo);

const string = "v2.0 raw\n" + mem.join(' ') + "\n";

fs.writeFile("./ram", string, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("RAM file was saved!");
});

programs = [power, divide, fibo, divisor, prime].map(p => assemble(p).join(' ')); 
const pgstring = "v2.0 raw\n" + programs.join(' ') + "\n";

fs.writeFile("./ramROM", pgstring, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("RAMROM file was saved!");
});

console.log(mem.map((n, i) => {
    return {i, value: parseInt(n, 16)}
}).filter(n => n.value != 0));


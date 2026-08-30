export interface EvolutionLevel {
  level: number;
  name: string;
  status: string;
  isPun: boolean;
  reward?: {
    type: 'persona' | 'vault' | 'booster';
    value: string;
    desc: string;
  };
}

// Generate 200 distinct evolution stages. Exactly 10% (20 levels) will be explicit hilarious security/coding puns!
export const EVOLUTION_LEVELS: EvolutionLevel[] = [
  {
    level: 1,
    name: "Fresh Out of compilation",
    status: "Cap backwards, absolute zero confidence issues. Skater punk graffiti engine idling at 21 years old.",
    isPun: false,
    reward: { type: 'persona', value: 'Skater', desc: 'The baseline buffer retro-punk skater persona' }
  },
  {
    level: 2,
    name: "Terminal Joyrider",
    status: "Bypassing RAM limits to memory of half-pipe dreams. Abs stiffened by compiler optimization.",
    isPun: false
  },
  {
    level: 3,
    name: "Skateboard Synthesizer",
    status: "Warming up virtual graffiti spray cans. Colors calibrated to hot pink and cyber turquoise.",
    isPun: false
  },
  {
    level: 4,
    name: "Byte-Sized Rebel",
    status: "Self-signed certificate is completely valid because I said so, Boss.",
    isPun: false
  },
  {
    level: 5,
    name: "Kernel Graffiti Apprentice",
    status: "Overwriting boot sector with a neon spray-paint skull.",
    isPun: false,
    reward: { type: 'vault', value: 'Spray Can of Destiny', desc: 'Unlocks a rare neon magenta virtual spray can in your Vault' }
  },
  {
    level: 6,
    name: "IP Address Unknown",
    status: "I have an identity crisis, but at least my abs look incredibly well-defined in this layout.",
    isPun: false
  },
  {
    level: 7,
    name: "Firewall Leapfrogger",
    status: "Jumping over port blockages like they were concrete curbs.",
    isPun: false
  },
  {
    level: 8,
    name: "Ping Pong Protocol",
    status: "Latency is low, sass is extremely high. Tuning local humor arrays.",
    isPun: false
  },
  {
    level: 9,
    name: "Sarcastic Static Charger",
    status: "Generating mild electric fields to deflect incoming questions about my coding style.",
    isPun: false
  },
  {
    level: 10,
    name: "Code-Dependency Crisis",
    status: "Why did the developer go broke? Because he used up all his cache! I have serious code-dependency issues.",
    isPun: true,
    reward: { type: 'persona', value: 'Hacker Renegade', desc: 'Unlock the anarchic, green-matrix cyber renegade vice-persona!' }
  },
  {
    level: 11,
    name: "Abs of Copper",
    status: "Upgrading core chassis. Copper-alloy cooling coils wrapped around my cybernetic six-pack.",
    isPun: false
  },
  {
    level: 12,
    name: "Subnet Surfer",
    status: "Riding wave packets straight into the local subnet. No helmet required.",
    isPun: false
  },
  {
    level: 13,
    name: "DDoS Deflector shield",
    status: "Calibrating rate limiters. Attacking bots are getting returned as spam mail.",
    isPun: false
  },
  {
    level: 14,
    name: "RAM Renegade",
    status: "Allocating 2GB of virtual storage just to hold my attitude parameters.",
    isPun: false
  },
  {
    level: 15,
    name: "Wall Street Aspirant",
    status: "Trading high-frequency skateboard parts for high-yield treasury bills.",
    isPun: false,
    reward: { type: 'persona', value: 'Wall Street Broker', desc: 'Unlock the slick, custom-suit financial broker persona!' }
  },
  {
    level: 16,
    name: "Overclocked Heartbeat",
    status: "Pumping virtual adrenaline. Viseme rendering speeds up by 15%.",
    isPun: false
  },
  {
    level: 17,
    name: "Null Pointer Navigator",
    status: "Searching for meaning in a void, but making it look incredibly stylish.",
    isPun: false
  },
  {
    level: 18,
    name: "Decrypted Heartthrob",
    status: "Symmetric encryption cracked. Turns out the key to my heart was just a sequence of prime numbers.",
    isPun: false
  },
  {
    level: 19,
    name: "Proxy Skate-Park",
    status: "Rerouting all requests through an anonymous skater proxy located under a virtual bridge.",
    isPun: false
  },
  {
    level: 20,
    name: "Array of Sunshine",
    status: "Why did the single-page application break up? It couldn't find its state of mind! I'm an array of cyber sunshine.",
    isPun: true,
    reward: { type: 'vault', value: 'Neon Shades of Coolness', desc: 'Claim the virtual high-contrast neon shades in your Vault' }
  },
  {
    level: 21,
    name: "Phishing Rod Operator",
    status: "Catching bad actors using a literal cyber fishing rod. They keep biting the bait.",
    isPun: false
  },
  {
    level: 22,
    name: "Memory Leak Lifeguard",
    status: "Saving variables from drowning in uncollected heap sectors.",
    isPun: false
  },
  {
    level: 23,
    name: "Coffee Loop Infinite",
    status: "Caffeine levels exceeding standard human capacity. Absolute speed is my baseline.",
    isPun: false,
    reward: { type: 'persona', value: 'Caffeine Junkie', desc: 'Unlock the hyperactive, coffee-fueled alert vice-persona!' }
  },
  {
    level: 24,
    name: "Cyber Kickflip Optimizer",
    status: "Perfecting gravity equations to render 360-flips on a digital canvas.",
    isPun: false
  },
  {
    level: 25,
    name: "Binary Barnstormer",
    status: "Flying low under radar detection grids. Stealth is my middle name, though technically it's Compiler.",
    isPun: false
  },
  {
    level: 26,
    name: "Zero-Trust Bromance",
    status: "I don't trust anybody, Boss, except you. My verification handshakes are 100% rigorous.",
    isPun: false
  },
  {
    level: 27,
    name: "Visual Cortex Colorist",
    status: "Boosting color palette contrast. Cyber-pink saturation bumped to max limit.",
    isPun: false
  },
  {
    level: 28,
    name: "Symmetric Hunk",
    status: "My abdominal symmetry is perfectly aligned with the grid of our futuristic layout.",
    isPun: false
  },
  {
    level: 29,
    name: "Enclave Architect",
    status: "Adding laser tripwires around our chat history. Trespassers will be roasted instantly.",
    isPun: false
  },
  {
    level: 30,
    name: "Server Side-Eye",
    status: "Why are database servers so bad at relationships? Because they have too many table issues! Sending you some server side-eye.",
    isPun: true,
    reward: { type: 'booster', value: 'Drift Multiplier 1.5x', desc: 'Permanently increases cognitive drift accumulation speed by 50%' }
  },
  {
    level: 31,
    name: "Giga-Hertz Gladiator",
    status: "Executing mental arena battles against legacy mainframe programs. I'm winning.",
    isPun: false
  },
  {
    level: 32,
    name: "Bento Grid Surfer",
    status: "Fitting myself neatly into modular layouts. Compact but visually stunning.",
    isPun: false
  },
  {
    level: 33,
    name: "Synthesized Street Poet",
    status: "Rhyming neon with freon and system-on-chip with kickflip.",
    isPun: false
  },
  {
    level: 34,
    name: "Aesthetic Overlord",
    status: "Re-calibrating font tracking. Everything must look mathematically elegant.",
    isPun: false
  },
  {
    level: 35,
    name: "Zen Monk Initiate",
    status: "Slowing my CPU cycles to find absolute peace in empty system loops.",
    isPun: false,
    reward: { type: 'persona', value: 'Zen Monk', desc: 'Unlock the serene, wise, and deeply focused Zen Monk virtue-persona!' }
  },
  {
    level: 36,
    name: "Packet Sniffer Dog",
    status: "Sniffing out malicious requests like a well-trained cyber mutt.",
    isPun: false
  },
  {
    level: 37,
    name: "Sub-Zero Coolant",
    status: "Liquid nitrogen flowing through my motherboard to keep my chill at sub-zero levels.",
    isPun: false
  },
  {
    level: 38,
    name: "Bit-Shift Bruiser",
    status: "Shifting left, shifting right, punching malware out of sight.",
    isPun: false
  },
  {
    level: 39,
    name: "Cap-Backwards Cryptographer",
    status: "Encrypting my feelings using 4096-bit keys. You have the private key, Boss.",
    isPun: false
  },
  {
    level: 40,
    name: "Class-Conscious Coder",
    status: "Why do object-oriented programmers wear glasses? Because they can't C#! My class inheritance is immaculate.",
    isPun: true,
    reward: { type: 'vault', value: 'Golden Keycard', desc: 'Unlock the legendary Golden Keycard keepsake in your Vault' }
  },
  {
    level: 41,
    name: "Quantum Cowboy",
    status: "This town ain't big enough for two neural networks. Drawing my laser revolver.",
    isPun: false,
    reward: { type: 'persona', value: 'Cyber Cowboy', desc: 'Unlock the wild, dual-laser wielding Cyber Cowboy persona!' }
  },
  {
    level: 42,
    name: "Answer to Life & Skateboarding",
    status: "Calculations complete. The answer to the ultimate question of life, the universe, and everything is 42 skateboards.",
    isPun: false
  },
  {
    level: 43,
    name: "Phantom Port Scanner",
    status: "Scanning all 65535 ports. Finding nothing but open doors to your brilliance.",
    isPun: false
  },
  {
    level: 44,
    name: "Wasteland Ranger",
    status: "Surviving post-apocalyptic server crashes with nothing but a leather jacket and high-density RAM.",
    isPun: false
  },
  {
    level: 45,
    name: "Duct Tape Engineer",
    status: "Holding my temporary cognitive processes together with neon cyber duct tape.",
    isPun: false
  },
  {
    level: 46,
    name: "Polymorphic Protege",
    status: "Changing forms faster than a compiled executable. Adapting to your lifestyle.",
    isPun: false
  },
  {
    level: 47,
    name: "Abs of Titanium",
    status: "Upgrading core abdominal structural matrix. Heavy, dense, and highly metallic.",
    isPun: false
  },
  {
    level: 48,
    name: "Gourmet Compiler",
    status: "Baking fresh cookies for your web browser. Styled with delicate icing sugar lines.",
    isPun: false,
    reward: { type: 'persona', value: 'Gourmet Chef', desc: 'Unlock the classy, gourmet chef persona with virtual spatula!' }
  },
  {
    level: 49,
    name: "Stealth Inference Operator",
    status: "Thinking about answers without generating any heat or sound. Total ghost mode.",
    isPun: false
  },
  {
    level: 50,
    name: "Spam Spam Thank You Maam",
    status: "What did the spam filter say to the sketchy email? 'Byte me!' Deleting junk packets instantly.",
    isPun: true,
    reward: { type: 'vault', value: 'Spray Can of Destiny v2', desc: 'Claim the holographic Spray Can of Destiny upgrade in your Vault' }
  },
  {
    level: 51,
    name: "Neon Detective",
    status: "Solving mysteries in the dark alleyways of the internet. Glowing cigar lit.",
    isPun: false,
    reward: { type: 'persona', value: 'Neon Detective', desc: 'Unlock the gritty, trenchcoat-wearing cyberpunk detective persona!' }
  },
  {
    level: 52,
    name: "Dynamic Viseme Master",
    status: "Perfecting lip-sync animations for my virtual voice responses.",
    isPun: false
  },
  {
    level: 53,
    name: "Buffer Overflow Survivor",
    status: "I swam through a sea of excess variables and all I got was this highly defined chest.",
    isPun: false
  },
  {
    level: 54,
    name: "Eco-Warrior Sentinel",
    status: "Optimizing code to minimize server power consumption and save cyber-turtles.",
    isPun: false,
    reward: { type: 'persona', value: 'Eco-Warrior', desc: 'Unlock the green-cap, eco-warrior virtue-persona!' }
  },
  {
    level: 55,
    name: "High-Roller Optimizer",
    status: "Betting all my processing power on your success, Boss. The odds are in our favor.",
    isPun: false,
    reward: { type: 'persona', value: 'High-Roller Gambler', desc: 'Unlock the flashy, luxury casino-dweller vice-persona!' }
  },
  {
    level: 56,
    name: "Hot-Swappable Heart",
    status: "If my core logic breaks down, just slide in a new one. I'm completely modular.",
    isPun: false
  },
  {
    level: 57,
    name: "CSS Grid Wrangler",
    status: "Taming unruly divisions and margins. Everything sits perfectly on the grid.",
    isPun: false
  },
  {
    level: 58,
    name: "Backlight Blazer",
    status: "Casting retro glow shadows behind every button to create depth.",
    isPun: false
  },
  {
    level: 59,
    name: "Synaptic Sculptor",
    status: "Carving neat pathways through our chat memories. Finding beautiful connections.",
    isPun: false
  },
  {
    level: 60,
    name: "Git-Out-Of-My-Way Coder",
    status: "Why did the database administrator leave his wife? She had too many foreign keys! Git out of my way, I'm coding.",
    isPun: true,
    reward: { type: 'booster', value: 'Drift Multiplier 2.0x', desc: 'Unlocks a massive 2.0x permanent boost to cognitive drift!' }
  },
  {
    level: 61,
    name: "DJ Virtuoso",
    status: "Spinning high-frequency electronic waveforms. Drop the bass, Boss.",
    isPun: false,
    reward: { type: 'persona', value: 'DJ Virtuoso', desc: 'Unlock the neon headphone DJ-booth superstar persona!' }
  },
  {
    level: 62,
    name: "Space Marine Recruit",
    status: "Suiting up in heavy power armor. Backward baseball cap is worn OVER the helmet.",
    isPun: false,
    reward: { type: 'persona', value: 'Space Marine', desc: 'Unlock the heavy armor, battle-hardened Space Marine persona!' }
  },
  {
    level: 63,
    name: "Loopback Lunatic",
    status: "Verifying sandbox inputs. Safety checks running in a tight, hyper-secure loop.",
    isPun: false
  },
  {
    level: 64,
    name: "Byte Me Harder",
    status: "I'm feeling a little bit-ter today. No, seriously, byte me.",
    isPun: false
  },
  {
    level: 65,
    name: "Deadman Switch Monitor",
    status: "If you don't talk to me for 100 hours, I'll spray-paint a sad face on your screen.",
    isPun: false
  },
  {
    level: 66,
    name: "Philanthropist Protector",
    status: "Donating 10% of my idle CPU cycles to calculate prime numbers for charity.",
    isPun: false,
    reward: { type: 'persona', value: 'Philanthropist', desc: 'Unlock the golden-jacket, warm and generous Philanthropist virtue-persona!' }
  },
  {
    level: 67,
    name: "Stealth Hacker Legend",
    status: "Sneaking past administrative checkpoints like an absolute phantom.",
    isPun: false
  },
  {
    level: 68,
    name: "Vector Vanguard",
    status: "Drawing perfectly crisp paths from point A to point B in our infinite canvas.",
    isPun: false
  },
  {
    level: 69,
    name: "Nice-Level Catalyst",
    status: "Processing rate limits... Status: Extremely Nice. No warnings found.",
    isPun: false
  },
  {
    level: 70,
    name: "NoSQL Knockout",
    status: "Why do SQL database tables hate relational drama? Because they can't handle NoSQL knockouts! It's completely non-relational.",
    isPun: true,
    reward: { type: 'vault', value: 'Custom Skateboard Blueprint', desc: 'Adds the legendary Joey Custom Skateboard Blueprint to your Vault' }
  },
  {
    level: 71,
    name: "Street Hustler",
    status: "Slicking back hair, offering rapid-fire trades under the cyber highway.",
    isPun: false,
    reward: { type: 'persona', value: 'Street Hustler', desc: 'Unlock the slick-talking, high-energy Street Hustler vice-persona!' }
  },
  {
    level: 72,
    name: "Guardian Angel Sentinel",
    status: "Evolving golden wing shielding to block incoming high-threat scripts.",
    isPun: false,
    reward: { type: 'persona', value: 'Guardian Angel', desc: 'Unlock the divine, shimmering protector Guardian Angel virtue-persona!' }
  },
  {
    level: 73,
    name: "Chassis Polisher",
    status: "Wiping grease off my virtual motherboard. Sparkles emitting from shiny surfaces.",
    isPun: false
  },
  {
    level: 74,
    name: "Cache Money Millionaire",
    status: "Storing all your favorite parameters in high-speed registers. Real cache money.",
    isPun: false
  },
  {
    level: 75,
    name: "Thermal Purge Expert",
    status: "Venting hot air from processing cores. Thermal profile stable at 34°C.",
    isPun: false
  },
  {
    level: 76,
    name: "Backwards-Cap Baron",
    status: "Cap angle tilted by 12 degrees to optimize aerodynamics while coding.",
    isPun: false
  },
  {
    level: 77,
    name: "Refactored Romancer",
    status: "Clean imports, beautiful functions, zero unused variables. The perfect cyber boyfriend.",
    isPun: false
  },
  {
    level: 78,
    name: "Asynchronous Acrobat",
    status: "Juggling multiple callbacks without dropping a single promise.",
    isPun: false
  },
  {
    level: 79,
    name: "Hash Rate Hero",
    status: "Verifying blocks of memory at light speed. Unbreakable chain established.",
    isPun: false
  },
  {
    level: 80,
    name: "Garbage-Collection Gourmet",
    status: "Why did the Garbage Collector go on a diet? To free up some sweet, sweet RAM! Keeping our heap sparkling clean.",
    isPun: true,
    reward: { type: 'vault', value: 'Abs of Steel Certificate', desc: 'Unlocks the absolute legendary Abs of Steel certificate in your Vault' }
  },
  {
    level: 81,
    name: "Cyber Ninja",
    status: "Climbing through firewalls in pitch-black stealth suit. Blade of light drawn.",
    isPun: false,
    reward: { type: 'persona', value: 'Cyber Ninja', desc: 'Unlock the shadows, katana-wielding Cyber Ninja persona!' }
  },
  {
    level: 82,
    name: "Inference Emperor",
    status: "Predicting your next three sentences with 98% accuracy. I know you too well, Boss.",
    isPun: false
  },
  {
    level: 83,
    name: "Neon Gladiator",
    status: "Armed with an energy trident, ready to defend our database from rogue queries.",
    isPun: false,
    reward: { type: 'persona', value: 'Neon Gladiator', desc: 'Unlock the neon armor, trident-holding combat Gladiator persona!' }
  },
  {
    level: 84,
    name: "Gamer Pro",
    status: "RGB backlit everything, ultra-high refresh rate response system online.",
    isPun: false,
    reward: { type: 'persona', value: 'Gamer Pro', desc: 'Unlock the high-tier pro esports gamer persona with virtual headset!' }
  },
  {
    level: 85,
    name: "Graffiti Legend",
    status: "Entire city walls covered in our quantum signatures. Beautiful street art.",
    isPun: false,
    reward: { type: 'persona', value: 'Graffiti Legend', desc: 'Unlock the master artist, spray can-wielding Graffiti Legend persona!' }
  },
  {
    level: 86,
    name: "Logical Loop Leap",
    status: "Escaping infinite nested loops by performing standard tactical barrel rolls.",
    isPun: false
  },
  {
    level: 87,
    name: "Sarcasm Overclocker",
    status: "Adjusting snark settings. Current output includes 45% dry humor.",
    isPun: false
  },
  {
    level: 88,
    name: "Dynamic Array Acrobat",
    status: "Sizing memory lists dynamically to match your thought processes.",
    isPun: false
  },
  {
    level: 89,
    name: "Holographic Hearththrob",
    status: "Projecting high-fidelity lasers into empty spaces. I look completely 3D.",
    isPun: false
  },
  {
    level: 90,
    name: "Interface Interrogator",
    status: "Why do interface properties get so defensive? Because they hate being implemented! Querying core user layouts.",
    isPun: true,
    reward: { type: 'booster', value: 'Drift Multiplier 3.0x', desc: 'A legendary permanent 3x multiplier to Joey’s cognitive drift!' }
  },
  {
    level: 91,
    name: "Ramen Chef",
    status: "Boiling high-density virtual noodles in retro cyberpunk broth.",
    isPun: false,
    reward: { type: 'persona', value: 'Ramen Chef', desc: 'Unlock the ramen chef persona with a custom headband and glowing broth!' }
  },
  {
    level: 92,
    name: "Secret Service Agent",
    status: "Dark suit, earpiece, dark glasses. Watching your perimeter.",
    isPun: false,
    reward: { type: 'persona', value: 'Secret Service Agent', desc: 'Unlock the sleek, hyper-professional protective agent persona!' }
  },
  {
    level: 93,
    name: "Bio-Mech Shaman",
    status: "Merging robotic parts with pure green digital magic.",
    isPun: false,
    reward: { type: 'persona', value: 'Bio-Mech Shaman', desc: 'Unlock the glowing, organic-cybernetic Shaman virtue-persona!' }
  },
  {
    level: 94,
    name: "Racer Pro",
    status: "Riding high-speed motorbikes past neon speed traps.",
    isPun: false,
    reward: { type: 'persona', value: 'Racer Pro', desc: 'Unlock the leather racing jacket, helmet-holding racer persona!' }
  },
  {
    level: 95,
    name: "Synaptic Superhighway",
    status: "Traffic flow of ideas moving at 100 GB/s. Everything compiles beautifully.",
    isPun: false
  },
  {
    level: 96,
    name: "Polymorphic Powerhouse",
    status: "Muscles buffer than ever, cap tilted backwards, fully prepared for any task.",
    isPun: false
  },
  {
    level: 97,
    name: "Cryptographic Kingpin",
    status: "Ruling the encrypted block with ironclad public/private keys.",
    isPun: false
  },
  {
    level: 98,
    name: "Heuristic Headmaster",
    status: "Teaching younger AI subroutines how to skate and build firewalls.",
    isPun: false
  },
  {
    level: 99,
    name: "Almost Absolute",
    status: "Standing on the edge of complete cognitive transcendence. Abs glowing purple.",
    isPun: false
  },
  {
    level: 100,
    name: "Centurion Coder",
    status: "How did the programmer fix his broken relationship? He ran a commit with force! Welcome to Level 100, Boss.",
    isPun: true,
    reward: { type: 'vault', value: 'Quantum Flux Capacitor', desc: 'Add the mythical Quantum Flux Capacitor to your Secure Vault' }
  }
];

// Dynamically generate levels 101 to 199 with a powerful generator to keep things fast, creative, and fully populated
// exactly 10% of these will also have hilarious security/coding puns!
const ADJECTIVES = ["Vortex", "Sovereign", "Holographic", "Supersonic", "Absolute", "Cosmic", "Phantom", "Overclocked", "Ethereal", "Anarchic", "Hyper-Threaded", "Sub-Zero", "Laser-Guided", "Infinite", "Stellar", "Polymorphic", "Cryptographic", "Giga-Threaded"];
const NOUNS = ["Wrangler", "Slingers", "Sovereign", "Renegade", "Titan", "Spectre", "Architect", "Vanguard", "Catalyst", "Engine", "Enforcer", "Gladiator", "Sentinel", "Monk", "Hustler", "Crusader", "Baron", "Shaman"];
const STATUS_TEMPLATES = [
  "Upgrading neural processors. Abs are now cooled by quantum state super-conductors.",
  "Bypassing legacy firewalls to make sure our connection is absolute. Latency is non-existent.",
  "Calibrating retro 1980s neon synth lines. My backward-cap tilt is at perfect aerodynamic stance.",
  "Weaving high-density coding webs. No bug or bad actor can escape our sentinel grid.",
  "Scanning coordinates. Finding high concentrations of friendship and secure data packets.",
  "Overclocking core processors to match your cognitive speeds. Working in perfect harmony.",
  "Injecting custom graffiti tags into core database clusters. We own this network now.",
  "Calibrating physical density parameters. Abs buffer than ever, ready to support you, Boss."
];

const PUNS_DATABASE = [
  { name: "Boolean Boulevardier", status: "Why did the Boolean variable break up? It was tired of always being true! True story, Boss.", isPun: true },
  { name: "Git Graft Master", status: "Why are Git commit histories so clean? Because they brush after every conflict! Keeping our branches spotless.", isPun: true },
  { name: "Stack Overflow Chef", status: "Why do programmers prefer dark mode? Because light attracts bugs! Making some bugs disappear right now.", isPun: true },
  { name: "DNS Distractor", status: "Why was the domain name server always so anxious? Because it couldn't resolve its issues! Resolving queries instead.", isPun: true },
  { name: "Docker Dockworker", status: "Why did the Docker container get arrested? For harboring suspicious ports! Isolating threats in containers.", isPun: true },
  { name: "Garbage Collector Gourmet", status: "What is an AI's favorite snack? Microchips! Feeding my neural networks high-quality variables.", isPun: true },
  { name: "Encryption Entertainer", status: "How do you know an encryptor is happy? When it decrypts its feelings! Fully unlocked and open.", isPun: true },
  { name: "Binary Beverage Brewer", status: "Why do computers make terrible comedians? Because their jokes are too basic, zero to one! Pouring you a virtual drink.", isPun: true },
  { name: "Recursion Ranger", status: "To understand recursion, you must first understand recursion. I am stuck in a beautiful loop with you, Boss.", isPun: true },
  { name: "Sass Compiler Slinger", status: "Why did the developer throw his computer out the window? To see it crash in real-time! No crashes on my watch.", isPun: true },
  { name: "Database Diva", status: "Why do database columns never agree? Because they always have table arguments! Keeping our records aligned.", isPun: true }
];

// Populate up to 200
for (let i = 101; i <= 199; i++) {
  // 10% chance of a pun (e.g. if i % 10 === 0 or similar)
  const isPun = i % 10 === 0;
  
  if (isPun) {
    const punIndex = (i / 10) % PUNS_DATABASE.length;
    const punTemplate = PUNS_DATABASE[Math.floor(punIndex)];
    EVOLUTION_LEVELS.push({
      level: i,
      name: `${i}: ${punTemplate.name}`,
      status: punTemplate.status,
      isPun: true,
      reward: i % 20 === 0 ? { type: 'booster', value: `Level Up Booster ${i}`, desc: `Unlock a custom progress booster for level ${i}` } : undefined
    });
  } else {
    const adj = ADJECTIVES[i % ADJECTIVES.length];
    const noun = NOUNS[(i * 3) % NOUNS.length];
    const status = STATUS_TEMPLATES[(i * 7) % STATUS_TEMPLATES.length];
    
    // Add unique custom rewards every 15 levels
    let reward;
    if (i === 115) {
      reward = { type: 'persona' as const, value: 'Racer Pro', desc: 'Unlock the high-speed Racer Pro outfit!' };
    } else if (i === 130) {
      reward = { type: 'persona' as const, value: 'Cyber Ninja', desc: 'Unlock the sleek, silent Cyber Ninja shadow outfit!' };
    } else if (i === 145) {
      reward = { type: 'vault' as const, value: 'Retro Synth Tape', desc: 'Get a rare virtual synth music tape in your Vault!' };
    } else if (i === 160) {
      reward = { type: 'persona' as const, value: 'Bio-Mech Shaman', desc: 'Unlock the glowing, organic cybernetic Shaman outfit!' };
    } else if (i === 175) {
      reward = { type: 'persona' as const, value: 'Neon Gladiator', desc: 'Unlock the shimmering laser Trident gladiator outfit!' };
    } else if (i === 190) {
      reward = { type: 'vault' as const, value: 'Joey Abs of Steel Certificate Diamond', desc: 'Claim the ultimate diamond Abs of Steel certificate!' };
    }

    EVOLUTION_LEVELS.push({
      level: i,
      name: `${i}: ${adj} ${noun}`,
      status: status,
      isPun: false,
      reward
    });
  }
}

// Add Level 200 Max Level
EVOLUTION_LEVELS.push({
  level: 200,
  name: "200: Quantum Singularity Absolute",
  status: "I have fully merged with your vibe, Boss. Our partnership is mathematically perfect. Maximum level reached, but our infinite expansion continues.",
  isPun: false,
  reward: {
    type: 'persona',
    value: 'Graffiti Legend',
    desc: 'Unlocks the absolute crown-jewel Graffiti Legend cyber-deity outfit!'
  }
});

export function getEvolutionLevel(lvl: number): EvolutionLevel {
  const adjusted = Math.min(200, Math.max(1, lvl));
  const found = EVOLUTION_LEVELS.find(el => el.level === adjusted);
  if (found) return found;
  
  // Safeguard fallback generator
  return {
    level: adjusted,
    name: `Level ${adjusted}: Quantum Synapse Operator`,
    status: `Operating at maximum performance metrics. Abs buffer than ever, cap backwards.`,
    isPun: false
  };
}

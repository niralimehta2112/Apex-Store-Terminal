import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Apex Neural Workstation Pro',
    description: 'Liquid-cooled dual neural engine desktop with 128GB unified memory and whisper-silent acoustic chamber.',
    longDescription: 'Engineered for developers, algorithmic traders, and deep learning engineers. The Apex Neural Workstation Pro features next-generation tensor architecture capable of processing live financial time series and computer vision models in real-time with sub-millisecond inference.',
    price: 3499.00,
    originalPrice: 3899.00,
    rating: 4.9,
    reviewsCount: 142,
    category: 'Hardware',
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
    badge: 'Flagship',
    stock: 14,
    tags: ['Workstation', 'AI', 'Computing', 'Trading'],
    specs: {
      'Processor': 'Apex Quantum Silicon 64-Core',
      'Memory': '128GB Unified LPDDR5X-8500',
      'Storage': '4TB PCIe 5.0 NVMe (14,000 MB/s)',
      'Cooling': 'Custom Micro-Channel Closed Loop Liquid',
      'Weight': '8.4 kg',
      'Warranty': '3 Years ProSupport Plus'
    },
    features: [
      'Sub-millisecond low-latency networking card',
      'Dual 8K 120Hz display outputs',
      'Encrypted hardware security enclave',
      'Zero-throttle thermal architecture'
    ]
  },
  {
    id: 'prod-2',
    name: 'ChronoPulse Titan Smartwatch',
    description: 'Aerospace-grade grade 5 titanium chassis with continuous biometric telemetry and sapphire glass.',
    longDescription: 'Built for those who demand precision and durability. The ChronoPulse Titan combines ECG sensor technology, real-time arterial oxygen tracking, autonomous GPS, and high-contrast sapphire AMOLED display visible under direct sunlight.',
    price: 649.00,
    originalPrice: 799.00,
    rating: 4.8,
    reviewsCount: 318,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular',
    stock: 45,
    tags: ['Titanium', 'Health', 'Smartwatch', 'Sapphire'],
    specs: {
      'Case Material': 'Grade 5 Aerospace Titanium',
      'Display': '1.43" Sapphire Crystal AMOLED (1200 nits)',
      'Battery Life': 'Up to 14 days standard usage',
      'Water Resistance': '100m (10 ATM)',
      'Connectivity': 'Bluetooth 5.4, Dual-Frequency GPS, NFC'
    },
    features: [
      'Continuous ECG & stress tracking',
      'Titanium link bracelet included',
      'Tactile haptic crown feedback',
      'Sub-second contactless payments'
    ]
  },
  {
    id: 'prod-3',
    name: 'Aether Acoustic Spatial Headphones',
    description: 'Beryllium planar magnetic drivers with active adaptive ambient noise cancellation and carbon fiber yoke.',
    longDescription: 'Immerse yourself in audiophile-grade high-fidelity sound. Crafted with planar magnetic drivers and calibrated DSP, the Aether Spatial delivers ultra-wide frequency response with unmatched spatial clarity and zero audio distortion.',
    price: 489.00,
    originalPrice: 549.00,
    rating: 4.9,
    reviewsCount: 204,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    badge: 'Best Seller',
    stock: 28,
    tags: ['Audiophile', 'Lossless', 'Noise Cancelling', 'Planar'],
    specs: {
      'Transducer': '50mm Planar Magnetic Beryllium Diaphragm',
      'Frequency Response': '5 Hz - 48,000 Hz',
      'Battery Life': '42 hours with Active Noise Cancellation ON',
      'Codecs': 'LDAC, aptX Lossless, AAC, SBC',
      'Weight': '310g'
    },
    features: [
      'Zero-latency USB-C wired DAC mode',
      'Memory foam sheepskin leather pads',
      'Custom 10-band parametric equalizer app',
      'Dual beamforming array microphones'
    ]
  },
  {
    id: 'prod-4',
    name: 'Apex Cloud Neural Compute Pass (100k Hours)',
    description: 'Instant cluster access to NVIDIA H100 GPU nodes with priority queueing and high-bandwidth interconnect.',
    longDescription: 'Supercharge your machine learning training and quantitative models without infrastructure overhead. Instant provisioning into dedicated high-throughput clusters with 3.2 Tbps InfiniBand interconnect.',
    price: 1199.00,
    originalPrice: 1450.00,
    rating: 5.0,
    reviewsCount: 89,
    category: 'Cloud & AI',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    badge: 'Enterprise',
    stock: 999,
    tags: ['Cloud', 'GPU', 'H100', 'AI Training'],
    specs: {
      'Compute Tier': 'NVIDIA H100 80GB SXM5 Dedicated Nodes',
      'Interconnect': '3.2 Tbps Quantum-2 InfiniBand',
      'API Access': 'REST, gRPC, Slurm & Kubernetes Cluster',
      'SLA': '99.99% Guaranteed Availability',
      'Storage': '10TB High-Speed NVMe Shared Cache'
    },
    features: [
      'Instant cluster activation upon purchase',
      'No contracts or lock-in periods',
      'Integrated Jupyter & PyTorch workspace',
      'Automated checkpoint backup'
    ]
  },
  {
    id: 'prod-5',
    name: 'Vanguard Mechanical Haptic Deck',
    description: 'CNC-milled solid brass base, hot-swappable tactile switches, and customizable OLED macro telemetry screen.',
    longDescription: 'The pinnacle of desktop typing and data control. Machined from an 8-pound block of solid brass and anodized aluminum with gasket-mount dampening, per-key RGB backlighting, and programmable mini-OLED display for live status updates.',
    price: 329.00,
    originalPrice: 380.00,
    rating: 4.7,
    reviewsCount: 167,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    badge: 'Limited Edition',
    stock: 19,
    tags: ['Mechanical Keyboard', 'Haptic', 'OLED', 'Custom'],
    specs: {
      'Mounting Style': 'Poron Gasket Mount with Brass Plate',
      'Switches': 'Apex Silent Tactile 62g (Factory Lubed)',
      'Keycaps': 'Double-shot PBT Cherry Profile',
      'Display': '128x64 Monochrome OLED Telemetry Screen',
      'Polling Rate': '8,000 Hz Ultrafast USB-C'
    },
    features: [
      'Onboard memory for up to 6 custom profiles',
      'Dynamic volume and scroll rotary encoder knob',
      'PVD coated brass bottom weight',
      'QMK / VIA open-source firmware compatible'
    ]
  },
  {
    id: 'prod-6',
    name: 'Horizon Curve 40" 5K Ultrawide Monitor',
    description: 'Nano-IPS panel with 120Hz refresh, Thunderbolt 4 96W power delivery, and 98% DCI-P3 color calibration.',
    longDescription: 'Panoramic canvas for professional workflows. Featuring a 2500R gentle curve, 5120 x 2160 native resolution, hardware color calibration sensor, and integrated KVM switch to control two systems seamlessly.',
    price: 1299.00,
    originalPrice: 1499.00,
    rating: 4.8,
    reviewsCount: 94,
    category: 'Hardware',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular',
    stock: 11,
    tags: ['Monitor', 'Ultrawide', '5K2K', 'Thunderbolt'],
    specs: {
      'Resolution': '5120 x 2160 (WUHD 5K2K)',
      'Panel': 'Nano-IPS with HDR 600',
      'Refresh Rate': '120Hz with AMD FreeSync Premium Pro',
      'Color Gamut': '98% DCI-P3, 100% sRGB (Delta E < 1.5)',
      'Ports': 'Thunderbolt 4 (96W PD), 2x HDMI 2.1, DisplayPort 1.4'
    },
    features: [
      'Built-in USB hub & 2.5 Gbps Ethernet port',
      'Auto-dimming ambient light sensor',
      'Picture-by-Picture dual computer split',
      'Ergonomic height, tilt, and swivel stand'
    ]
  },
  {
    id: 'prod-7',
    name: 'PulseRing BioSensor Band',
    description: 'Ultra-thin ceramic smart ring tracking sleep stages, skin temperature fluctuations, and readiness score.',
    longDescription: 'Discreet, seamless wellness intelligence on your finger. Weighing only 4 grams with scratch-resistant zirconia ceramic, the PulseRing continuously syncs biometric telemetry to guide recovery and peak performance.',
    price: 299.00,
    originalPrice: 349.00,
    rating: 4.6,
    reviewsCount: 112,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    badge: 'New',
    stock: 52,
    tags: ['Smart Ring', 'Sleep', 'Biometrics', 'Ceramic'],
    specs: {
      'Material': 'Zirconia Ceramic with Titanium Inner Shell',
      'Weight': '3.8 grams',
      'Water Resistance': 'Waterproof up to 100 meters',
      'Battery': '7 days on single 40-minute wireless charge',
      'Sizes': 'US Size 6 through 13 available'
    },
    features: [
      'Nightly sleep score & circadian rhythm advice',
      'Contactless wireless magnetic charging dock',
      'Zero monthly subscription fees',
      'Continuous HRV (Heart Rate Variability) logging'
    ]
  },
  {
    id: 'prod-8',
    name: 'Apex Studio Wireless Microphone Hub',
    description: 'Dual channel 32-bit float broadcast audio transmission with zero clipping and magnetic clip transmitters.',
    longDescription: 'Crystal-clear broadcast sound anywhere. Features internal 32-bit float recording so your audio will never clip or distort, with 250m line-of-sight wireless transmission and 24 hours of combined battery life with the charging case.',
    price: 279.00,
    originalPrice: 320.00,
    rating: 4.9,
    reviewsCount: 78,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    badge: 'Pro Audio',
    stock: 33,
    tags: ['Microphone', 'Wireless', '32-bit Float', 'Podcast'],
    specs: {
      'Transmission': '2.4 GHz digital encryption (250m range)',
      'Bit Depth': '32-bit float on-board recording',
      'Max SPL': '130 dB SPL',
      'Battery': '7 hours per transmitter, 24 hours with case',
      'Weight': '28g per transmitter'
    },
    features: [
      'Built-in safety channel backup recording',
      'Lightning, USB-C, and 3.5mm TRS adapter heads',
      'Magnetic clothing clip and necklace lanyard',
      'OLED touch display receiver'
    ]
  }
];


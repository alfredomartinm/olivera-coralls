// Coral Reef Interactive Website - JavaScript
// For Olivera Corals Class Kindergarten Presentation

class ReefManager {
    constructor() {
        this.creatures = [];
        this.isFishCircleMode = false;
        this.fishCircleAnimationId = null;
        this.fishCircleStartTime = null;
        this.fishOrbitData = new Map();
        this.init();
    }

    init() {
        // Load existing creatures from localStorage
        this.loadCreatures();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render the reef
        this.renderReef();
        
        // Update counter
        this.updateCounter();
        
        // Create ambient bubbles
        this.createAmbientBubbles();
    }

    setupEventListeners() {
        // Add creature buttons
        document.querySelectorAll('.creature-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const creature = btn.dataset.creature;
                const name = btn.dataset.name;
                this.addCreature(creature, name);
            });
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            location.reload();
        });

        // Download button (save reef state)
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadReefState();
        });

        // Circle fish button
        document.getElementById('circle-fish-btn').addEventListener('click', () => {
            this.toggleFishCircleMode();
        });

        // Recalculate swim paths when screen size changes (important on mobile rotation)
        window.addEventListener('resize', () => {
            if (this.isFishCircleMode) {
                this.fishOrbitData.clear();
            }
        });
    }

    addCreature(emoji, name) {
        const creature = {
            emoji: emoji,
            name: name,
            timestamp: new Date().toISOString(),
            id: Date.now() + Math.random()
        };

        this.creatures.push(creature);
        this.saveCreatures();
        this.renderReef();
        this.updateCounter();
        
        // Visual feedback
        this.showCelebration(emoji);
        this.createSparkles();
        
        // Play sound effect if available (optional)
        this.playSound();
    }

    saveCreatures() {
        // Save to localStorage
        localStorage.setItem('reef-creatures', JSON.stringify(this.creatures));
        
        // Also save as downloadable JSON
        this.saveToFile();
    }

    loadCreatures() {
        const saved = localStorage.getItem('reef-creatures');
        if (saved) {
            try {
                this.creatures = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading creatures:', e);
                this.creatures = [];
            }
        }
        
        // Try to load from creatures.json if it exists
        this.loadFromFile();
    }

    async loadFromFile() {
        try {
            const response = await fetch('creatures.json');
            if (response.ok) {
                const data = await response.json();
                if (data.creatures && Array.isArray(data.creatures)) {
                    // Merge with localStorage, avoiding duplicates
                    const existingIds = new Set(this.creatures.map(c => c.id));
                    const newCreatures = data.creatures.filter(c => !existingIds.has(c.id));
                    this.creatures = [...this.creatures, ...newCreatures];
                    this.saveCreatures();
                }
            }
        } catch (e) {
            // File doesn't exist or couldn't be loaded, that's okay
            console.log('No creatures.json found or error loading:', e);
        }
    }

    saveToFile() {
        // Create a JSON blob with the creatures
        const data = {
            reef: "Olivera Corals Class",
            lastUpdated: new Date().toISOString(),
            creatures: this.creatures
        };
        
        // Store in a global variable that can be accessed
        window.reefData = data;
    }

    renderReef() {
        const reefArea = document.getElementById('reef-area');
        
        if (this.creatures.length === 0) {
            reefArea.innerHTML = '<p style="text-align: center; color: #003d7a; font-size: 1.5em;">Your reef is empty! Click a button to add creatures! 🌊</p>';
            return;
        }
        
        reefArea.innerHTML = '';
        
        this.creatures.forEach((creature, index) => {
            const creatureEl = document.createElement('div');
            creatureEl.className = 'reef-creature';
            creatureEl.textContent = creature.emoji;
            creatureEl.dataset.creature = creature.emoji;
            creatureEl.dataset.id = String(creature.id);
            creatureEl.title = `${creature.name} - Added ${new Date(creature.timestamp).toLocaleString()}`;
            
            // Stagger the animation
            creatureEl.style.animationDelay = `${index * 0.1}s`;
            
            reefArea.appendChild(creatureEl);
        });

        if (this.isFishCircleMode) {
            this.startFishCircleAnimation();
        }
    }

    updateCounter() {
        document.getElementById('creature-count').textContent = this.creatures.length;
    }

    showCelebration(emoji) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.textContent = emoji + ' 🎉';
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 1500);
    }

    createSparkles() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.textContent = '✨';
                sparkle.style.left = Math.random() * window.innerWidth + 'px';
                sparkle.style.top = Math.random() * window.innerHeight + 'px';
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    sparkle.remove();
                }, 1000);
            }, i * 100);
        }
    }

    createAmbientBubbles() {
        setInterval(() => {
            const bubble = document.createElement('div');
            bubble.style.position = 'fixed';
            bubble.style.bottom = '-50px';
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.width = (10 + Math.random() * 30) + 'px';
            bubble.style.height = bubble.style.width;
            bubble.style.borderRadius = '50%';
            bubble.style.background = 'rgba(255, 255, 255, 0.4)';
            bubble.style.pointerEvents = 'none';
            bubble.style.zIndex = '5';
            bubble.style.animation = `rise ${5 + Math.random() * 5}s linear`;
            
            document.body.appendChild(bubble);
            
            setTimeout(() => {
                bubble.remove();
            }, 10000);
        }, 2000);
    }

    playSound() {
        // Optional: Play a bubble sound effect
        // This would require audio files, so we'll skip for now
        // but leaving the method here for future enhancement
    }

    downloadReefState() {
        const data = {
            reef: "Olivera Corals Class",
            lastUpdated: new Date().toISOString(),
            creatures: this.creatures
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'olivera-reef-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show feedback
        this.showCelebration('💾');
    }

    toggleFishCircleMode() {
        this.isFishCircleMode = !this.isFishCircleMode;

        const circleBtn = document.getElementById('circle-fish-btn');
        if (this.isFishCircleMode) {
            circleBtn.textContent = '⏹️ Parar de Nedar';
            circleBtn.classList.add('active-circling');
            this.startFishCircleAnimation();
            return;
        }

        circleBtn.textContent = '🐠 Nedar';
        circleBtn.classList.remove('active-circling');
        this.stopFishCircleAnimation();
    }

    startFishCircleAnimation() {
        this.stopFishCircleAnimation();
        this.fishCircleStartTime = null;
        this.fishOrbitData.clear();
        this.fishCircleAnimationId = requestAnimationFrame((timestamp) => this.animateFishInCircles(timestamp));
    }

    stopFishCircleAnimation() {
        if (this.fishCircleAnimationId) {
            cancelAnimationFrame(this.fishCircleAnimationId);
            this.fishCircleAnimationId = null;
        }

        const creatureElements = document.querySelectorAll('#reef-area .reef-creature');
        creatureElements.forEach(creatureEl => {
            creatureEl.classList.remove('fish-circling');
            creatureEl.style.left = '';
            creatureEl.style.top = '';
            creatureEl.style.transform = '';
            creatureEl.style.animationDelay = '';
        });

        this.fishOrbitData.clear();
    }

    animateFishInCircles(timestamp) {
        if (!this.isFishCircleMode) {
            return;
        }

        const reefArea = document.getElementById('reef-area');
        const fishElements = Array.from(reefArea.querySelectorAll('.reef-creature'));

        if (!this.fishCircleStartTime) {
            this.fishCircleStartTime = timestamp;
        }

        const elapsed = (timestamp - this.fishCircleStartTime) / 1000;
        const maxX = reefArea.clientWidth;
        const maxY = reefArea.clientHeight;
        const minDimension = Math.min(maxX, maxY);

        if (maxX === 0 || maxY === 0) {
            this.fishCircleAnimationId = requestAnimationFrame((nextTimestamp) => this.animateFishInCircles(nextTimestamp));
            return;
        }

        fishElements.forEach((fishEl) => {
            const fishId = fishEl.dataset.id || `fish-${Math.random()}`;
            if (!this.fishOrbitData.has(fishId)) {
                const safePadding = Math.max(18, Math.min(40, minDimension * 0.12));
                const centerX = safePadding + Math.random() * Math.max(1, maxX - safePadding * 2);
                const centerY = safePadding + Math.random() * Math.max(1, maxY - safePadding * 2);
                const radius = Math.max(10, minDimension * (0.05 + Math.random() * 0.09));
                const angularSpeed = 1.1 + Math.random() * 1.3;
                const phase = Math.random() * Math.PI * 2;
                const wobble = 4 + Math.random() * 10;
                const driftSpeed = 0.12 + Math.random() * 0.25;
                const driftPhase = Math.random() * Math.PI * 2;

                this.fishOrbitData.set(fishId, {
                    centerX,
                    centerY,
                    radius,
                    angularSpeed,
                    phase,
                    wobble,
                    driftSpeed,
                    driftPhase
                });
            }

            const orbit = this.fishOrbitData.get(fishId);
            const angle = elapsed * orbit.angularSpeed + orbit.phase;
            const wobble = Math.sin(elapsed * 2 + orbit.phase) * orbit.wobble;
            const driftX = Math.cos(elapsed * orbit.driftSpeed + orbit.driftPhase) * 8;
            const driftY = Math.sin(elapsed * orbit.driftSpeed + orbit.driftPhase) * 8;
            const x = orbit.centerX + driftX + Math.cos(angle) * (orbit.radius + wobble);
            const y = orbit.centerY + driftY + Math.sin(angle) * orbit.radius;

            const clampedX = Math.min(Math.max(24, x), Math.max(24, maxX - 24));
            const clampedY = Math.min(Math.max(24, y), Math.max(24, maxY - 24));

            fishEl.classList.add('fish-circling');
            fishEl.style.left = `${clampedX}px`;
            fishEl.style.top = `${clampedY}px`;
            fishEl.style.transform = 'translate(-50%, -50%)';
        });

        this.fishCircleAnimationId = requestAnimationFrame((nextTimestamp) => this.animateFishInCircles(nextTimestamp));
    }
}

// Initialize the reef when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.reefManager = new ReefManager();
});

// Export reef data for GitHub commits
window.exportReefData = function() {
    if (window.reefData) {
        console.log('Reef Data:', JSON.stringify(window.reefData, null, 2));
        return window.reefData;
    }
    return null;
};

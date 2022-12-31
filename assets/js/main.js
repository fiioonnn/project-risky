class Risky {
	constructor() {
		// DOM Elements
		this.site = document.querySelector("#site");
		this.ladderWrapper = document.querySelector("#ladderWrapper");
		this.ladderLevels = Array.from(ladder.querySelectorAll("li")).reverse();
		this.ladder = document.querySelector("#ladder");
		// Booleans
		this.blinkBoolOne = true;
		this.blinkBoolSecond = false;
		this.blinkCooldown = false;
		this.locked = false;
		this.statusIsVisible = false;
		this.soundsEnabled = true;
		this.jackpotBoolean = false;
		this.jackpotInterval = null;
		this.notGameOver = true;
		this.controlsLocked = false;
		this.soundsEnabled = true;
		//
		this.blinkSpeed = 200;
		this.controlsCooldown = 200;
		this.chance = 0.5;

		//
		this.keys = [];
		//
		this.level = 1;
		this.levels = {
			0: {amount: "0", prev: 0, next: 0, blinkSpeed: 0},
			1: {amount: "15", prev: 0, next: 2, blinkSpeed: 100},
			2: {amount: "30", prev: 0, next: 3, blinkSpeed: 350},
			3: {amount: "60", prev: 0, next: 4, blinkSpeed: 350},
			4: {amount: "120", prev: 0, next: 5, blinkSpeed: 350},
			5: {amount: "240", prev: 0, next: 6, blinkSpeed: 350},
			6: {amount: "payout", prev: 6, next: 6, blinkSpeed: 0},
			7: {amount: "400", prev: 0, next: 8, blinkSpeed: 400},
			8: {amount: "800", prev: 7, next: 9, blinkSpeed: 400},
			9: {amount: "1200", prev: 7, next: 10, blinkSpeed: 400},
			10: {amount: "2000", prev: 8, next: 11, blinkSpeed: 400},
			11: {amount: "3200", prev: 9, next: 12, blinkSpeed: 400},
			12: {amount: "5200", prev: 10, next: 13, blinkSpeed: 400},
			13: {amount: "8400", prev: 11, next: 14, blinkSpeed: 400},
			14: {amount: "14000", prev: 14, next: 14, blinkSpeed: 0},
		};
		this.audios = [];
		this.audioFiles = {
			soundtrack: {
				url: "./assets/audio/merkur/soundtrack.mp3",
				loop: true,
				volume: 0.1,
			},
			jackpot: {
				url: "./assets/audio/merkur/jackpot.mp3",
				loop: false,
				volume: 1,
			},
			payout: {
				url: "./assets/audio/merkur/payout.mp3",
				loop: false,
				volume: 0.4,
			},
			smallUp: {
				url: "./assets/audio/merkur/smallUp.mp3",
				loop: false,
				volume: 0.3,
			},
			smallDown: {
				url: "./assets/audio/merkur/smallDown.mp3",
				loop: false,
				volume: 0.3,
			},
			bigUp: {
				url: "./assets/audio/merkur/bigUp.mp3",
				loop: false,
				volume: 0.3,
			},
			bigDown: {
				url: "./assets/audio/merkur/bigDown.mp3",
				loop: false,
				volume: 0.3,
			},
			dropToZero: {
				url: "./assets/audio/merkur/dropToZero.mp3",
				loop: false,
				volume: 0.25,
			},
			fallDown: {
				url: "./assets/audio/merkur/fallDown.mp3",
				loop: false,
				volume: 0.3,
			},
			levelUp: {
				url: "./assets/audio/merkur/levelUp2.mp3",
				loop: false,
				volume: 0.35,
			},
		};
		// Initialize
		this.init();
	}

	init() {
		// Register Controls
		this.controls();
		// Start timers
		this.blinkTimer();
		// focus
		this.focus();
		//
		this.activeLevel();
		// Load audios
		this.loadAudios();
		this.playAudio("soundtrack");
		this.toggleSound();
	}

	blinkTimer() {
		if (!this.blinkCooldown) {
			this.blink();
		}
		setTimeout(() => {
			this.blinkTimer();
		}, this.levels[this.level].blinkSpeed);
	}

	controls() {
		document.onkeydown = (e) => {
			if (e.key == " ") {
				if (this.controlsLocked) return;
				this.controlsLocked = true;
				setTimeout(() => {
					this.controlsLocked = false;
				}, this.controlsCooldown);

				return this.play();
			}

			if (e.key == "r") {
				return this.restart();
			}
			// this.keys[e.key] = true;
		};
	}

	gameState(state) {
		switch (state) {
			case "game-over":
				this.notGameOver = false;
				this.locked = true;
				console.log("game-over");
				this.activeLevel(0);
				this.stopAudio("soundtrack");
				this.playAudio("dropToZero");
				setTimeout(() => {
					this.restart();
				}, 1000);
				break;
			case "payout":
				this.locked = true;
				this.wave();
				this.stopAudio("soundtrack");
				this.playAudio("payout");
				let waveIntervalCount = 0;
				let waveInterval = setInterval(() => {
					waveIntervalCount++;
					this.wave();
					if (waveIntervalCount == 3) {
						clearInterval(waveInterval);
						setTimeout(() => {
							this.level = 7;
							this.locked = false;
							this.activeLevel();
							this.playAudio("soundtrack");
						}, 500);
					}
				}, 550);

				break;
			case "win":
				this.locked = true;
				this.site.style.background = "rgba(0,0,0,0.5)";
				this.jackpotInterval = setInterval(() => {
					this.ladderLevels[this.level].classList.toggle(
						"active",
						(this.jackpotBoolean = !this.jackpotBoolean)
					);
				}, 200);
				this.stopAudio("soundtrack");
				this.playAudio("jackpot");
				setTimeout(() => {
					start_fireworks();
				}, 1500);
				setTimeout(() => {
					this.locked = false;
					this.restart();
				}, 26000);
				break;
		}
	}

	check(level) {
		switch (level) {
			case 0:
				this.gameState("game-over");
				break;

			case 6:
				this.gameState("payout");
				break;

			case 14:
				this.gameState("win");
				break;
		}
	}

	play() {
		if (this.locked) return;
		if (!this.notGameOver) return;

		let prevLevel = this.levels[this.level].prev;
		let nextLevel = this.levels[this.level].next;
		let oldLevel = this.level;
		// Main game logic
		if (this.random(this.chance)) {
			// change to 0.5
			this.level = nextLevel;
			if (nextLevel != 6 && nextLevel != 14) {
				this.playAudio("levelUp", true);
			}
		} else {
			this.level = prevLevel;
			if (prevLevel > 0) this.playAudio("fallDown", true);
		}
		this.focus();
		this.check(this.level);
		this.clear();
		this.activeLevel();

		setTimeout(() => {
			this.blinkCooldown = false;
		}, 200);

		this.blinkCooldown = true;
		// animate here
	}

	activeLevel(level) {
		level = level || this.level;
		this.ladderLevels[level].classList.add("active");
	}

	blink() {
		let prevLevel = this.levels[this.level].prev;
		let nextLevel = this.levels[this.level].next;
		let oldLevel = this.level;

		if (this.locked) return;
		if (!this.notGameOver) return;

		this.ladderLevels[prevLevel].classList.toggle(
			"active",
			(this.blinkBoolOne = !this.blinkBoolOne)
		);

		this.ladderLevels[nextLevel].classList.toggle(
			"active",
			(this.blinkBoolSecond = !this.blinkBoolSecond)
		);

		if (this.level > 1) {
			if (this.blinkBoolOne) {
				this.level > 7
					? this.playAudio("bigUp", true)
					: this.playAudio("smallDown", true);
			}
			if (this.blinkBoolSecond) {
				this.level > 7
					? this.playAudio("bigDown", true)
					: this.playAudio("smallUp", true);
			}
		}
	}

	wave() {
		this.ladderLevels.forEach((level, index) => {
			if (index < 6) return;
			setTimeout(() => {
				level.classList.add("active");
				setTimeout(() => {
					level.classList.remove("active");
				}, 35 * index);
			}, 30 * index);
		});
	}

	clear(exludedLevel) {
		exludedLevel = exludedLevel || this.level;
		this.ladderLevels.forEach((level) => {
			if (level !== exludedLevel) {
				level.classList.remove("active");
			}
		});
	}

	focus(level) {
		level = level || this.level;
		this.ladderLevels[level].scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center",
		});
	}

	random(chance) {
		return Math.random() < chance;
	}

	restart() {
		this.status("hide");
		if (this.locked && this.notGameOver) return;
		this.notGameOver = true;
		this.stopAllAudios();
		this.site.style.background = "none";
		clearInterval(this.jackpotInterval);
		this.level = 1;
		this.locked = false;
		this.clear();
		this.activeLevel();
		this.focus();
		this.playAudio("soundtrack");

		stop_fireworks();
	}

	status(action, text, subText = "") {
		var status = document.querySelector("#status");
		var statusText = document.querySelector("#statusText");
		var statusSubText = document.querySelector("#statusSubText");
		var statusButton = document.querySelector("#statusButton");

		switch (action) {
			case "hide":
				status.style.marginLeft = "-100%";
				break;
			case "show":
				this.statusIsVisible = true;
				status.style.marginLeft = "0";
				statusText.innerText = text;
				statusSubText.innerText = subText;
				statusButton.onclick = () => {
					this.restart();
				};
				break;
		}
	}

	loadAudios() {
		for (const [name, audio] of Object.entries(this.audioFiles)) {
			this[name] = new Audio(audio.url);
			this[name].loop = audio.loop;
			this[name].volume = audio.volume;
			this.audios.push({name: name, sound: this[name]});
		}
	}

	playAudio(name, async = false) {
		if (!this.soundsEnabled) return;
		if (async) {
			let asyncAudio = new Audio(this.audioFiles[name].url);
			asyncAudio.volume = this.audioFiles[name].volume;
			asyncAudio.play();
			asyncAudio.remove();
			setTimeout(() => {
				asyncAudio.pause();
				asyncAudio.remove();
			}, 1000);
			return;
		}
		this.audios.forEach((audio) => {
			if (audio.name === name) {
				audio.sound.play();
			}
		});
	}

	stopAudio(name) {
		this.audios.forEach((audio) => {
			if (audio.name === name) {
				audio.sound.pause();
				audio.sound.currentTime = 0;
			}
		});
	}

	stopAllAudios() {
		this.audios.forEach((audio) => {
			audio.sound.pause();
			audio.sound.currentTime = 0;
		});
	}

	toggleSound() {
		var toggleSound = document.querySelector("#toggleSound");
		console.log("asdasd");
		toggleSound.addEventListener("click", () => {
			if (this.soundsEnabled) {
				this.soundsEnabled = false;
				toggleSound.style.backgroundImage = "url('./assets/img/unmute.svg')";
				this.stopAllAudios();
			} else {
				this.soundsEnabled = true;
				toggleSound.style.backgroundImage = "url('./assets/img/mute.svg')";
				this.playAudio("soundtrack");
			}
		});
	}
}

const RISKY = new Risky();

class Risky {
	constructor( settings = {} ) {
		// dom
		this.ladder 		= document.querySelector('#ladder')
		this.ladderWrapper 	= document.querySelector('#ladder-wrapper')
		this.tiles 			= ladder.querySelectorAll('li')
		// debug
		this.debugEnabled	= false
		// cooldown
		this.cooldown 		= false
		this.cooldownTimer 	= null
		// toggles
		this.toggleTeaser	= false
		// blocked input
		this.blocked		= false
		this.gameover		= false
		// levels
		this.levelIndex		= 1
		this.level			= {
			0: { active: 14, prev: 14, win: 14, loose: 14, amount: 0 },
			1: { active: 13, prev: 14, win: 12, loose: 14, amount: 15 },
			2: { active: 12, prev: 13, win: 11, loose: 14, amount: 30 },
			3: { active: 11, prev: 12, win: 10, loose: 14, amount: 60 },
			4: { active: 10, prev: 11, win: 9, loose: 14, amount: 120 },
			5: { active: 9, prev: 10, win: 8, loose: 14, amount: 240 },
			6: { active: 8, prev: 14, win: 8, loose: 8, amount: 'PLAYOUT' }, // AUSSPIELUNG
			7: { active: 7, prev: 8, win: 6, loose: 14, amount: 400 },
			8: { active: 6, prev: 7, win: 5, loose: 7, amount: 800 },
			9: { active: 5, prev: 6, win: 4, loose: 6, amount: 1200 },
			10: { active: 4, prev: 5, win: 3, loose: 5, amount: 2000 },
			11: { active: 3, prev: 4, win: 2, loose: 4, amount: 3200 },
			12: { active: 2, prev: 3, win: 1, loose: 3, amount: 5200 },
			13: { active: 1, prev: 2, win: 0, loose: 2, amount: 8400 },
			14: { active: 0, prev: 1, win: 0, loose: 0, amount: 14000 },
		}
		// audios
		this.sounds			= {
			toggle: './assets/audio/toggle.mp3',
			teaseOne: './assets/audio/tease-one.mp3',
			teaseTwo: './assets/audio/tease-two.mp3',
			levelUp: './assets/audio/level-up.mp3',
			levelDown: './assets/audio/level-down.mp3',
			gameover: './assets/audio/gameover.mp3',
			playout: './assets/audio/playout.mp3',
			restart: './assets/audio/restart.mp3',
			win: './assets/audio/win.mp3',

		}
		this.soundsEnabled	= false
		// game timer
		this.gameTimer 		= null
		// chance
		this.chance			= 800
		
		this.initialize()
	}
	
	initialize() {
		this.timer()
		this.controls()
		this.debugTimer()
		this.disableScrolling()
		this.toggleSound()
	}
	
	timer() {
		this.gameTimer = setInterval(() => {
			this.focus()
			this.setState('select', this.level[ this.levelIndex ].active)
			this.tease( this.level[ this.levelIndex ] )
			// ranomize chance
			
			if(this.debugEnabled) {
				this.chance = 1
			} else {
				this.chance = this.random(0, 1100)
			}
			// check win or loose
			switch (this.levelIndex) {
				case 14:
					this.blocked = true
					this.setState('select', 0)
					clearInterval(this.gameTimer)
					this.status('show', 'You won')
					this.playSound('win')
				break;
				case 6:
					clearInterval(this.gameTimer)
					this.playout()
					this.playSound('playout')
				break;
				case 0:
					this.gameover = true
					this.blocked = true
					this.setState('select', 14)
					clearInterval(this.gameTimer)
					this.status('show', 'Game over')
					this.playSound('gameover')
				break;
			}
		}, 300)
	}
	
	playout() {
		this.ladderWrapper.scrollTo(0, 0)
		this.blocked = true
		this.animation(2)
	}
	
	animation( repeat ) {
		if(repeat == 0) {
			if(this.random(0,100) > 85) {
				this.levelIndex = this.random(7, 13)
			} else {
				this.levelIndex = 7
			}
			this.timer()
			this.blocked = false
			return
		} else {
			for (let i = 0; i < 9; i++ ){
				setTimeout(() => { this.setState('select', (8 - i)) },  50 * i)
			}
			
			setTimeout(() => {
				for (let i = 0; i < 9; i++ ){
					setTimeout(() => { this.setState('unselect', (8 - i)) },  50 * i)
				}
			}, 300)
			setTimeout(() => {
				return repeat * this.animation(repeat - 1)
			}, 600)
			
		}
	}
	
	setState( state, index ) {
		switch (state) {
			case 'select':
			this.tiles[index].classList.add('active')
			break;
			case 'unselect':
			this.tiles[index].classList.remove('active')
			break;
		}
	}
	
	debugTimer() {
		if(!this.debugEnabled) return
		setInterval(() => {
			document.querySelector('#dbg-current-level').innerHTML = this.level[this.levelIndex].active + '(' + this.level[this.levelIndex].amount + ')'
			document.querySelector('#dbg-current-index').innerHTML = this.levelIndex
			document.querySelector('#dbg-level-info').innerHTML = `[ W: ${this.level[this.levelIndex].win}, L: ${this.level[this.levelIndex].loose}, P: ${this.level[this.levelIndex].prev} ]`
			document.querySelector('#dbg-cooldown').innerHTML = this.cooldown
			document.querySelector('#dbg-tease').innerHTML = this.toggleTeaser
			document.querySelector('#dbg-blocked').innerHTML = this.blocked
			document.querySelector('#dbg-chance').innerHTML = this.chance
		}, 50)
	}

	debug() {
		this.debugEnabled = true
		document.querySelector('#debug').style.display = "block"
		this.debugTimer()
		console.log("Debug enabled")
	}
	
	tease( level ) {
		if(!this.toggleTeaser) {
			this.setState( 'select', level.win )
			this.setState( 'unselect', level.loose )
			this.toggleTeaser = true
			this.playSound('teaseOne')
		} else {
			this.setState( 'select', level.loose )
			this.setState( 'unselect', level.win )
			this.toggleTeaser = false
			this.playSound('teaseTwo')
		}
	}
	
	status( action, text ) {
		var status = document.querySelector('#status')
		var statusText = document.querySelector('#statusText')
		var statusButton = document.querySelector('#statusButton')
		
		switch (action) {
			case 'hide':

			status.style.marginLeft = "-100%"
			break;
			case 'show':
			status.style.marginLeft = "0"
			statusText.innerText = text
			statusButton.onclick = () => {
				this.restart()
			}
			break;
		}
	}
	
	focus() {
		this.ladderWrapper.scrollTo(0, this.level[this.levelIndex].active * 40)
	}
	
	restart() {
		clearInterval(this.gameTimer)
		this.playSound('restart')
		this.levelIndex = 1
		this.blocked = false
		this.gameover = false
		this.status('hide', '')
		
		this.timer()		
	}
	
	random(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min);
	}	  
	
	controls() {
		window.onkeydown = function(e) { 
			return !(e.keyCode == 32 && e.target == document.body);
		};
		document.addEventListener('keydown', (e) => {
			if(e.key != ' ') return;
			if(this.cooldown) return;
			if(this.gameover) return this.restart();
			if(this.blocked) return;
			clearTimeout(this.cooldownTimer)
			this.cooldown = true
			this.cooldownTimer = setTimeout(() => { this.cooldown = false }, 400)
			
			this.setState('unselect', this.level[this.levelIndex].active)
			this.setState('unselect', this.level[this.levelIndex].prev)
			this.setState('unselect', this.level[this.levelIndex].loose)
			this.setState('unselect', this.level[this.levelIndex].win)
			this.logic()
			
		})
	}
	
	disableScrolling() {
		var disableScrolling = function (e) {
			e.stopPropagation()
			e.preventDefault()
			
			return false
		}
		this.ladderWrapper.addEventListener('scroll', disableScrolling, false)
		this.ladderWrapper.addEventListener('touchmove', disableScrolling, false)
		this.ladderWrapper.addEventListener('wheel', disableScrolling, false)
	}

	logic() {
		if(this.random(0, 1000) > this.chance) {
			this.levelIndex ++
			this.playSound('levelUp')
		} else {
			if (this.level[this.levelIndex].loose == 14) {
				this.levelIndex = 0
			} else {
				this.levelIndex --
			}
			this.playSound('levelDown')
		}
	}

	playSound( soundName ) {
		if(!this.soundsEnabled) return;
		let sound = new Audio(this.sounds[soundName])
		sound.volume = 0.1
		sound.play()
		setTimeout(() => { sound = null}, 300)
	}

	toggleSound() {
		var toggleSound = document.querySelector('#toggleSound')
		this.playSound('toggle')

		toggleSound.addEventListener('click', () => {
			if(this.soundsEnabled) {
				this.soundsEnabled = false
				toggleSound.style.backgroundImage = "url('../assets/img/mute.svg')"
			} else {
				this.soundsEnabled = true
				toggleSound.style.backgroundImage = "url('../assets/img/unmute.svg')"
			}
		})
	}
}

const RISKY = new Risky();
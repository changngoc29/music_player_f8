const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    songs: [
        {
            name: 'Piano Track 1',
            singer: 'Unknown',
            path: 'https://cdn.freesound.org/previews/640/640243_5674468-lq.mp3',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80'
        },
        {
            name: 'Piano track 2',
            singer: 'Unknown',
            path: 'https://cdn.freesound.org/previews/640/640243_5674468-lq.mp3',
            image: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80'
        },
        {
            name: 'Piano track 3',
            singer: 'Unknown',
            path: 'https://cdn.freesound.org/previews/640/640243_5674468-lq.mp3',
            image: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1031&q=80'
        },
        {
            name: 'Piano track 4',
            singer: 'Unknown',
            path: 'https://cdn.freesound.org/previews/640/640243_5674468-lq.mp3',
            image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80'
        },
    ],

    render: function(){
        const htmls = this.songs.map((song,index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index='${index}'>
                <div class="thumb" style="background-image: url('${song.image}');">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        });
        
        $('.playlist').innerHTML = htmls.join('');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        });
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Handle CD rotate
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        // Handle zoom in, zoom out CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;


            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth/cdWidth;
        }

        // Handle when click play
        playBtn.onclick = function(){
            if(_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
        }


        // When song is played
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // When audio is paused
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // When progress of song is changing
        audio.ontimeupdate = function(){
            if (audio.duration){
                const progressPercent = Math.floor(audio.currentTime/audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Handle when fast forward
        progress.onchange = function(e){
            const seektime = e.target.value/100 * audio.duration;
            audio.currentTime = seektime;
        }

        // Handle next song
        nextBtn.onclick = function(){
            if (_this.isRandom) {
                _this.playRandomSong();
            }
            else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Handle prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            }
            else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Random active
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle('active', _this.randomBtn);
            _this.setConfig('isRandom', _this.isRandom);
        }

        // When song is end
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            }
            else {
                nextBtn.click();
            }
        }

        // When repeat mode is on
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle('active', _this.isRepeat);
            _this.setConfig('isRepeat', _this.isRepeat);
        }

        // Handle when click the playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if ( songNode || e.target.closest('.option')) {
                // Handle when click the song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Handle when click the option

            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 200)
    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },

    playRandomSong: function(){
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(this.currentIndex === newIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    start: function() {
        this.loadConfig();

        // Define properties for object
        this.defineProperties();

        // Listen/ handle all events (DOM events)
        this.handleEvents();

        // Load info first song into UI when run the website
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Show inital status of btn repeat and random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },    
}

app.start();
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "Nam";

const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $(".progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "Có chàng trai viết lên cây",
            singer: "Phan Mạnh Quỳnh",
            path: "/assets/music/song-1.mp3",
            image: "/assets/img/song-1.jpg",
        },
        {
            name: "Cause I Love You",
            singer: "Noo Phước Thịnh",
            path: "/assets/music/song-2.mp3",
            image: "/assets/img/song-2.jpg",
        },
        {
            name: "Hết nhạc con về",
            singer: "RZ Mas x CUKAK ",
            path: "/assets/music/song-3.mp3",
            image: "/assets/img/song-3.jpg",
        },
        {
            name: "Vỡ tan",
            singer: "Trịnh Thăng Bình",
            path: "/assets/music/song-4.mp3",
            image: "/assets/img/song-4.jpg",
        },
        {
            name: "Buông đôi tay nhau ra",
            singer: "Sơn Tùng MTP",
            path: "/assets/music/song-5.mp3",
            image: "/assets/img/song-5.jpg",
        },
        {
            name: "Tháng 4 là lời nói dối của em",
            singer: "Hà Anh Tuấn",
            path: "/assets/music/song-6.mp3",
            image: "/assets/img/song-6.jpg",
        },
        {
            name: "Gương mặt lạ lẫm",
            singer: "Mr Siro",
            path: "/assets/music/song-7.mp3",
            image: "/assets/img/song-7.jpeg",
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${
                index === this.currentIndex ? "active" : ""
            }" data-index= "${index}">
                <div class="thumb" style="background-image: url('${
                    song.image
                }')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `;
        });
        playlist.innerHTML = htmls.join("");
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvent: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý CD quay/ dừng
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg" }],
            {
                duration: 10000,
                iteration: Infinity,
            }
        );
        cdThumbAnimate.pause();

        // Phóng to thu nhỏ CD
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi ấn play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        // Khi song được pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        // Xử lý khi tua nhanh
        progress.onchange = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        // Xử lý khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }

            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Xử lý khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Xử lý khi random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // Xử lý khi repeat song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        // Xử lý next song khi audio repeat
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Xử lý khi click vào song ở playlist

        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
            if (songNode || e.target.closest(".option")) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(
                        songNode.getAttribute("data-index")
                    );
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xử lý khi click vào song option
                if (e.target.closest(".options")) {
                    console.log(123);
                }
            }
        };
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 300);
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Lắng nghe, xử lý các sự kiện  (DOM events)
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên vòa UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlists
        this.render();

        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();

// js/bgm.js
// 簡易的なBGMプレイヤー（Web Audio APIによるピコピコ調ループ、または音声ファイル対応）

class SimpleBGM {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.timer = null;
  }

  // 簡易的なピコピコBGMを鳴らす関数（外部ファイルなしで動きます）
  startPikopiko(tempo = 300) {
    if (this.isPlaying) return;
    
    // ユーザー操作後にAudioContextを有効化
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.audioCtx = new AudioContext();
    this.isPlaying = true;

    // 簡単なアルペジオ（ランダムなメロディ）をループ再生
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // ドレミファソラシド
    
    this.timer = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx) return;
      
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'square'; // レトロなファミコン風の音
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      osc.frequency.setValueAtTime(randomNote, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime); // 音量は控えめ
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.2);
    }, tempo);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// グローバルにインスタンスを作成
const bgmPlayer = new SimpleBGM();

// 画面のどこかをクリックしたときに自動でBGMをONにする（ブラウザの制限対策）
document.addEventListener('click', () => {
  if (!bgmPlayer.isPlaying) {
    // ページの種類やファイル名に合わせてBGMの種類を変えられます
    const path = window.location.pathname;
    if (path.includes('battle.html')) {
      bgmPlayer.startPikopiko(180); // 戦闘中は少しテンポ早め
    } else if (path.includes('boss.html')) {
      bgmPlayer.startPikopiko(120); // ボス戦は重厚・スリリングに
    } else {
      bgmPlayer.startPikopiko(350); // メニューなどはのんびり
    }
  }
}, { once: true });

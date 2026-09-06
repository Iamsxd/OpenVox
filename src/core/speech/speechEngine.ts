export interface VoiceCommandHandlers {
  start?: () => void;
  stop?: () => void;
  record?: () => void;
  save?: () => void;
  calibrate?: () => void;
}

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

export class SpeechEngine {
  private recognition: RecognitionLike | null = null;
  private active = false;

  isRecognitionSupported(): boolean {
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  startCommands(language: string, handlers: VoiceCommandHandlers, onText?: (text: string) => void): void {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) throw new Error('Speech recognition is not supported by this browser.');
    this.stopCommands();
    this.recognition = new Recognition() as RecognitionLike;
    this.recognition.lang = language;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.onresult = (event: any) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) text += `${event.results[i][0].transcript} `;
      text = text.trim().toLowerCase();
      onText?.(text);
      if (/\b(start|почати|старт|beginnen|starten)\b|开始|启动/.test(text)) handlers.start?.();
      if (/\b(stop|стоп|зупини|anhalten|stopp)\b|停止|停下/.test(text)) handlers.stop?.();
      if (/\b(record|запис|записати|aufnahme|aufnehmen)\b|录音|录制/.test(text)) handlers.record?.();
      if (/\b(save|зберегти|speichern)\b|保存/.test(text)) handlers.save?.();
      if (/\b(calibrate|калібрувати|kalibrieren)\b|校准|校正/.test(text)) handlers.calibrate?.();
    };
    this.recognition.onerror = () => {
      this.active = false;
    };
    this.recognition.onend = () => {
      this.active = false;
    };
    this.recognition.start();
    this.active = true;
  }

  stopCommands(): void {
    if (this.recognition && this.active) this.recognition.stop();
    this.recognition = null;
    this.active = false;
  }

  speak(text: string, language = 'en-US'): void {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }
}

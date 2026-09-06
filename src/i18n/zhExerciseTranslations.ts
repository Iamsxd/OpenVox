type ExerciseCopy = { name?: string; description: string; instruction: string; focus: string[] };

export const zhExerciseTranslations: Record<string, ExerciseCopy> = {
  'lip-trill-5tone': {
    description: '在舒适音域内进行轻柔的五音热身。',
    instruction: '保持气流均匀、双唇放松。在高音或低音开始用力之前停止。',
    focus: ['热身', '气流', '声区协调']
  },
  'ng-siren': {
    description: '通过平滑滑音感受共鸣并连接不同声区。',
    instruction: '使用轻柔的“ng”音滑动，不要强行增大音量。',
    focus: ['共鸣', '声区过渡', '流畅性']
  },
  'straw-flow': {
    description: '用于轻松起音和稳定气流的低负担练习。',
    instruction: '条件允许时使用吸管或唇颤音。始终保持轻松，出现不适请停止。',
    focus: ['轻柔起音', '气流', '热身']
  },
  'major-scale-legato': {
    description: '用于训练音准和连贯乐句的单八度音阶。',
    instruction: '准确唱到每个音，不要滑入目标音，并保持元音稳定。',
    focus: ['音准', '连唱', '音阶']
  },
  'major-arpeggio': {
    description: '训练根音、三度、五度和八度之间的音高目标。',
    instruction: '唱出下一个音之前，先在心里听到它。',
    focus: ['音程', '音准', '气息支持']
  },
  'minor-arpeggio': {
    description: '训练小三和弦与八度音准。',
    instruction: '保持小三度准确，避免下行旋律逐渐偏低。',
    focus: ['小调', '音准']
  },
  'chromatic-5': {
    description: '用于提高音高准确性的紧凑半音阶型。',
    instruction: '保持轻松和节奏均匀，只有在重复准确后再提高速度。',
    focus: ['灵活性', '半音音准', '清晰度']
  },
  'rossini-scale': {
    description: '用于训练声乐灵活性的快速上下行大调音阶。',
    instruction: '动作要小而高效，不要增加下颌紧张。',
    focus: ['灵活性', '协调', '速度']
  },
  'thirds-pattern': {
    description: '在一个八度内交替演唱音阶三度。',
    instruction: '每次跳进都要清晰，不要在目标音之间含糊滑动。',
    focus: ['灵活性', '三度音程', '音准']
  },
  'fifth-jumps': {
    description: '通过重复纯五度训练音程准确性。',
    instruction: '跳进前先在心中准备高音，并保持起音干净。',
    focus: ['音程', '起音', '准确性']
  },
  'octave-jumps': {
    description: '跨越声区过渡练习八度目标。',
    instruction: '使用适中音量，不要把多余的声音重量推向高音。',
    focus: ['八度', '声区平衡', '准确性']
  },
  'messa-di-voce-lite': {
    description: '保持舒适音高，逐渐增强并减弱声音强度。',
    instruction: '改变音量时保持音高中心稳定，不要追求强制的最大音量。',
    focus: ['力度', '稳定性', '呼吸控制']
  },
  'long-tone-stability': {
    description: '通过长音训练音高居中和稳定性。',
    instruction: '寻找稳定的音高中心，不必追逐调音器上的每一次细微变化。',
    focus: ['稳定性', '保持', '音准']
  },
  'vibrato-observation': {
    description: '保持舒适音符并观察颤音频率和宽度。',
    instruction: '不要人为制造摆动，让自然颤音在舒适状态下出现。',
    focus: ['颤音', '稳定性', '觉察']
  },
  'breath-4-2-8': {
    description: '通过平静的吸气、屏息和呼气循环训练呼吸节奏。',
    instruction: '保持放松。如感到头晕或不适，请立即停止。',
    focus: ['呼吸节奏', '放松']
  },
  'breath-4-4-12': {
    description: '用于控制呼气的较长呼吸模式。',
    instruction: '保持肩膀放松，不要勉强屏息。',
    focus: ['呼吸控制', '呼气']
  },
  'fricative-sustain': {
    description: '持续发出均匀的“s”或“f”音，以控制呼出气流。',
    instruction: '追求安静稳定的气流，不要不惜代价追求最长时长。',
    focus: ['气流', '持续性', '气息支持']
  },
  'vowel-chain': {
    description: '在稳定音型上连贯演唱 [i-e-a-o-u] 元音序列。',
    instruction: '保持下颌放松，改变元音时不要同时改变音高。',
    focus: ['元音', '咬字', '共鸣']
  },
  'consonant-agility': {
    description: '在五音音型上快速协调辅音与元音。',
    instruction: '保持辅音清晰，同时不要中断气流。',
    focus: ['吐字', '灵活性', '协调']
  },
  'pitch-memory': {
    description: '听一个音，短暂停顿后将它唱出来。',
    instruction: '先在心中想象声音，完成尝试后再查看调音器。',
    focus: ['内在听觉', '音高记忆', '音高匹配']
  },
  'interval-identification': {
    description: '通过听觉辨认同度到八度之间的音程。',
    instruction: '回答前注意聆听音程的距离和听感特征。',
    focus: ['听音训练', '音程']
  },
  'interval-singback': {
    description: '聆听起始音和指定音程，然后唱出目标音高。',
    instruction: '开始演唱前，先在心中听到目标音。',
    focus: ['内在听觉', '音程模唱', '音高']
  },
  'steady-pulse': {
    description: '跟随可调节的节拍器稳定点击。',
    instruction: '动作保持简洁，尽量让每次点击之间的间隔相等。',
    focus: ['节拍', '时值']
  },
  'subdivision-switch': {
    description: '在四分音符、八分音符和三连音之间切换。',
    instruction: '切换节拍细分时保持基础拍速不变。',
    focus: ['节拍细分', '时值', '协调']
  },
  'syncopation-grid': {
    description: '在稳定节拍上练习非强拍起音。',
    instruction: '在心中计算细分，并保持主要节拍稳定。',
    focus: ['切分音', '时值']
  },
  'descending-hum': {
    description: '高强度练习后进行轻柔的下行哼鸣放松。',
    instruction: '使用很小的力量，并在达到不舒适的低音前停止。',
    focus: ['放松', '释放', '共鸣']
  },
  'gentle-sigh': {
    description: '用轻柔的下行叹气声释放不必要的用力。',
    instruction: '保持轻声和舒适；这不是音域测试。',
    focus: ['放松', '释放']
  }
};

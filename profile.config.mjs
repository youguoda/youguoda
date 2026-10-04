// Everything personal lives here. Edit, then run `npm run build`
// (the scheduled workflow rebuilds daily with fresh GitHub data).

export default {
  login: 'youguoda',
  wordmark: 'AGOODA',
  handle: '@youguoda',
  // Class label on the hero's detection box, YOLO-style.
  detection: 'engineer',
  tagline: '让机器看见，让智能落地',
  emphasis: ['看见', '落地'],
  taglineEn: 'Making machines see — and intelligence ship.',
  disciplines: ['MACHINE VISION', 'LLM INFERENCE', 'AGENTIC TOOLING', 'DESKTOP CRAFT'],

  focus: [
    { icon: 'scan', title: 'Machine Vision', detail: '工业相机 · ROI · 视觉检测' },
    { icon: 'bolt', title: 'LLM Inference', detail: 'vLLM · SGLang · PagedAttention' },
    { icon: 'sparkle', title: 'Agentic Tooling', detail: 'Claude Code · Codex · Skills' },
    { icon: 'monitor', title: 'Desktop Craft', detail: 'WPF · .NET · Qt · Windows 11' },
  ],

  rig: [
    { icon: 'chip', key: 'GPU', value: 'RTX 3060 · 12 GB' },
    { icon: 'layers', key: 'OS', value: 'Windows 11 + WSL2' },
    { icon: 'terminal', key: 'AGENTS', value: 'Claude Code · Codex' },
  ],

  philosophy: {
    quote: '方法论不该做成视图，该做成约束。',
    emphasis: ['约束'],
    en: 'Methodology shouldn’t be a view — it should be a constraint.',
    source: 'ProfessionalStation',
  },

  // [icon, label, brand colour]. Icons: `ui:*` are built in, `si:*` Simple Icons, `devicon:*` Devicon.
  stack: [
    { layer: 'INTELLIGENCE', items: [['si:pytorch', 'PyTorch', '#EE4C2C'], ['ui:vllm', 'vLLM', '#30A2FF'], ['si:huggingface', 'Hugging Face', '#FFD21E'], ['si:nvidia', 'CUDA', '#76B900']] },
    { layer: 'VISION', items: [['si:opencv', 'OpenCV', '#5C3EE8'], ['si:qt', 'Qt · PyQt', '#41CD52'], ['ui:camera', 'Industrial Cameras', '#22D3EE'], ['ui:aperture', 'Sony Camera SDK', '#A78BFA']] },
    { layer: 'AGENTS', items: [['si:claude', 'Claude Code', '#D97757'], ['ui:terminal', 'Codex', '#10A37F'], ['si:cursor', 'Cursor', '#B4B9C7'], ['si:alibabacloud', '百炼 Bailian', '#FF6A00']] },
    { layer: 'LANGUAGES', items: [['si:python', 'Python', '#3776AB'], ['devicon:csharp/csharp-plain', 'C#', '#9B4F96'], ['si:cplusplus', 'C++', '#00599C'], ['si:typescript', 'TypeScript', '#3178C6']] },
    { layer: 'PLATFORM', items: [['si:dotnet', '.NET', '#512BD4'], ['ui:windows', 'Windows', '#0078D4'], ['si:linux', 'Linux · WSL2', '#FCC624'], ['si:docker', 'Docker', '#2496ED']] },
  ],

  // Rendered as clickable cards, two per row. `motif` picks the card illustration.
  projects: [
    {
      repo: 'shiyu',
      title: '拾语 Shiyu',
      kind: 'DESKTOP CRAFT',
      motif: 'clipboard',
      desc: 'Windows 11 托盘常驻的剪贴板历史与翻译工具——安静记下你复制过的一切，需要时把外语变成中文。',
      tags: ['C#', 'WPF', '.NET 9', 'SQLite'],
    },
    {
      repo: 'SkillsHub',
      title: 'SkillsHub',
      kind: 'AGENTIC TOOLING',
      motif: 'sync',
      desc: '为 Windows + WSL2 打造的 AI Agent Skills 管理控制台，统一 Claude Code / Cursor / Codex 的技能生命周期。',
      tags: ['JavaScript', 'WSL2', 'SHA-256 Sync'],
    },
    {
      repo: 'SonyPro',
      title: 'SonyPro',
      kind: 'VISION × AGENTS',
      motif: 'shutter',
      desc: '索尼 ILCE-6700 遥控拍摄 + Agent 技能修图：照片直存电脑，自动提交任务，产物落盘对比查看。',
      tags: ['C#', '.NET 10', 'Camera SDK', 'Agents'],
    },
    {
      repo: 'AllCamera',
      title: 'AllCamera',
      kind: 'MACHINE VISION',
      motif: 'multicam',
      desc: '多品牌工业相机的统一接口与控制界面：设备发现、实时预览、软/硬触发、参数调节与 ROI 选择。',
      tags: ['Python', 'PyQt', 'OpenCV'],
    },
    {
      repo: 'qt-draw-region-master',
      title: 'QtDrawRegion',
      kind: 'MACHINE VISION',
      motif: 'roi',
      desc: '面向机器视觉与工业检测的 Qt 图像 ROI 绘制工具：旋转矩形、同心圆、多边形等十余种区域。',
      tags: ['C++', 'Qt', 'ROI'],
    },
    {
      repo: 'vllm_learn',
      title: 'vLLM Lab',
      kind: 'LLM INFERENCE',
      motif: 'batching',
      desc: 'vLLM + SGLang 推理框架实验场：连续批处理基准、关键参数探索与 PagedAttention 论文笔记。',
      tags: ['Python', 'vLLM', 'SGLang', 'CUDA'],
    },
  ],

  // Fixed colour slots for the language mix — a colour stays with its language
  // even if rankings change. Anything not listed folds into “Other”.
  languages: ['C#', 'Python', 'TypeScript', 'HTML'],
  // Languages left out of the telemetry mix (e.g. generated markup).
  excludeLanguages: [],
};

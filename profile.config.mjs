// Everything personal lives here. Edit, then run `npm run build`
// (the scheduled workflow rebuilds daily with fresh GitHub data).

export default {
  login: 'youguoda',
  wordmark: 'AGOODA',
  handle: '@youguoda',
  // Label chip on the hero's target frame.
  badge: 'LLM INFERENCE · TEST ENGINEER',
  tagline: '为国产算力，验证每一个 Token',
  emphasis: ['国产算力', '每一个 Token'],
  taglineEn: 'Validating every token on domestic GPGPU.',
  disciplines: ['LLM INFERENCE', 'GPGPU VALIDATION', 'BENCHMARKING', 'TEST AUTOMATION'],
  location: { city: 'SHANGHAI', cityCn: '上海', tz: 'UTC+8' },

  role: {
    title: '模型应用测试开发工程师',
    titleEn: 'Model Application Test Engineer',
    tags: ['LLM INFERENCE', 'DOMESTIC GPGPU', 'TEST & DEV'],
    org: '国产通用 GPU 芯片 · AI 算力解决方案',
    domain: '大模型推理 × 国产 GPGPU',
  },

  focus: [
    { icon: 'checklist', title: 'Inference Validation', detail: '功能 · 精度 · 稳定性' },
    { icon: 'gauge', title: 'Benchmarking', detail: '吞吐 · TTFT · TPOT · 并发' },
    { icon: 'layers', title: 'Frameworks', detail: 'vLLM · SGLang · OpenAI API' },
    { icon: 'terminal', title: 'Test Automation', detail: '自动化回归 · CI · 报告' },
  ],

  // [icon, label, brand colour]. Icons: `ui:*` are built in, `si:*` Simple Icons, `devicon:*` Devicon.
  stack: [
    { layer: 'INFERENCE', items: [['ui:vllm', 'vLLM', '#30A2FF'], ['ui:sglang', 'SGLang', '#A78BFA'], ['si:huggingface', 'Hugging Face', '#FFD21E'], ['si:pytorch', 'PyTorch', '#EE4C2C']] },
    { layer: 'COMPUTE', items: [['ui:chip', '国产 GPGPU', '#22D3EE'], ['si:nvidia', 'CUDA', '#76B900'], ['si:docker', 'Docker', '#2496ED'], ['si:linux', 'Linux · WSL2', '#FCC624']] },
    { layer: 'VALIDATION', items: [['ui:flask', 'lm-eval-harness', '#F472B6'], ['ui:gauge', 'Benchmarking', '#FBBF24'], ['ui:checklist', 'Regression', '#4ADE80'], ['si:githubactions', 'GitHub Actions', '#2088FF']] },
    { layer: 'LANGUAGES', items: [['si:python', 'Python', '#3776AB'], ['si:cplusplus', 'C++', '#00599C'], ['si:gnubash', 'Shell', '#4EAA25'], ['devicon:csharp/csharp-plain', 'C#', '#9B4F96']] },
    { layer: 'AI TOOLING', items: [['si:claude', 'Claude Code', '#D97757'], ['ui:terminal', 'Codex', '#10A37F'], ['si:cursor', 'Cursor', '#B4B9C7'], ['si:alibabacloud', '百炼 Bailian', '#FF6A00']] },
    { layer: 'VISION · PREV', items: [['si:opencv', 'OpenCV', '#5C3EE8'], ['si:qt', 'Qt · PyQt', '#41CD52'], ['ui:camera', 'Industrial Cameras', '#22D3EE'], ['ui:scan', 'Segmentation', '#A78BFA']] },
  ],

  // Rendered as clickable cards, two per row. `motif` picks the card illustration.
  projects: [
    {
      repo: 'vllm_learn',
      title: 'vLLM Lab',
      kind: 'LLM INFERENCE',
      motif: 'batching',
      desc: 'vLLM + SGLang 推理实验场：关键参数基准、连续批处理压测（RPS / TTFT / 延迟）与 PagedAttention 论文笔记。',
      tags: ['Python', 'vLLM', 'SGLang', 'CUDA'],
    },
    {
      repo: 'env-setup',
      title: 'env-setup',
      kind: 'GPU INFRA',
      motif: 'rack',
      desc: '大模型测试开发的环境基建：GPU 服务器上的 Docker 化 vLLM 推理服务、lm-eval-harness 评测与 10 分钟一键还原。',
      tags: ['Shell', 'Docker', 'vLLM', 'lm-eval'],
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
      repo: 'shiyu',
      title: '拾语 Shiyu',
      kind: 'DESKTOP CRAFT',
      motif: 'clipboard',
      desc: 'Windows 11 托盘常驻的剪贴板历史与翻译工具——安静记下你复制过的一切，需要时把外语变成中文。',
      tags: ['C#', 'WPF', '.NET 9', 'SQLite'],
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
  ],

  // Fixed colour slots for the language mix — a colour stays with its language
  // even if rankings change. Anything not listed folds into “Other”.
  languages: ['C#', 'Python', 'TypeScript', 'HTML'],
  // Languages left out of the telemetry mix (e.g. generated markup).
  excludeLanguages: [],
};

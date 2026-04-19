export default class NyxEngine {
  constructor() {
    this.memory = {};
  }

  respond(prompt, context = {}) {
    const mode = this.detectMode(prompt, context.modeOverride);
    const intent = this.detectIntent(prompt, mode);
    const memory = context.memory || {};

    const quick = this.quick(prompt, mode, intent);
    const expanded = this.expanded(prompt, mode, intent, memory);
    const deepDiveHint = `Di "ve más profundo" para convertir esto en un plan detallado.`;

    return {
      mode,
      quick,
      expanded,
      deepDiveHint,
      meta: {
        detectedIntent: intent,
        confidence: 0.82,
        suggestions: this.suggestionsFor(mode, intent)
      }
    };
  }

  detectMode(p, override) {
    if (override) return override;
    p = p.toLowerCase();
    if (p.includes("code") || p.includes("api")) return "developer";
    if (p.includes("teach") || p.includes("explain")) return "teacher";
    if (p.includes("story") || p.includes("idea") || p.includes("phonk")) return "creative";
    if (p.includes("compare") || p.includes("analysis")) return "analyst";
    return "chat";
  }

  detectIntent(p, mode) {
    p = p.toLowerCase();
    if (mode === "developer" && p.includes("login")) return "build_auth_system";
    if (mode === "creative" && p.includes("phonk")) return "phonk_concept";
    return "general";
  }

  quick(prompt, mode, intent) {
    return `Modo ${mode} → intención detectada: ${intent}.`;
  }

  expanded(prompt, mode, intent, memory) {
    return [
      `Prompt: "${prompt}"`,
      ``,
      `Interpretación:`,
      `- Modo: ${mode}`,
      `- Intención: ${intent}`,
      `- Memoria: ${JSON.stringify(memory)}`,
      ``,
      `Tu agente puede evolucionar aquí: tono, estructura, plantillas, personalidad.`
    ].join("\n");
  }

  suggestionsFor(mode, intent) {
    const base = [
      "Pídeme un plan paso a paso.",
      "Pídeme tres variaciones con distintos enfoques."
    ];
    if (mode === "developer") base.push("Pídeme un esquema de arquitectura.");
    if (mode === "creative") base.push("Pídeme una escena o letra.");
    return base;
  }
}

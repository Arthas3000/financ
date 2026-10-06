// Carteira — widgets e ações de Atalhos para o Scriptable.
// Instale o app Scriptable, crie um script chamado "Carteira" e cole este código.
//
// Usos:
//  • Widget (Tela de Início: pequeno ou médio; Tela Bloqueada: retangular, circular ou em linha)
//  • Atalho "Carteira Widget": recebe o resumo enviado pelo app e salva
//  • Parâmetro "resumo": devolve um texto para Siri ler
//  • Parâmetro "simular 2000 12" (ou "simular 2000 12 200"): compara produtos de renda fixa

const ARQUIVO = "carteira.json";
const COR = {
  fundo: Color.dynamic(new Color("#FFFFFF"), new Color("#1C1C1E")),
  texto: Color.dynamic(new Color("#000000"), new Color("#FFFFFF")),
  sec: Color.dynamic(new Color("#3C3C43", 0.6), new Color("#EBEBF5", 0.6)),
  verde: Color.dynamic(new Color("#34C759"), new Color("#30D158")),
  vermelho: Color.dynamic(new Color("#FF3B30"), new Color("#FF453A")),
  rf: Color.dynamic(new Color("#5856D6"), new Color("#5E5CE6")),
  rv: Color.dynamic(new Color("#FF9500"), new Color("#FF9F0A")),
  caixa: Color.dynamic(new Color("#8E8E93"), new Color("#98989D")),
  trilho: Color.dynamic(new Color("#767680", 0.12), new Color("#767680", 0.24))
};

/* ---------- arquivos ---------- */
function gerenciador() {
  try { const fm = FileManager.iCloud(); fm.documentsDirectory(); return fm; } catch (e) { return FileManager.local(); }
}
const fm = gerenciador();
const caminho = fm.joinPath(fm.documentsDirectory(), ARQUIVO);

async function ler() {
  if (!fm.fileExists(caminho)) return null;
  if (fm.isFileStoredIniCloud && fm.isFileStoredIniCloud(caminho)) await fm.downloadFileFromiCloud(caminho);
  try { return JSON.parse(fm.readString(caminho)); } catch (e) { return null; }
}
function salvar(dados) { fm.writeString(caminho, JSON.stringify(dados)); }

/* ---------- formatação ---------- */
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brl = x => BRL.format(x || 0);
const curto = x => {
  const a = Math.abs(x || 0);
  if (a >= 1e6) return "R$ " + (x / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi";
  if (a >= 1e4) return "R$ " + (x / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil";
  return brl(x);
};
const pct = (x, d = 1) => ((x || 0) * 100).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }) + "%";
const sinal = x => (x >= 0 ? "+" : "−") + brl(Math.abs(x));
const dataCurta = iso => { const d = new Date(iso); return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); };
const nomeMes = ym => new Date(ym + "-15").toLocaleDateString("pt-BR", { month: "long" });

/* ---------- simulador (mesmas fórmulas do app) ---------- */
const PRODUTOS = [
  ["CDB 100% do CDI", "cdi", 1.00, false, 0], ["CDB 110% do CDI", "cdi", 1.10, false, 0], ["CDB 115% do CDI", "cdi", 1.15, false, 0],
  ["LCI/LCA 90% do CDI", "cdi", 0.90, true, 0], ["LCI/LCA 95% do CDI", "cdi", 0.95, true, 0],
  ["CDB prefixado 13,8%", "pre", 0.138, false, 0], ["CDB IPCA + 7,65%", "ipca", 0.0765, false, 0],
  ["Tesouro Selic", "selic", 1.00, false, 0], ["Tesouro Prefixado 2029", "pre", 0.1372, false, 0.002], ["Poupança", "poup", 0.005, true, 0]
];
const irRate = d => d <= 180 ? 0.225 : d <= 360 ? 0.20 : d <= 720 ? 0.175 : 0.15;
function taxaAnual(idx, taxa, pr) {
  return idx === "cdi" ? taxa * pr.cdi : idx === "selic" ? taxa * pr.selic : idx === "pre" ? taxa
    : idx === "ipca" ? (1 + pr.ipca) * (1 + taxa) - 1 : Math.pow(1 + taxa + pr.tr, 12) - 1;
}
function simular(v0, n, a, pr) {
  return PRODUTOS.map(([nome, idx, taxa, isento, custo]) => {
    const i = Math.pow(1 + taxaAnual(idx, taxa, pr) - custo, 1 / 12) - 1;
    let bruto = v0 * Math.pow(1 + i, n), ir = isento ? 0 : (bruto - v0) * irRate(n * 365 / 12);
    for (let k = 1; k <= n; k++) { const v = a * Math.pow(1 + i, n - k); bruto += v; if (!isento) ir += (v - a) * irRate((n - k) * 365 / 12); }
    return { nome, liq: bruto - ir };
  }).sort((x, y) => y.liq - x.liq);
}

/* ---------- widgets ---------- */
function barra(d, largura, altura) {
  const ctx = new DrawContext(); ctx.size = new Size(largura, altura); ctx.opaque = false; ctx.respectScreenScale = true;
  const fundo = new Path(); fundo.addRoundedRect(new Rect(0, 0, largura, altura), altura / 2, altura / 2);
  ctx.addPath(fundo); ctx.setFillColor(COR.trilho); ctx.fillPath();
  const total = (d.rf || 0) + (d.rv || 0) + (d.caixa || 0);
  if (total > 0) {
    let x = 0;
    for (const [v, c] of [[d.rf, COR.rf], [d.rv, COR.rv], [d.caixa, COR.caixa]]) {
      const w = (v || 0) / total * largura; if (w <= 0) continue;
      const p = new Path(); p.addRoundedRect(new Rect(x, 0, Math.max(w - 1.5, 1), altura), altura / 2, altura / 2);
      ctx.addPath(p); ctx.setFillColor(c); ctx.fillPath(); x += w;
    }
  }
  return ctx.getImage();
}
function texto(pai, t, fonte, cor = COR.texto) { const x = pai.addText(t); x.font = fonte; x.textColor = cor; x.lineLimit = 1; x.minimumScaleFactor = 0.6; return x; }

function widgetVazio() {
  const w = new ListWidget(); w.backgroundColor = COR.fundo;
  texto(w, "Carteira", Font.semiboldSystemFont(13), COR.sec); w.addSpacer(6);
  const t = w.addText("Abra o app e toque em Atualizar widget."); t.font = Font.systemFont(13); t.textColor = COR.texto;
  return w;
}
function widgetPequeno(d) {
  const w = new ListWidget(); w.backgroundColor = COR.fundo; w.setPadding(14, 14, 14, 14);
  texto(w, "Carteira", Font.semiboldSystemFont(13), COR.sec); w.addSpacer(4);
  texto(w, curto(d.total), Font.boldRoundedSystemFont(24));
  const g = d.depositado > 0 ? d.ganho / d.depositado : 0;
  texto(w, `${d.ganho >= 0 ? "▲" : "▼"} ${pct(Math.abs(g))}`, Font.semiboldSystemFont(13), d.ganho >= 0 ? COR.verde : COR.vermelho);
  w.addSpacer();
  w.addImage(barra(d, 130, 6)).imageSize = new Size(130, 6);
  w.addSpacer(6);
  texto(w, `${brl(d.renda)}/mês`, Font.mediumSystemFont(12), COR.sec);
  texto(w, d.aportouMes ? `Aporte de ${nomeMes(d.mes)} ✓` : `Aporte de ${nomeMes(d.mes)} pendente`, Font.mediumSystemFont(11), d.aportouMes ? COR.verde : COR.rv);
  return w;
}
function widgetMedio(d) {
  const w = new ListWidget(); w.backgroundColor = COR.fundo; w.setPadding(14, 16, 14, 16);
  const topo = w.addStack(); topo.centerAlignContent();
  texto(topo, "Carteira", Font.semiboldSystemFont(13), COR.sec); topo.addSpacer();
  texto(topo, dataCurta(d.at), Font.systemFont(11), COR.sec);
  w.addSpacer(4);
  const linha = w.addStack(); linha.bottomAlignContent();
  texto(linha, brl(d.total), Font.boldRoundedSystemFont(28)); linha.addSpacer(8);
  const g = d.depositado > 0 ? d.ganho / d.depositado : 0;
  texto(linha, `${sinal(d.ganho)} (${pct(g)})`, Font.semiboldSystemFont(13), d.ganho >= 0 ? COR.verde : COR.vermelho);
  w.addSpacer(8);
  w.addImage(barra(d, 300, 7)).imageSize = new Size(300, 7);
  w.addSpacer(8);
  const leg = w.addStack();
  for (const [nome, v, c] of [["Renda fixa", d.rf, COR.rf], ["Variável", d.rv, COR.rv], ["Renda/mês", d.renda, COR.verde]]) {
    const col = leg.addStack(); col.layoutVertically();
    texto(col, "● " + nome, Font.mediumSystemFont(11), c); texto(col, curto(v), Font.semiboldRoundedSystemFont(14));
    leg.addSpacer();
  }
  w.addSpacer();
  texto(w, d.aportouMes ? `Aporte de ${nomeMes(d.mes)} feito` : `Aporte de ${nomeMes(d.mes)} pendente`, Font.mediumSystemFont(12), d.aportouMes ? COR.sec : COR.rv);
  return w;
}
function widgetRetangular(d) {
  const w = new ListWidget();
  texto(w, "Carteira", Font.semiboldSystemFont(12));
  texto(w, brl(d.total), Font.boldRoundedSystemFont(17));
  texto(w, `${sinal(d.ganho)} · ${brl(d.renda)}/mês`, Font.systemFont(12));
  return w;
}
function widgetCircular(d) {
  const w = new ListWidget(); w.addAccessoryWidgetBackground = true;
  const g = d.depositado > 0 ? d.ganho / d.depositado : 0;
  const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
  const a = texto(s, g >= 0 ? "▲" : "▼", Font.boldSystemFont(10)); a.centerAlignText();
  const b = texto(s, pct(Math.abs(g)), Font.boldRoundedSystemFont(12)); b.centerAlignText();
  return w;
}
function widgetLinha(d) { const w = new ListWidget(); w.addText(`Carteira ${curto(d.total)} ${d.ganho >= 0 ? "▲" : "▼"}${pct(Math.abs(d.depositado ? d.ganho / d.depositado : 0))}`); return w; }

function montarWidget(d, familia) {
  if (!d) return widgetVazio();
  switch (familia) {
    case "accessoryRectangular": return widgetRetangular(d);
    case "accessoryCircular": return widgetCircular(d);
    case "accessoryInline": return widgetLinha(d);
    case "medium": case "large": case "extraLarge": return widgetMedio(d);
    default: return widgetPequeno(d);
  }
}

/* ---------- texto para Siri ---------- */
function resumo(d) {
  if (!d) return "Ainda não há dados. Abra o app Carteira e toque em Atualizar widget.";
  const g = d.depositado > 0 ? d.ganho / d.depositado : 0;
  return `Seu patrimônio estimado é ${brl(d.total)}, ${d.ganho >= 0 ? "com ganho" : "com perda"} de ${brl(Math.abs(d.ganho))}, ou ${pct(Math.abs(g))} sobre ${brl(d.depositado)} depositados. ` +
    `Renda fixa: ${brl(d.rf)}. Renda variável: ${brl(d.rv)}. Renda estimada de ${brl(d.renda)} por mês. ` +
    (d.aportouMes ? `O aporte de ${nomeMes(d.mes)} já foi feito.` : `O aporte de ${nomeMes(d.mes)} ainda está pendente.`) +
    ` Dados de ${dataCurta(d.at)}.`;
}

/* ---------- entrada ---------- */
const PADRAO = { cdi: 0.1365, selic: 0.1375, ipca: 0.042, tr: 0.0015 };
async function principal() {
  const entrada = args.shortcutParameter ?? args.widgetParameter ?? null;
  const dados = await ler();

  if (config.runsInWidget) {
    const w = montarWidget(dados, config.widgetFamily);
    w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
    Script.setWidget(w); return;
  }

  if (entrada !== null && entrada !== undefined) {
    let obj = entrada;
    if (typeof entrada === "string") { try { obj = JSON.parse(entrada); } catch (e) { obj = entrada.trim(); } }

    if (obj && typeof obj === "object" && obj.app === "carteira") {
      salvar(obj);
      Script.setShortcutOutput(`Widget atualizado: ${brl(obj.total)}`); return;
    }
    if (typeof obj === "string" && /^resumo/i.test(obj)) { Script.setShortcutOutput(resumo(dados)); return; }
    if (typeof obj === "string" && /^simular/i.test(obj)) {
      const nums = (obj.match(/[\d.,]+/g) || []).map(s => Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s));
      const [v0 = 1000, n = 12, a = 0] = nums;
      const meses = Math.max(1, Math.min(600, Math.round(n)));
      const r = simular(v0, meses, a, (dados && dados.premissas) || PADRAO).slice(0, 3);
      Script.setShortcutOutput(`Com ${brl(v0)}${a ? ` mais ${brl(a)} por mês` : ""} por ${meses} meses, as melhores opções líquidas são: ` +
        r.map((x, i) => `${i + 1}º ${x.nome}, ${brl(x.liq)}`).join("; ") + "."); return;
    }
    Script.setShortcutOutput("Não entendi. Use: resumo, ou simular valor meses."); return;
  }

  // executado dentro do app Scriptable: mostra a prévia
  const w = montarWidget(dados, "medium");
  await w.presentMedium();
}
await principal();
Script.complete();

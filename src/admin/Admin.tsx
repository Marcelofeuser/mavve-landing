import { useState, useEffect } from "react"

const SUPABASE_URL = "https://rjvcoxjzjcnyiwwaguwe.supabase.co"
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdmNveGp6amNueWl3d2FndXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjc3NjYsImV4cCI6MjA5Mzc0Mzc2Nn0.nzGNXsJ81idfaa05lBmpZpW99uRkh6IaA5FebjMqjnE"
const COMPANY_ID = "00000000-0000-0000-0000-000000000001"

const db = async (path: string, opts: any = {}) => {
  const prefer = opts.prefer ?? "return=representation"
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      "Content-Type": "application/json",
      Prefer: prefer,
      ...(opts.headers ?? {})
    }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.status === 204 ? null : res.json()
}

const upsertSettings = async (entries: {company_id: string, section: string, key: string, value: string}[]) => {
  for (const entry of entries) {
    const check = await db(`landing_settings?company_id=eq.${entry.company_id}&section=eq.${entry.section}&key=eq.${entry.key}&select=id`)
    if (check && check.length > 0) {
      await db(`landing_settings?company_id=eq.${entry.company_id}&section=eq.${entry.section}&key=eq.${entry.key}`, {
        method: "PATCH", body: JSON.stringify({ value: entry.value }), prefer: "return=minimal"
      })
    } else {
      await db(`landing_settings`, { method: "POST", body: JSON.stringify(entry), prefer: "return=minimal" })
    }
  }
}

const sha256 = async (text: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}

type Tab = "hero" | "strip" | "promocoes" | "secoes" | "vouchers" | "fidelidade" | "seo" | "popup"

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "hero", label: "Hero", icon: "🏠" },
  { id: "strip", label: "Strip", icon: "✦" },
  { id: "promocoes", label: "Promoções", icon: "🏷️" },
  { id: "secoes", label: "Seções", icon: "📄" },
  { id: "vouchers", label: "Vouchers", icon: "🎟️" },
  { id: "fidelidade", label: "Fidelidade", icon: "👑" },
  { id: "seo", label: "SEO", icon: "🔍" },
  { id: "popup", label: "Popup", icon: "💬" },
]

// LOGIN
function Login({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const pinHash = await sha256(`mavve:${pin}:pratas2026`)
      const passHash = await sha256(password)
      const data = await db(`landing_admins?company_id=eq.${COMPANY_ID}&pin_hash=eq.${pinHash}&password_hash=eq.${passHash}&select=id`)
      if (data && data.length > 0) {
        sessionStorage.setItem("landing_admin", "1")
        onLogin()
      } else {
        setError("PIN ou senha incorretos")
      }
    } catch {
      setError("Erro ao autenticar")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#4A0F1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 48, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="Mavwê" style={{ height: 60, marginBottom: 16 }} />
          <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A7A83" }}>Painel Administrativo</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C3D47", display: "block", marginBottom: 6 }}>PIN</label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(107,26,43,0.2)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            placeholder="4 dígitos" />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C3D47", display: "block", marginBottom: 6 }}>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(107,26,43,0.2)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            placeholder="Senha de acesso"
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        {error && <div style={{ color: "#c0392b", fontSize: 12, marginBottom: 16, textAlign: "center" }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", background: "#6B1A2B", color: "#E8C97A",
          border: "none", padding: "14px", fontSize: 12,
          letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer"
        }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  )
}

// HERO TAB
function HeroTab() {
  const [form, setForm] = useState({ title: "", subtitle: "", eyebrow: "", btn1: "", btn2: "", btn1url: "", btn2url: "" })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    db(`landing_settings?company_id=eq.${COMPANY_ID}&section=eq.hero&select=key,value`).then((data: any[]) => {
      const obj: any = {}
      data?.forEach((d: any) => obj[d.key] = d.value)
      setForm(f => ({ ...f, ...obj }))
    }).catch(() => {})
  }, [])

  const save = async () => {
    const entries = Object.entries(form).map(([key, value]) => ({
      company_id: COMPANY_ID, section: "hero", key, value
    }))
    await upsertSettings(entries)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={styles.tabTitle}>Hero Principal</h2>
      <div style={styles.grid2}>
        <Field label="Eyebrow (texto pequeno)" value={form.eyebrow} onChange={v => setForm(f => ({ ...f, eyebrow: v }))} />
        <Field label="Título principal" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
        <Field label="Subtítulo" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} />
        <Field label="Botão 1 (texto)" value={form.btn1} onChange={v => setForm(f => ({ ...f, btn1: v }))} />
        <Field label="Botão 1 (URL)" value={form.btn1url} onChange={v => setForm(f => ({ ...f, btn1url: v }))} />
        <Field label="Botão 2 (texto)" value={form.btn2} onChange={v => setForm(f => ({ ...f, btn2: v }))} />
        <Field label="Botão 2 (URL)" value={form.btn2url} onChange={v => setForm(f => ({ ...f, btn2url: v }))} />
      </div>
      <SaveBtn onClick={save} saved={saved} />
    </div>
  )
}

// STRIP TAB
function StripTab() {
  const [items, setItems] = useState([
    { icon: "✦", text: "Prata 925 Certificada" },
    { icon: "◈", text: "Envio para todo Brasil" },
    { icon: "◇", text: "Garantia Vitalícia" },
    { icon: "◆", text: "Parcelamos em 12x" },
  ])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    db(`landing_settings?company_id=eq.${COMPANY_ID}&section=eq.strip&key=eq.items&select=value`).then((data: any[]) => {
      if (data?.[0]?.value) setItems(JSON.parse(data[0].value))
    }).catch(() => {})
  }, [])

  const save = async () => {
    await upsertSettings([{ company_id: COMPANY_ID, section: "strip", key: "items", value: JSON.stringify(items) }])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={styles.tabTitle}>Strip de Benefícios</h2>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <input value={item.icon} onChange={e => { const n = [...items]; n[i].icon = e.target.value; setItems(n) }}
            style={{ ...styles.input, width: 60 }} placeholder="ícone" />
          <input value={item.text} onChange={e => { const n = [...items]; n[i].text = e.target.value; setItems(n) }}
            style={{ ...styles.input, flex: 1 }} placeholder="Texto" />
          <button onClick={() => setItems(items.filter((_, j) => j !== i))} style={styles.btnDanger}>✕</button>
        </div>
      ))}
      <button onClick={() => setItems([...items, { icon: "✦", text: "" }])} style={styles.btnSecondary}>+ Adicionar item</button>
      <SaveBtn onClick={save} saved={saved} />
    </div>
  )
}

// PROMOÇÕES TAB
function PromocoesTab() {
  const [offers, setOffers] = useState([
    { discount: "30%", label: "de desconto", name: "Coleção Verão", desc: "Anéis e pulseiras com acabamento dourado", active: true },
    { discount: "2x1", label: "na compra", name: "Brincos Selecionados", desc: "Pares clássicos e modernos em prata 925", active: true },
    { discount: "20%", label: "de desconto", name: "Colares Longos", desc: "Modelos exclusivos com pedras naturais", active: true },
  ])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    db(`landing_settings?company_id=eq.${COMPANY_ID}&section=eq.promocoes&key=eq.offers&select=value`).then((data: any[]) => {
      if (data?.[0]?.value) setOffers(JSON.parse(data[0].value))
    }).catch(() => {})
  }, [])

  const save = async () => {
    await upsertSettings([{ company_id: COMPANY_ID, section: "promocoes", key: "offers", value: JSON.stringify(offers) }])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addOffer = () => setOffers([...offers, { discount: "", label: "de desconto", name: "", desc: "", active: true }])

  return (
    <div>
      <h2 style={styles.tabTitle}>Promoções</h2>
      {offers.map((o, i) => (
        <div key={i} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={styles.cardLabel}>Promoção {i + 1}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <input type="checkbox" checked={o.active} onChange={e => { const n = [...offers]; n[i].active = e.target.checked; setOffers(n) }} />
                Ativa
              </label>
              <button onClick={() => setOffers(offers.filter((_, j) => j !== i))} style={styles.btnDanger}>✕</button>
            </div>
          </div>
          <div style={styles.grid2}>
            <Field label="Destaque (ex: 30%)" value={o.discount} onChange={v => { const n = [...offers]; n[i].discount = v; setOffers(n) }} />
            <Field label="Label (ex: de desconto)" value={o.label} onChange={v => { const n = [...offers]; n[i].label = v; setOffers(n) }} />
            <Field label="Nome" value={o.name} onChange={v => { const n = [...offers]; n[i].name = v; setOffers(n) }} />
            <Field label="Descrição" value={o.desc} onChange={v => { const n = [...offers]; n[i].desc = v; setOffers(n) }} />
          </div>
        </div>
      ))}
      <button onClick={addOffer} style={styles.btnSecondary}>+ Nova Promoção</button>
      <SaveBtn onClick={save} saved={saved} />
    </div>
  )
}

// VOUCHERS TAB
function VouchersTab() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [form, setForm] = useState({ code: "", description: "", discount_type: "percent", discount_value: "", min_purchase: "", max_uses: "", expires_at: "" })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () => db(`landing_vouchers?company_id=eq.${COMPANY_ID}&order=created_at.desc`).then(setVouchers).catch(() => {})

  useEffect(() => { load() }, [])

  const create = async () => {
    setLoading(true)
    try {
      await db(`landing_vouchers`, {
        method: "POST",
        body: JSON.stringify({
          company_id: COMPANY_ID,
          code: form.code.toUpperCase(),
          description: form.description,
          discount_type: form.discount_type,
          discount_value: parseFloat(form.discount_value) || 0,
          min_purchase: parseFloat(form.min_purchase) || 0,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          expires_at: form.expires_at || null,
          active: true
        }),
        prefer: "return=minimal"
      })
      setForm({ code: "", description: "", discount_type: "percent", discount_value: "", min_purchase: "", max_uses: "", expires_at: "" })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      load()
    } catch (e: any) {
      alert("Erro: " + e.message)
    }
    setLoading(false)
  }

  const toggle = async (id: string, active: boolean) => {
    await db(`landing_vouchers?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ active: !active }), prefer: "return=minimal" })
    load()
  }

  return (
    <div>
      <h2 style={styles.tabTitle}>Vouchers</h2>
      <div style={styles.card}>
        <div style={styles.cardLabel}>Novo Voucher</div>
        <div style={styles.grid2}>
          <Field label="Código" value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="Ex: MAVVE10" />
          <Field label="Descrição" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <div>
            <label style={styles.label}>Tipo de Desconto</label>
            <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))} style={styles.input}>
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <Field label={form.discount_type === "percent" ? "Desconto (%)" : "Desconto (R$)"} value={form.discount_value} onChange={v => setForm(f => ({ ...f, discount_value: v }))} type="number" />
          <Field label="Compra mínima (R$)" value={form.min_purchase} onChange={v => setForm(f => ({ ...f, min_purchase: v }))} type="number" />
          <Field label="Limite de usos (vazio = ilimitado)" value={form.max_uses} onChange={v => setForm(f => ({ ...f, max_uses: v }))} type="number" />
          <Field label="Validade" value={form.expires_at} onChange={v => setForm(f => ({ ...f, expires_at: v }))} type="date" />
        </div>
        <button onClick={create} disabled={loading || !form.code} style={styles.btnPrimary}>
          {loading ? "Criando..." : "Criar Voucher"}
        </button>
        {saved && <span style={{ color: "#27ae60", marginLeft: 12, fontSize: 12 }}>✓ Criado!</span>}
      </div>

      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, color: "#4A0F1E", marginBottom: 16 }}>Vouchers Ativos</h3>
      {vouchers.map((v: any) => (
        <div key={v.id} style={{ ...styles.card, opacity: v.active ? 1 : 0.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 20, fontWeight: 600, color: "#6B1A2B" }}>{v.code}</span>
              <span style={{ marginLeft: 12, fontSize: 12, color: "#9A7A83" }}>{v.description}</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#5C3D47" }}>
                {v.discount_type === "percent" ? `${v.discount_value}%` : `R$ ${v.discount_value}`} off
                {v.min_purchase > 0 ? ` · mín R$${v.min_purchase}` : ""}
                {v.max_uses ? ` · ${v.uses_count}/${v.max_uses} usos` : ` · ${v.uses_count} usos`}
                {v.expires_at ? ` · até ${new Date(v.expires_at).toLocaleDateString("pt-BR")}` : ""}
              </span>
              <button onClick={() => toggle(v.id, v.active)} style={v.active ? styles.btnDanger : styles.btnSecondary}>
                {v.active ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// FIDELIDADE TAB
function FidelidadeTab() {
  const [members, setMembers] = useState<any[]>([])
  const [config, setConfig] = useState({ bronze_min: "0", silver_min: "500", gold_min: "1500", points_per_real: "1", saved: false })

  useEffect(() => {
    db(`loyalty_members?company_id=eq.${COMPANY_ID}&order=total_spent.desc&select=*,customer:customers(name,whatsapp)`).then(setMembers).catch(() => {})
    db(`landing_settings?company_id=eq.${COMPANY_ID}&section=eq.loyalty&select=key,value`).then((data: any[]) => {
      const obj: any = {}
      data?.forEach((d: any) => obj[d.key] = d.value)
      setConfig(c => ({ ...c, ...obj }))
    }).catch(() => {})
  }, [])

  const saveCfg = async () => {
    const entries = ["bronze_min", "silver_min", "gold_min", "points_per_real"].map(key => ({
      company_id: COMPANY_ID, section: "loyalty", key, value: (config as any)[key]
    }))
    await upsertSettings(entries)
    setConfig(c => ({ ...c, saved: true }))
    setTimeout(() => setConfig(c => ({ ...c, saved: false })), 2000)
  }

  const tierColor: Record<string, string> = { Bronze: "#CD7F32", Prata: "#C0C0C0", Ouro: "#C9A84C" }

  return (
    <div>
      <h2 style={styles.tabTitle}>Clube de Fidelidade</h2>
      <div style={styles.card}>
        <div style={styles.cardLabel}>Configurações</div>
        <div style={styles.grid2}>
          <Field label="Pontos por R$ gasto" value={config.points_per_real} onChange={v => setConfig(c => ({ ...c, points_per_real: v }))} type="number" />
          <Field label="Mínimo Bronze (R$)" value={config.bronze_min} onChange={v => setConfig(c => ({ ...c, bronze_min: v }))} type="number" />
          <Field label="Mínimo Prata (R$)" value={config.silver_min} onChange={v => setConfig(c => ({ ...c, silver_min: v }))} type="number" />
          <Field label="Mínimo Ouro (R$)" value={config.gold_min} onChange={v => setConfig(c => ({ ...c, gold_min: v }))} type="number" />
        </div>
        <button onClick={saveCfg} style={styles.btnPrimary}>Salvar Configurações</button>
        {config.saved && <span style={{ color: "#27ae60", marginLeft: 12, fontSize: 12 }}>✓ Salvo!</span>}
      </div>

      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, color: "#4A0F1E", marginBottom: 16 }}>Membros ({members.length})</h3>
      {members.length === 0 && <div style={{ color: "#9A7A83", fontSize: 13, textAlign: "center", padding: 40 }}>Nenhum membro ainda. Os clientes são adicionados automaticamente após a primeira compra.</div>}
      {members.map((m: any) => (
        <div key={m.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#4A0F1E" }}>{m.customer?.name ?? "Cliente"}</div>
              <div style={{ fontSize: 12, color: "#9A7A83" }}>{m.customer?.whatsapp}</div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ background: tierColor[m.tier] ?? "#CD7F32", color: "#fff", padding: "4px 12px", fontSize: 11, letterSpacing: "0.1em" }}>{m.tier}</span>
              <span style={{ fontSize: 13, color: "#5C3D47" }}>{m.points} pts</span>
              <span style={{ fontSize: 13, color: "#5C3D47" }}>R$ {Number(m.total_spent).toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// SEO TAB
function SeoTab() {
  const [form, setForm] = useState({ title: "", description: "", og_image: "", keywords: "" })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    db(`landing_settings?company_id=eq.${COMPANY_ID}&section=eq.seo&select=key,value`).then((data: any[]) => {
      const obj: any = {}
      data?.forEach((d: any) => obj[d.key] = d.value)
      setForm(f => ({ ...f, ...obj }))
    }).catch(() => {})
  }, [])

  const save = async () => {
    const entries = Object.entries(form).map(([key, value]) => ({ company_id: COMPANY_ID, section: "seo", key, value }))
    await upsertSettings(entries)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={styles.tabTitle}>SEO</h2>
      <div style={styles.grid2}>
        <Field label="Título da página" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
        <Field label="Palavras-chave" value={form.keywords} onChange={v => setForm(f => ({ ...f, keywords: v }))} />
        <Field label="Descrição (meta description)" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
        <Field label="Imagem OG (URL)" value={form.og_image} onChange={v => setForm(f => ({ ...f, og_image: v }))} />
      </div>
      <SaveBtn onClick={save} saved={saved} />
    </div>
  )
}

// POPUP TAB
function PopupTab() {
  const [form, setForm] = useState({ active: false, title: "", text: "", btn: "", btn_url: "", delay: "3" })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    db(`landing_settings?company_id=eq.${COMPANY_ID}&section=eq.popup&select=key,value`).then((data: any[]) => {
      const obj: any = {}
      data?.forEach((d: any) => obj[d.key] = d.value)
      setForm(f => ({ ...f, ...obj, active: obj.active === "true" }))
    }).catch(() => {})
  }, [])

  const save = async () => {
    const entries = Object.entries(form).map(([key, value]) => ({ company_id: COMPANY_ID, section: "popup", key, value: String(value) }))
    await upsertSettings(entries)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={styles.tabTitle}>Popup de Oferta</h2>
      <div style={styles.card}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, cursor: "pointer" }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          <span style={{ fontSize: 13, color: "#5C3D47" }}>Popup ativo</span>
        </label>
        <div style={styles.grid2}>
          <Field label="Título" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
          <Field label="Delay (segundos)" value={form.delay} onChange={v => setForm(f => ({ ...f, delay: v }))} type="number" />
          <Field label="Texto" value={form.text} onChange={v => setForm(f => ({ ...f, text: v }))} />
          <Field label="Texto do botão" value={form.btn} onChange={v => setForm(f => ({ ...f, btn: v }))} />
          <Field label="URL do botão" value={form.btn_url} onChange={v => setForm(f => ({ ...f, btn_url: v }))} />
        </div>
      </div>
      <SaveBtn onClick={save} saved={saved} />
    </div>
  )
}

// SEÇÕES TAB
function SecoesTab() {
  const [sections, setSections] = useState<any[]>([])

  const load = () => db(`landing_sections?company_id=eq.${COMPANY_ID}&order=position.asc`).then(setSections).catch(() => {})
  useEffect(() => { load() }, [])

  const addSection = async (type: string) => {
    await db(`landing_sections`, {
      method: "POST",
      body: JSON.stringify({ company_id: COMPANY_ID, type, title: "Nova Seção", content: {}, active: true, position: sections.length }),
      prefer: "return=minimal"
    })
    load()
  }

  const toggle = async (id: string, active: boolean) => {
    await db(`landing_sections?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ active: !active }), prefer: "return=minimal" })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm("Remover seção?")) return
    await db(`landing_sections?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" })
    load()
  }

  const SECTION_TYPES = [
    { type: "banner", label: "Banner com imagem" },
    { type: "depoimentos", label: "Depoimentos" },
    { type: "colecao", label: "Coleção destaque" },
    { type: "instagram", label: "Feed Instagram" },
    { type: "video", label: "Vídeo" },
    { type: "texto", label: "Texto livre" },
  ]

  return (
    <div>
      <h2 style={styles.tabTitle}>Seções da Página</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {SECTION_TYPES.map(s => (
          <button key={s.type} onClick={() => addSection(s.type)} style={styles.btnSecondary}>+ {s.label}</button>
        ))}
      </div>
      {sections.map((s: any) => (
        <div key={s.id} style={{ ...styles.card, opacity: s.active ? 1 : 0.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#4A0F1E" }}>{s.title}</span>
              <span style={{ marginLeft: 8, fontSize: 11, color: "#9A7A83", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.type}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => toggle(s.id, s.active)} style={s.active ? styles.btnSecondary : styles.btnPrimary}>{s.active ? "Ocultar" : "Mostrar"}</button>
              <button onClick={() => remove(s.id)} style={styles.btnDanger}>Remover</button>
            </div>
          </div>
        </div>
      ))}
      {sections.length === 0 && <div style={{ color: "#9A7A83", fontSize: 13, textAlign: "center", padding: 40 }}>Nenhuma seção extra. Adicione acima.</div>}
    </div>
  )
}

// SHARED COMPONENTS
function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={styles.input} />
    </div>
  )
}

function SaveBtn({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <div style={{ marginTop: 24 }}>
      <button onClick={onClick} style={styles.btnPrimary}>Salvar Alterações</button>
      {saved && <span style={{ color: "#27ae60", marginLeft: 12, fontSize: 12 }}>✓ Salvo com sucesso!</span>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  tabTitle: { fontFamily: "Cormorant Garamond, serif", fontSize: 28, fontWeight: 400, color: "#4A0F1E", marginBottom: 24 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: { background: "#FAF7F2", border: "1px solid rgba(201,168,76,0.2)", padding: 20, marginBottom: 16 },
  cardLabel: { fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#C9A84C", marginBottom: 12 },
  label: { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#5C3D47", display: "block" as const, marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid rgba(107,26,43,0.2)", fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box" as const },
  btnPrimary: { background: "#6B1A2B", color: "#E8C97A", border: "none", padding: "12px 24px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" as const, cursor: "pointer" },
  btnSecondary: { background: "transparent", color: "#6B1A2B", border: "1px solid #6B1A2B", padding: "10px 18px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, cursor: "pointer" },
  btnDanger: { background: "transparent", color: "#c0392b", border: "1px solid #c0392b", padding: "8px 14px", fontSize: 11, cursor: "pointer" },
}

// MAIN ADMIN
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("landing_admin") === "1")
  const [tab, setTab] = useState<Tab>("hero")

  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  const TAB_COMPONENTS: Record<Tab, React.ReactNode> = {
    hero: <HeroTab />,
    strip: <StripTab />,
    promocoes: <PromocoesTab />,
    secoes: <SecoesTab />,
    vouchers: <VouchersTab />,
    fidelidade: <FidelidadeTab />,
    seo: <SeoTab />,
    popup: <PopupTab />,
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Jost, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#4A0F1E", padding: "32px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 24px 32px" }}>
          <img src="/logo.png" alt="Mavwê" style={{ height: 44, filter: "brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(5deg)" }} />
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)", marginTop: 8 }}>Admin Landing</div>
        </div>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? "rgba(201,168,76,0.15)" : "transparent",
            border: "none",
            borderLeft: tab === t.id ? "3px solid #C9A84C" : "3px solid transparent",
            color: tab === t.id ? "#E8C97A" : "rgba(245,237,213,0.6)",
            padding: "14px 24px", textAlign: "left", fontSize: 12,
            letterSpacing: "0.08em", cursor: "pointer", width: "100%",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
        <div style={{ marginTop: "auto", padding: "24px" }}>
          <button onClick={() => { sessionStorage.removeItem("landing_admin"); setAuthed(false) }}
            style={{ ...styles.btnDanger, width: "100%", fontSize: 10 }}>
            Sair
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 40, background: "#fff", overflowY: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {TAB_COMPONENTS[tab]}
        </div>
      </div>
    </div>
  )
}

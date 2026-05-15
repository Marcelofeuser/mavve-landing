import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://rjvcoxjzjcnyiwwaguwe.supabase.co'
const NUVEMSHOP_URL = 'https://mavve.lojavirtualnuvem.com.br'

type Product = {
  id: string
  sku: string
  name: string
  category: string
  price: number
  stock: number
}

const CATEGORIES = ['Todos', 'Aneis', 'Colares', 'Pulseiras', 'Brincos']

const categoryFilter = (cat: string, filter: string) => {
  if (filter === 'Todos') return true
  const map: Record<string, string[]> = {
    'Aneis': ['anel', 'ring'],
    'Colares': ['colar', 'necklace', 'corrente'],
    'Pulseiras': ['pulseira', 'bracelet'],
    'Brincos': ['brinco', 'earring'],
  }
  const terms = map[filter] || []
  return terms.some(t => (cat || '').toLowerCase().includes(t))
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(250,247,242,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : 'none',
      padding: '0 40px', height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.3s ease'
    }}>
      <a href="#" style={{ textDecoration: 'none' }}>
        <img src="/logo.png" alt="Mavwe" style={{
          height: scrolled ? 64 : 90,
          transition: 'height 0.3s ease',
          filter: scrolled ? 'none' : 'brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(5deg)'
        }} />
      </a>
      <ul style={{ display: 'flex', gap: 32, listStyle: 'none' }}>
        {['lancamentos', 'colecoes', 'promocoes'].map((slug, i) => (
          <li key={slug}>
            <a href={'#' + slug} style={{
              fontSize: 12, fontWeight: 400, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: scrolled ? '#5C3D47' : 'rgba(245,237,213,0.7)',
              textDecoration: 'none'
            }}>
              {['Lancamentos', 'Colecoes', 'Promocoes'][i]}
            </a>
          </li>
        ))}
      </ul>
      <a href={NUVEMSHOP_URL} target="_blank" rel="noopener noreferrer" style={{
        background: '#6B1A2B', color: '#E8C97A',
        padding: '10px 24px', fontSize: 11, fontWeight: 500,
        letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none'
      }}>
        Ver Loja
      </a>
    </nav>
  )
}

function Hero() {
  return (
    <section style={{
      minHeight: '100vh', background: '#4A0F1E',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 40px 60px'
    }}>
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 780 }}>
        <div style={{
          fontSize: 11, fontWeight: 300, letterSpacing: '0.35em',
          textTransform: 'uppercase', color: '#C9A84C', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16
        }}>
          <span style={{ width: 40, height: 1, background: '#C9A84C', opacity: 0.5, display: 'inline-block' }} />
          Pratas e Acessorios de Luxo
          <span style={{ width: 40, height: 1, background: '#C9A84C', opacity: 0.5, display: 'inline-block' }} />
        </div>
        <h1 style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(52px,8vw,96px)', fontWeight: 300,
          lineHeight: 0.95, color: '#FAF7F2',
          letterSpacing: '-0.02em', marginBottom: 16
        }}>
          Elegancia que{' '}
          <em style={{ color: '#E8C97A', fontStyle: 'italic' }}>dura para sempre</em>
        </h1>
        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(14px,2vw,18px)', fontWeight: 300, fontStyle: 'italic',
          color: 'rgba(245,237,213,0.6)', letterSpacing: '0.08em', marginBottom: 48
        }}>
          Joias em prata 925 com garantia vitalicia
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#lancamentos" style={{
            background: '#C9A84C', color: '#4A0F1E',
            padding: '16px 40px', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none'
          }}>Ver Lancamentos</a>
          <a href={NUVEMSHOP_URL} target="_blank" rel="noopener noreferrer" style={{
            background: 'transparent', color: '#E8C97A',
            border: '1px solid rgba(201,168,76,0.4)',
            padding: '16px 40px', fontSize: 11, fontWeight: 400,
            letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none'
          }}>Explorar Loja</a>
        </div>
      </div>
    </section>
  )
}

function Strip() {
  const items = ['Prata 925 Certificada', 'Envio para todo Brasil', 'Garantia Vitalicia', 'Parcelamos em 12x']
  return (
    <div style={{
      background: '#6B1A2B', padding: '18px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 48, flexWrap: 'wrap'
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F5EDD5', fontSize: 12, letterSpacing: '0.1em' }}>
          <span style={{ color: '#C9A84C' }}>✦</span>
          {item}
        </div>
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const url = NUVEMSHOP_URL + '/busca?q=' + encodeURIComponent(product.name)
  return (
    <div onClick={() => window.open(url, '_blank')} style={{
      background: '#fff', border: '1px solid rgba(201,168,76,0.15)',
      overflow: 'hidden', cursor: 'pointer'
    }}>
      <div style={{
        width: '100%', aspectRatio: '1', background: '#F0EAE0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: '#9A7A83'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity={0.3}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{product.sku}</span>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 10, color: '#9A7A83', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
          {product.category || 'Acessorio'}
        </div>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, fontWeight: 500, color: '#4A0F1E', lineHeight: 1.2, marginBottom: 14 }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 600, color: '#6B1A2B' }}>
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
            background: 'transparent', border: '1px solid #6B1A2B',
            color: '#6B1A2B', padding: '7px 16px', fontSize: 10,
            letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none'
          }}>Comprar</a>
        </div>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(201,168,76,0.1)', opacity: 0.7 }}>
      <div style={{ width: '100%', aspectRatio: '1', background: '#F0EAE0' }} />
      <div style={{ padding: 20 }}>
        <div style={{ height: 10, background: '#F0EAE0', marginBottom: 8, width: '60%' }} />
        <div style={{ height: 16, background: '#F0EAE0', marginBottom: 8, width: '80%' }} />
        <div style={{ height: 20, background: '#F0EAE0', width: '40%' }} />
      </div>
    </div>
  )
}

function Lancamentos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todos')
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(SUPABASE_URL + '/functions/v1/public-products?limit=8')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const filtered = filter === 'Todos' ? products : products.filter(p => categoryFilter(p.category, filter))

  return (
    <section id="lancamentos" style={{ padding: '80px 40px', background: '#FAF7F2' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 12 }}>Novidades</div>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, color: '#4A0F1E' }}>
            Ultimos <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Lancamentos</em>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '8px 18px',
              border: '1px solid ' + (filter === cat ? '#6B1A2B' : 'rgba(107,26,43,0.2)'),
              background: filter === cat ? '#6B1A2B' : 'transparent',
              color: filter === cat ? '#FAF7F2' : '#5C3D47',
              fontFamily: 'Jost, sans-serif', fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer'
            }}>{cat}</button>
          ))}
        </div>
        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#4A0F1E', marginBottom: 12 }}>Produtos em breve</div>
            <a href={NUVEMSHOP_URL} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', background: '#6B1A2B', color: '#E8C97A',
              padding: '14px 32px', fontSize: 11, letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none'
            }}>Ver Loja Completa</a>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
            : filtered.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
        {!loading && !error && (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <a href={NUVEMSHOP_URL} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', background: 'transparent',
              border: '1px solid #6B1A2B', color: '#6B1A2B',
              padding: '14px 40px', fontSize: 11, letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none'
            }}>Ver Todos os Produtos</a>
          </div>
        )}
      </div>
    </section>
  )
}

function Sales() {
  const offers = [
    { discount: '30%', label: 'de desconto', name: 'Colecao Verao', desc: 'Aneis e pulseiras com acabamento dourado' },
    { discount: '2x1', label: 'na compra', name: 'Brincos Selecionados', desc: 'Pares classicos e modernos em prata 925' },
    { discount: '20%', label: 'de desconto', name: 'Colares Longos', desc: 'Modelos exclusivos com pedras naturais' },
  ]
  return (
    <section id="promocoes" style={{ padding: '80px 40px', background: '#4A0F1E' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 12 }}>Ofertas Especiais</div>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, color: '#FAF7F2' }}>
            Promocoes <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Imperdiveis</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 2 }}>
          {offers.map((o, i) => (
            <div key={i} onClick={() => window.open(NUVEMSHOP_URL, '_blank')} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.1)',
              padding: '28px 24px', cursor: 'pointer'
            }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 48, fontWeight: 300, color: '#C9A84C', lineHeight: 1, marginBottom: 4 }}>{o.discount}</div>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,237,213,0.5)', marginBottom: 16 }}>{o.label}</div>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 400, color: '#FAF7F2', marginBottom: 6 }}>{o.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(245,237,213,0.4)', lineHeight: 1.5 }}>{o.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a href={NUVEMSHOP_URL} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', background: '#C9A84C', color: '#4A0F1E',
            padding: '16px 40px', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none'
          }}>Ver Todas as Promocoes</a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ background: '#1A0A0F', padding: '60px 40px 32px', color: 'rgba(245,237,213,0.6)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
        <div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 600, letterSpacing: '0.12em', color: '#FAF7F2', marginBottom: 14 }}>MAWE.</div>
          <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>Pratas e acessorios de luxo com design exclusivo.</p>
        </div>
        <div>
          <h4 style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 20, fontWeight: 400 }}>Loja</h4>
          <ul style={{ listStyle: 'none' }}>
            {['Lancamentos', 'Colecoes', 'Promocoes'].map(item => (
              <li key={item} style={{ marginBottom: 10 }}>
                <a href={NUVEMSHOP_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(245,237,213,0.5)', textDecoration: 'none' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 20, fontWeight: 400 }}>Contato</h4>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: 10 }}><a href="https://wa.me/5562999999999" style={{ fontSize: 13, color: 'rgba(245,237,213,0.5)', textDecoration: 'none' }}>WhatsApp</a></li>
            <li style={{ marginBottom: 10 }}><a href="https://instagram.com/mavvepratas" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(245,237,213,0.5)', textDecoration: 'none' }}>Instagram</a></li>
          </ul>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: 28 }}>
        <p style={{ fontSize: 12 }}>2026 Mavwe Pratas e Acessorios. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Strip />
      <Lancamentos />
      <Sales />
      <Footer />
    </>
  )
}

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, Briefcase, Heart, Bookmark, Sparkles, 
  Clock, DollarSign, Zap, Building2, ArrowUpRight, X, 
  Filter, Command, ChevronDown, Star, TrendingUp, 
  Users, Shield, Globe, Layers, Send, Check, 
  FileText, Brain, Target, Rocket, Mail
} from 'lucide-react'
import { jobs as allJobs, stats } from './data/jobs.js'

const categories = ["Tous", "Tech", "Design", "Product", "Data", "Marketing"]
const contractTypes = ["CDI", "CDD", "Freelance", "Stage", "Alternance"]
const levels = ["Junior", "Mid", "Senior", "Lead", "Staff"]

function App() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Tous")
  const [selectedTypes, setSelectedTypes] = useState([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [selectedJob, setSelectedJob] = useState(allJobs[0])
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('saved') || '[]'))
  const [applied, setApplied] = useState(() => JSON.parse(localStorage.getItem('applied') || '[]'))
  const [showApply, setShowApply] = useState(false)
  const [showCommand, setShowCommand] = useState(false)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('saved', JSON.stringify(saved))
  }, [saved])
  useEffect(() => {
    localStorage.setItem('applied', JSON.stringify(applied))
  }, [applied])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowCommand(v => !v)
      }
      if (e.key === '/' && !e.target.matches('input,textarea')) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => {
    return allJobs.filter(j => {
      const matchSearch = !query || 
        j.title.toLowerCase().includes(query.toLowerCase()) ||
        j.company.toLowerCase().includes(query.toLowerCase()) ||
        j.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      const matchCat = category === "Tous" || j.category === category
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(j.type)
      const matchRemote = !remoteOnly || j.remote
      return matchSearch && matchCat && matchType && matchRemote
    })
  }, [query, category, selectedTypes, remoteOnly])

  const toggleSave = (id) => {
    setSaved(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id])
  }

  const toggleType = (t) => setSelectedTypes(s => s.includes(t) ? s.filter(x=>x!==t) : [...s, t])

  return (
    <div className="min-h-screen bg-[#fcfcfd] relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full blur-[120px] bg-gradient-to-br from-violet-200 via-fuchsia-100 to-amber-100 opacity-60" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full blur-[120px] bg-gradient-to-bl from-blue-100 via-cyan-100 to-violet-100 opacity-50" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-zinc-100">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-zinc-900 text-white grid place-items-center font-display font-bold text-[18px] tracking-tight shadow-soft">
                O
              </div>
              <span className="font-display font-extrabold text-[19px] tracking-tight">OPPORTUNA</span>
              <span className="ml-2 text-[10px] font-medium tracking-[0.14em] px-2 py-1 rounded-full bg-zinc-900 text-white">BETA • IA</span>
            </div>
            <div className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-zinc-500">
              <a className="text-zinc-900">Jobs</a>
              <a className="hover:text-zinc-900 transition">Entreprises <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">{stats.activeCompanies}</span></a>
              <a className="hover:text-zinc-900 transition">Salaires</a>
              <a className="hover:text-zinc-900 transition">Conseils</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 pl-3 pr-2 h-9 rounded-full border border-zinc-200 bg-white shadow-sm">
              <Command className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[12.5px] text-zinc-500 font-medium">⌘K pour rechercher</span>
              <kbd className="ml-3 hidden lg:inline-flex h-5 px-1.5 items-center rounded-md border bg-zinc-50 text-[11px] text-zinc-500">/</kbd>
            </div>
            <button className="hidden md:inline-flex h-9 px-4 rounded-full bg-zinc-900 text-white text-[13.5px] font-medium hover:bg-black transition items-center gap-1.5">
              Publier une offre <ArrowUpRight className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white grid place-items-center font-medium">L</div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative mx-auto max-w-[1440px] px-6 lg:px-10 pt-12 lg:pt-[68px] pb-10">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-8 items-start">
          <div>
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm text-[12px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {stats.totalJobs.toLocaleString('fr-FR')} offres actives • Taux de match {stats.successRate}
              <span className="ml-2 px-1.5 py-0.5 rounded bg-zinc-900 text-white text-[10px]">LIVE</span>
            </motion.div>

            <motion.h1 initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} transition={{delay:0.05}} className="font-display font-[800] tracking-[-0.04em] leading-[0.9] text-[42px] sm:text-[60px] lg:text-[84px] mt-6">
              Le job qui<br/>
              <span className="text-gradient">te trouve.</span><br/>
              Pas l'inverse.
            </motion.h1>

            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}} className="mt-6 max-w-[54ch] text-[17px] leading-[1.6] text-zinc-600 font-[400]">
              OPPORTUNA analyse ton profil, ton GitHub, tes side-projects et te matche avec <b className="text-zinc-900 font-semibold">96% de précision</b>. Fini le spam d'offres. On te propose 3 jobs par jour, mais les bons.
            </motion.p>

            {/* Search hero */}
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="mt-8 p-2 rounded-[22px] bg-white border border-zinc-200 shadow-soft flex items-center gap-2 max-w-[620px]">
              <div className="flex-1 flex items-center gap-3 pl-5 h-[48px]">
                <Search className="w-[18px] h-[18px] text-zinc-400" />
                <input 
                  ref={searchRef}
                  value={query} 
                  onChange={e=>setQuery(e.target.value)}
                  placeholder="Titre, compétence ou entreprise… ex: Rust"
                  className="w-full bg-transparent outline-none text-[15px] placeholder:text-zinc-400"
                />
              </div>
              <button className="h-[48px] px-7 rounded-[14px] bg-zinc-900 text-white font-medium text-[14.5px] hover:bg-black transition flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Matcher
              </button>
            </motion.div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className="text-zinc-400 font-medium">Populaire:</span>
              {["Remote", "TypeScript", "Product Design", "Rust", "AI"].map(t => (
                <button key={t} onClick={()=>setQuery(t)} className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition font-medium">
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-[520px] border-t border-zinc-100 pt-8">
              {[
                {k: "Temps moyen", v: stats.avgMatchTime, icon: Clock},
                {k: "Entreprises", v: `${stats.activeCompanies}+`, icon: Building2},
                {k: "Salaire médian", v: "62k€", icon: TrendingUp},
              ].map(s => (
                <div key={s.k} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-zinc-100 grid place-items-center"><s.icon className="w-4 h-4 text-zinc-700"/></div>
                  <div>
                    <div className="font-display font-bold text-[18px] leading-none">{s.v}</div>
                    <div className="text-[11.5px] text-zinc-500 mt-1">{s.k}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating stack */}
          <div className="relative lg:h-[560px] hidden lg:block">
            <div className="absolute inset-0 -z-10 mesh-gradient rounded-[32px]" />
            {/* orbit cards */}
            <motion.div animate={{y:[0,-8,0]}} transition={{duration:5, repeat:Infinity, ease:"easeInOut"}} className="absolute top-4 left-8 right-8 glass rounded-[20px] p-4 shadow-float border border-white/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 text-white grid place-items-center">M</div>
                <div><div className="font-semibold text-[13px]">Mistral AI vient de te matcher</div><div className="text-[11px] text-zinc-500">Product Designer • 94% match • 12k€ referral</div></div>
                <div className="ml-auto w-7 h-7 rounded-full bg-violet-600 text-white grid place-items-center"><Zap className="w-4 h-4"/></div>
              </div>
            </motion.div>

            <motion.div animate={{y:[0,10,0]}} transition={{duration:6, repeat:Infinity, ease:"easeInOut", delay:0.5}} className="absolute top-[112px] left-4 w-[78%] glass rounded-[20px] p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-white grid place-items-center font-bold">Q</div>
                  <div>
                    <div className="font-semibold">Qonto • Lead PM</div>
                    <div className="text-[12px] text-zinc-500 mt-1 flex items-center gap-2"><MapPin className="w-3 h-3"/>Lyon Remote • 70-90k • CDI</div>
                    <div className="mt-3 flex gap-1.5">
                      <span className="px-2 py-1 rounded-full bg-zinc-900 text-white text-[10px]">Fintech</span>
                      <span className="px-2 py-1 rounded-full bg-white border text-[10px]">Strategy</span>
                    </div>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-full border-4 border-violet-100 border-t-violet-600 grid place-items-center text-[11px] font-bold">91%</div>
              </div>
            </motion.div>

            <motion.div animate={{y:[0,-6,0]}} transition={{duration:5.5, repeat:Infinity, delay:1}} className="absolute top-[260px] right-6 w-[68%] glass rounded-[20px] p-4 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-medium tracking-widest text-zinc-400">TON PROFIL SCORE</div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Excellent</span>
              </div>
              <div className="flex gap-3">
                {[92, 88, 95].map((v,i)=>(
                  <div key={i} className="flex-1 h-[72px] rounded-xl bg-white border border-zinc-100 p-2.5 flex flex-col justify-between">
                    <div className="text-[10px] text-zinc-500">{["Tech","Design","Impact"][i]}</div>
                    <div className="font-bold text-[18px]">{v}%</div>
                    <div className="h-1 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full bg-zinc-900" style={{width:`${v}%`}}/></div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="absolute bottom-6 left-6 right-6 glass-dark rounded-[20px] p-4 text-white flex items-center gap-4">
              <img src="https://i.pravatar.cc/100?img=33" className="w-10 h-10 rounded-full object-cover" alt=""/>
              <div className="text-[12px] leading-[1.4]"><b>Lewand</b> a décroché un poste Staff chez Algolia via OPPORTUNA <span className="text-zinc-400">• il y a 1h</span></div>
              <div className="ml-auto flex -space-x-1">
                {[1,2,3].map(i=><div key={i} className="w-5 h-5 rounded-full border-2 border-zinc-900 bg-zinc-800 grid place-items-center text-[10px]"><Star className="w-3 h-3 text-amber-400 fill-amber-400"/></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main board */}
      <section className="mx-auto max-w-[1440px] px-6 lg:px-10 pb-24">
        <div className="rounded-[28px] border border-zinc-200 bg-white shadow-soft overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 lg:px-8 h-auto lg:h-[68px] py-4 lg:py-0 border-b border-zinc-100 bg-[#fcfcfd]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1 rounded-full bg-zinc-100">
                {categories.map(c => (
                  <button key={c} onClick={()=>setCategory(c)} className={`px-4 h-7 rounded-full text-[13px] font-medium transition ${category===c ? 'bg-zinc-900 text-white shadow' : 'text-zinc-600 hover:text-zinc-900'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-zinc-200">
                <div className="relative">
                  <button className="flex items-center gap-1.5 px-3 h-8 rounded-full border bg-white text-[13px] font-medium">
                    <Filter className="w-3.5 h-3.5"/> Filtres {selectedTypes.length>0 && `• ${selectedTypes.length}`}
                  </button>
                </div>
                <label className="flex items-center gap-2 px-3 h-8 rounded-full border bg-white text-[13px] font-medium cursor-pointer">
                  <input type="checkbox" checked={remoteOnly} onChange={e=>setRemoteOnly(e.target.checked)} className="accent-zinc-900"/>
                  Remote only
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[12.5px] text-zinc-500">
              <span className="hidden sm:inline">{filtered.length} jobs • trié par <b className="text-zinc-900">Match IA</b></span>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-violet-100 grid place-items-center"><Brain className="w-3 h-3 text-violet-600"/></div>
                <span className="font-medium text-zinc-700">AI Sourcing actif</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[380px_1fr_320px] min-h-[720px]">
            {/* List */}
            <div className="border-r border-zinc-100 bg-[#fcfcfd] flex flex-col">
              <div className="p-4 flex flex-wrap gap-2 border-b border-zinc-100 bg-white">
                {contractTypes.map(t=>(
                  <button key={t} onClick={()=>toggleType(t)} className={`px-3 py-1.5 rounded-full border text-[12.5px] font-medium transition ${selectedTypes.includes(t) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white hover:border-zinc-900'}`}>
                    {t}
                  </button>
                ))}
                {selectedTypes.length>0 && <button onClick={()=>setSelectedTypes([])} className="text-[12px] text-zinc-500 underline ml-1">Effacer</button>}
              </div>
              <div className="flex-1 overflow-y-auto max-h-[720px] lg:max-h-[760px] divide-y divide-zinc-100">
                {filtered.map(job=>(
                  <button key={job.id} onClick={()=>{setSelectedJob(job); setMobileDetailOpen(true)}} className={`w-full text-left p-5 hover:bg-white transition group relative ${selectedJob?.id===job.id ? 'bg-white shadow-soft' : ''}`}>
                    {selectedJob?.id===job.id && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-zinc-900"/>}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 grid place-items-center font-bold text-[14px]">{job.logo}</div>
                        <div>
                          <div className="font-semibold text-[14.5px] leading-tight group-hover:text-zinc-900 flex items-center gap-2">
                            {job.title} {job.match>=90 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-600 text-white text-[10px]"><Sparkles className="w-3 h-3"/> TOP</span>}
                          </div>
                          <div className="text-[12.5px] text-zinc-500 mt-1 flex items-center gap-1.5">
                            {job.company} • {job.location}
                          </div>
                        </div>
                      </div>
                      <button onClick={(e)=>{e.stopPropagation(); toggleSave(job.id)}} className={`w-7 h-7 rounded-full border grid place-items-center transition ${saved.includes(job.id) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white hover:bg-zinc-900 hover:text-white'}`}>
                        <Heart className={`w-3.5 h-3.5 ${saved.includes(job.id) ? 'fill-white':''}`}/>
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.tags.map(t=><span key={t} className="px-2 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-600">{t}</span>)}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11.5px] text-zinc-500">
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3"/>{job.salary}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{job.posted}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full border-2 grid place-items-center text-[10px] font-bold ${job.match>=90 ? 'border-violet-600 text-violet-700 bg-violet-50' : job.match>=85 ? 'border-zinc-900 text-zinc-900' : 'border-zinc-200'}`}>
                          {job.match}%
                        </div>
                        <div className="text-[10px] font-medium text-zinc-500">MATCH</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail */}
            <div className="hidden lg:block border-r border-zinc-100 bg-white relative">
              <div className="sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-[16px] bg-zinc-900 text-white grid place-items-center font-display font-bold text-[20px]">{selectedJob.logo}</div>
                      <div>
                        <h2 className="font-display font-bold text-[22px] leading-tight">{selectedJob.title}</h2>
                        <div className="mt-1 flex items-center gap-2 text-[13px] text-zinc-600">
                          <span className="font-medium text-zinc-900">{selectedJob.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{selectedJob.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/>{selectedJob.applicants} candidats</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-medium">{selectedJob.type}</span>
                          <span className="px-2.5 py-1 rounded-full border text-[11px]">{selectedJob.level}</span>
                          <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-medium">{selectedJob.salary}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[12px] font-medium">
                        <Target className="w-3.5 h-3.5"/> {selectedJob.match}% MATCH IA
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-500">Basé sur ton profil + GitHub</div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      {label:"Fit technique", value:`${selectedJob.match-2}%`, sub:"Top 5%"},
                      {label:"Fit culture", value:`${selectedJob.match-5}%`, sub:"Remote ok"},
                      {label:"Salaire vs marché", value:"+12%", sub:"Au dessus"},
                    ].map(card=>(
                      <div key={card.label} className="rounded-xl border border-zinc-100 bg-[#fcfcfd] p-3">
                        <div className="text-[10px] tracking-widest font-medium text-zinc-400">{card.label.toUpperCase()}</div>
                        <div className="mt-1 font-bold text-[16px]">{card.value}</div>
                        <div className="text-[11px] text-emerald-600 font-medium">{card.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 prose prose-zinc max-w-none">
                    <p className="text-[14.5px] leading-[1.7] text-zinc-700">{selectedJob.description}</p>
                    <h4 className="font-display font-bold mt-8 mb-3">Pourquoi tu vas adorer</h4>
                    <ul className="space-y-2 text-[13.5px] text-zinc-700">
                      {selectedJob.benefits.map(b=>(
                        <li key={b} className="flex gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5"/><span>{b} – équipe world-class, vraie autonomie</span></li>
                      ))}
                    </ul>
                    <h4 className="font-display font-bold mt-8 mb-3">Stack & environnement</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.tags.concat(["Vercel","Notion","Linear"]).map(t=><span key={t} className="px-3 py-1.5 rounded-full bg-white border text-[12px] font-medium">{t}</span>)}
                    </div>
                  </div>

                  <div className="mt-10 p-5 rounded-[18px] bg-zinc-900 text-white relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 blur-[40px] opacity-60" />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-[12px] font-medium tracking-widest text-zinc-400"><Rocket className="w-4 h-4"/> CANDIDATURE EXPRESS • 45 SEC</div>
                      <div className="mt-3 font-display font-bold text-[18px]">One-click apply avec ton profil OPPORTUNA</div>
                      <div className="mt-1 text-[13px] text-zinc-400">CV + cover auto-générée par IA. Le recruteur répond en moyenne en 2.4 jours.</div>
                      <div className="mt-5 flex gap-3">
                        <button onClick={()=>setShowApply(true)} disabled={applied.includes(selectedJob.id)} className="flex-1 h-11 rounded-full bg-white text-zinc-900 font-medium flex items-center justify-center gap-2 hover:bg-zinc-100 transition disabled:opacity-50">
                          {applied.includes(selectedJob.id) ? <><Check className="w-4 h-4"/> Candidature envoyée</> : <><Send className="w-4 h-4"/> Postuler en 1 clic</>}
                        </button>
                        <button onClick={()=>toggleSave(selectedJob.id)} className="w-11 h-11 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 transition">
                          <Bookmark className={`w-4 h-4 ${saved.includes(selectedJob.id) ? 'fill-white':''}`}/>
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500"><Shield className="w-3 h-3"/> Données chiffrées • jamais partagées sans consentement</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right rail */}
            <div className="hidden lg:block bg-[#fcfcfd]">
              <div className="p-6 space-y-6">
                <div className="rounded-[18px] bg-white border border-zinc-200 p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[13px]">Ton profil</div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">92% complet</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/100?img=12" className="w-12 h-12 rounded-full" alt=""/>
                    <div>
                      <div className="font-medium text-[14px]">Lewand Gesky</div>
                      <div className="text-[12px] text-zinc-500">Fullstack • 5 ans • Remote</div>
                    </div>
                    <div className="ml-auto w-8 h-8 rounded-full bg-zinc-900 text-white grid place-items-center text-[12px] font-bold">92</div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full w-[92%] bg-zinc-900 rounded-full"/></div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="h-8 rounded-full bg-zinc-900 text-white text-[12px] font-medium">Améliorer</button>
                    <button className="h-8 rounded-full border bg-white text-[12px] font-medium">Voir profil</button>
                  </div>
                </div>

                <div className="rounded-[18px] bg-white border border-zinc-200 p-5">
                  <div className="flex items-center gap-2 font-semibold text-[13px]"><Sparkles className="w-4 h-4 text-violet-600"/> Suggestions IA</div>
                  <div className="mt-3 space-y-3">
                    {filtered.slice(0,3).map(j=>(
                      <div key={j.id} className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white grid place-items-center text-[11px] font-bold">{j.logo}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-medium truncate">{j.title}</div>
                          <div className="text-[11px] text-zinc-500">{j.company} • {j.match}% match</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[18px] bg-gradient-to-br from-violet-600 to-fuchsia-600 p-5 text-white">
                  <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest opacity-80"><Globe className="w-4 h-4"/> INSIGHT MARCHÉ</div>
                  <div className="mt-3 font-display font-bold text-[20px] leading-tight">Les salaires Rust ont pris +18% ce trimestre en remote.</div>
                  <div className="mt-2 text-[12.5px] opacity-80">Ton profil est dans le top 12% des candidats sur cette stack.</div>
                  <button className="mt-4 w-full h-9 rounded-full bg-white text-zinc-900 text-[12.5px] font-medium">Voir rapport salarial</button>
                </div>

                <div className="rounded-[18px] border border-dashed border-zinc-300 p-5">
                  <div className="flex items-center gap-2 text-[13px] font-semibold"><Mail className="w-4 h-4"/> Alerte personnalisée</div>
                  <div className="mt-2 text-[12px] text-zinc-600">Reçois 3 offres max par jour correspondant à ton seuil de 90%.</div>
                  <div className="mt-3 flex gap-2">
                    <input placeholder="email" className="flex-1 h-8 px-3 rounded-full border bg-white text-[12px] outline-none"/>
                    <button className="h-8 px-3 rounded-full bg-zinc-900 text-white text-[12px]">OK</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logos */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
          <span className="text-[12px] font-medium tracking-widest text-zinc-400">ILS RECRUTENT VIA OPPORTUNA</span>
          {["Mistral","Qonto","Alan","Datadog","Back Market","Doctolib"].map(n=>(
            <span key={n} className="font-display font-bold text-[16px] text-zinc-500">{n}</span>
          ))}
        </div>
      </section>

      {/* Mobile detail drawer */}
      <AnimatePresence>
        {mobileDetailOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring", damping:28}} className="absolute bottom-0 left-0 right-0 max-h-[86vh] rounded-t-[28px] bg-white overflow-y-auto">
              <div className="sticky top-0 p-4 border-b bg-white flex items-center justify-between">
                <div className="font-semibold">Détails</div>
                <button onClick={()=>setMobileDetailOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 grid place-items-center"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-6">
                <div className="flex gap-3"><div className="w-12 h-12 rounded-xl bg-zinc-900 text-white grid place-items-center font-bold">{selectedJob.logo}</div><div><div className="font-bold">{selectedJob.title}</div><div className="text-[13px] text-zinc-500">{selectedJob.company} • {selectedJob.location}</div></div></div>
                <p className="mt-4 text-[14px] text-zinc-700">{selectedJob.description}</p>
                <button onClick={()=>{setShowApply(true); setMobileDetailOpen(false)}} className="mt-6 w-full h-12 rounded-full bg-zinc-900 text-white font-medium">Postuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply modal */}
      <AnimatePresence>
        {showApply && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] grid place-items-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div initial={{scale:0.96, y:10, opacity:0}} animate={{scale:1, y:0, opacity:1}} exit={{scale:0.96, opacity:0}} className="w-full max-w-[480px] rounded-[24px] bg-white shadow-float overflow-hidden">
              <div className="p-7">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white grid place-items-center"><FileText className="w-5 h-5"/></div>
                  <button onClick={()=>setShowApply(false)} className="w-8 h-8 rounded-full bg-zinc-100 grid place-items-center"><X className="w-4 h-4"/></button>
                </div>
                <h3 className="mt-5 font-display font-bold text-[22px]">Candidature express</h3>
                <p className="mt-2 text-[13.5px] text-zinc-600">On génère une lettre de motivation ultra-personnalisée pour {selectedJob.company} basée sur ton profil.</p>
                
                <div className="mt-6 space-y-3">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border grid place-items-center"><Layers className="w-4 h-4"/></div>
                    <div className="text-[13px]"><b>CV</b> • lewandgesky-cv-2025.pdf <span className="text-zinc-500">• à jour</span></div>
                    <Check className="ml-auto w-4 h-4 text-emerald-600"/>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 flex gap-3">
                    <Brain className="w-5 h-5 text-violet-600 mt-0.5"/>
                    <div className="text-[12.5px] leading-[1.5]"><b className="text-violet-900">IA:</b> J'ai détecté que tu as contribué à une lib Rust similaire à leur stack. Je le mets en avant pour booster ton match de 91% → <b>96%</b>.</div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-[12px] font-medium text-zinc-700">Message rapide (optionnel)</label>
                  <textarea placeholder="Ce qui t'excite dans ce rôle..." className="mt-2 w-full h-[84px] rounded-xl border border-zinc-200 p-3 text-[13px] outline-none focus:border-zinc-900 resize-none"/>
                </div>

                <button onClick={()=>{
                  setApplied(a=>[...a, selectedJob.id]);
                  setShowApply(false);
                  setTimeout(()=>alert("🔥 Candidature envoyée à "+selectedJob.company+" ! Le recruteur a été notifié. Temps de réponse moyen: 2.4 jours."), 150)
                }} className="mt-6 w-full h-12 rounded-full bg-zinc-900 text-white font-medium flex items-center justify-center gap-2 hover:bg-black transition">
                  <Send className="w-4 h-4"/> Envoyer – Match boosté à 96%
                </button>
                <div className="mt-3 text-center text-[11px] text-zinc-500">En postant, tu acceptes que ton profil anonymisé serve à l'IA de matching.</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command palette */}
      <AnimatePresence>
        {showCommand && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-md grid place-items-start justify-items-center pt-[20vh] p-4">
            <motion.div initial={{y:10, scale:0.98, opacity:0}} animate={{y:0, scale:1, opacity:1}} exit={{y:10, opacity:0}} className="w-full max-w-[640px] rounded-[20px] bg-white border border-zinc-200 shadow-float overflow-hidden">
              <div className="flex items-center gap-3 px-5 h-[56px] border-b">
                <Search className="w-5 h-5 text-zinc-400"/>
                <input autoFocus placeholder="Chercher un job, une entreprise, une compétence..." value={query} onChange={e=>setQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-[15px]"/>
                <kbd className="px-2 py-1 rounded bg-zinc-100 text-[11px]">ESC</kbd>
              </div>
              <div className="p-2 max-h-[380px] overflow-y-auto">
                {filtered.slice(0,6).map(j=>(
                  <button key={j.id} onClick={()=>{setSelectedJob(j); setShowCommand(false); setMobileDetailOpen(true)}} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 text-left">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white grid place-items-center font-bold text-[13px]">{j.logo}</div>
                    <div className="flex-1"><div className="font-medium text-[13.5px]">{j.title}</div><div className="text-[12px] text-zinc-500">{j.company} • {j.match}% match</div></div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400"/>
                  </button>
                ))}
                {filtered.length===0 && <div className="p-8 text-center text-zinc-500 text-[13px]">Aucun résultat pour "{query}"</div>}
              </div>
              <div className="px-4 h-10 bg-zinc-50 border-t flex items-center gap-4 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-white border">↵</span> Sélectionner</span>
                <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-white border">ESC</span> Fermer</span>
              </div>
            </motion.div>
            <button className="absolute inset-0 -z-10" onClick={()=>setShowCommand(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-zinc-900 text-white grid place-items-center font-display font-bold">O</div><span className="font-display font-bold">OPPORTUNA</span></div>
            <p className="mt-3 max-w-[32ch] text-[13px] text-zinc-500 leading-[1.6]">La première plateforme d'emploi qui se base sur ce que tu fais vraiment, pas sur des mots-clés. Propulsée par IA souveraine, basée à Paris.</p>
          </div>
          <div className="flex gap-16 text-[13px]">
            <div className="space-y-2.5"><div className="font-semibold">Plateforme</div><div className="text-zinc-500 space-y-2"><div>Comment ça marche</div><div>Entreprises</div><div>Tarifs</div></div></div>
            <div className="space-y-2.5"><div className="font-semibold">Ressources</div><div className="text-zinc-500 space-y-2"><div>Blog carrière</div><div>Étude salaires 2025</div><div>API Jobs</div></div></div>
            <div className="space-y-2.5"><div className="font-semibold">Légal</div><div className="text-zinc-500 space-y-2"><div>Confidentialité IA</div><div>CGU</div><div>Contact</div></div></div>
          </div>
        </div>
        <div className="border-t border-zinc-100 py-4 text-center text-[11px] text-zinc-400 tracking-wide">© 2026 OPPORTUNA • Fait avec obsession à Paris • {stats.totalJobs.toLocaleString()} opportunités live • Taux de conversion candidature → entretien: {stats.successRate}</div>
      </footer>
    </div>
  )
}

export default App

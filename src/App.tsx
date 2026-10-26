import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronRight, Code2, Compass, Figma, GraduationCap, Heart, Laptop, Menu, Palette, Search, Sparkles, Users, X } from "lucide-react";

type Person = {
  id: number;
  name: string;
  initials: string;
  role: string;
  teaches: string[];
  learns: string;
  match: number;
  tone: string;
  category: "Development" | "Design" | "Data & AI" | "Communication";
  bio: string;
};

const samplePeople: Person[] = [
  { id: 1, name: "Aarav Mehta", initials: "AM", role: "Frontend developer", teaches: ["React", "JavaScript", "CSS"], learns: "UI/UX design", match: 96, tone: "lilac", category: "Development", bio: "Building small products and learning by shipping." },
  { id: 2, name: "Maya Reddy", initials: "MR", role: "Visual storyteller", teaches: ["Figma", "Brand design", "Canva"], learns: "Python basics", match: 91, tone: "peach", category: "Design", bio: "Turning ideas into clear, friendly visual experiences." },
  { id: 3, name: "Ishaan Rao", initials: "IR", role: "Python enthusiast", teaches: ["Python", "Data analysis", "Git"], learns: "Public speaking", match: 88, tone: "mint", category: "Data & AI", bio: "Curious about data, automation, and open source." },
  { id: 4, name: "Diya Shah", initials: "DS", role: "Product design student", teaches: ["Wireframing", "Figma", "Prototyping"], learns: "React basics", match: 84, tone: "blue", category: "Design", bio: "I enjoy making digital tools easier to understand." },
  { id: 5, name: "Nikhil Varma", initials: "NV", role: "Problem solver", teaches: ["Java", "DSA", "GitHub"], learns: "Motion design", match: 82, tone: "mint", category: "Development", bio: "Practicing algorithms and building full-stack projects." },
  { id: 6, name: "Sara Khan", initials: "SK", role: "Confident communicator", teaches: ["Presentation", "Writing", "English"], learns: "Data visualization", match: 79, tone: "peach", category: "Communication", bio: "Helping people tell a clear story with their ideas." },
  { id: 7, name: "Karthik N", initials: "KN", role: "AI explorer", teaches: ["Python", "Prompt design", "NumPy"], learns: "Figma", match: 77, tone: "blue", category: "Data & AI", bio: "Exploring practical AI applications for students." },
  { id: 8, name: "Ananya Das", initials: "AD", role: "Creative coder", teaches: ["HTML", "CSS", "Accessibility"], learns: "Java", match: 74, tone: "lilac", category: "Development", bio: "Making thoughtful, inclusive websites and interfaces." },
];

const categories = ["All skills", "Development", "Design", "Data & AI", "Communication"] as const;

function Brand() {
  return <a className="brand" href="#top" aria-label="SkillSync home"><span className="brand-mark"><i /><i /><i /></span><span>skill<span className="brand-accent">sync</span><sup>✳</sup></span></a>;
}

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All skills");
  const [saved, setSaved] = useState<number[]>([]);
  const [requested, setRequested] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const people = useMemo(() => samplePeople.filter((p) =>
    (category === "All skills" || p.category === category) &&
    `${p.name} ${p.role} ${p.teaches.join(" ")} ${p.learns} ${p.bio}`.toLowerCase().includes(search.toLowerCase())
  ), [search, category]);

  const visiblePeople = showAll ? people : people.slice(0, 4);
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const startRequest = (person: Person) => {
    setRequested((prev) => prev.includes(person.id) ? prev : [...prev, person.id]);
    notify(`Demo request prepared for ${person.name}. Sign-in and database integration are not connected yet.`);
  };

  return (
    <div className="site-shell" id="top">
      <header className="site-header">
        <Brand />
        <nav className={`main-nav ${mobileMenu ? "nav-open" : ""}`}>
          <a href="#discover" onClick={() => setMobileMenu(false)}>Discover</a>
          <a href="#how" onClick={() => setMobileMenu(false)}>How it works</a>
          <a href="#community" onClick={() => setMobileMenu(false)}>Community</a>
        </nav>
        <div className="header-actions">
          <a className="login-link" href="#join">Log in</a>
          <a className="button button-primary button-small" href="#discover">Get started <ArrowUpRight size={15} /></a>
        </div>
        <button className="mobile-menu-button" aria-label="Toggle navigation" onClick={() => setMobileMenu((v) => !v)}>{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button>
      </header>

      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> LEARN TOGETHER, GROW TOGETHER</div>
            <h1>Your next skill is<br /><em>closer than you think.</em></h1>
            <p className="hero-description">Trade what you know for what you want to learn. Meet students who help you grow — one skill swap at a time.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#discover">Find your skill match <ArrowUpRight size={16} /></a>
              <a className="text-link" href="#how">See how it works <ArrowDown size={14} /></a>
            </div>
            <div className="social-proof">
              <div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div>
              <div><strong>A community built on sharing</strong><small>Every student has something to teach.</small></div>
            </div>
          </div>

          <div className="hero-art" aria-label="Illustration of a student skill exchange">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <Sparkles className="art-sparkle" size={27} />
            <div className="floating-note"><span className="note-icon"><Check size={17} /></span><div><b>Skill exchange unlocked</b><small>Learn something new this week</small></div></div>
            <div className="match-card">
              <div className="match-card-top"><span className="tiny-brand">s.</span><span className="match-status"><i /> MATCH FOUND</span></div>
              <div className="hero-person-avatar">AM</div>
              <h3>Aarav Mehta</h3>
              <p>Can teach you <b>React</b></p>
              <div className="exchange-labels"><span>YOU TEACH</span><ArrowRight size={17} /><span>YOU LEARN</span></div>
              <div className="exchange-skills"><span><Palette size={13} /> Figma design</span><span><Code2 size={13} /> React basics</span></div>
              <div className="match-progress"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <small className="match-footer">A great match starts with one hello.</small>
            </div>
            <div className="floating-badge"><Sparkles size={14} /> Learn by sharing</div>
          </div>
        </section>

        <section className="steps-strip section-wrap" aria-label="Three simple steps">
          <div><strong>01</strong><span>Share what you know</span></div><span className="strip-divider" />
          <div><strong>02</strong><span>Find your people</span></div><span className="strip-divider" />
          <div><strong>03</strong><span>Grow together</span></div>
          <p>No expensive courses.<br /><b>Just students helping students.</b></p>
        </section>

        <section id="discover" className="discover-section section-wrap">
          <div className="section-heading">
            <div><div className="eyebrow">YOUR PEOPLE ARE HERE</div><h2>Meet your next <em>skill partner.</em></h2><p>Find someone who knows what you want to learn — and wants to learn what you know.</p></div>
            <div className="profile-count"><strong>{String(people.length).padStart(2, "0")}</strong><span>profiles to explore</span></div>
          </div>
          <div className="discovery-controls">
            <label className="search-box"><Search size={19} /><input aria-label="Search people and skills" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills, names, or interests..." />{search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={15} /></button>}</label>
            <div className="category-filters" aria-label="Filter by category">
              {categories.map((c) => <button key={c} className={category === c ? "filter-active" : ""} onClick={() => { setCategory(c); setShowAll(false); }}>{c}</button>)}
            </div>
          </div>
          <div className="people-grid">
            {visiblePeople.map((person) => <article className="person-card" key={person.id}>
              <div className="person-header"><div className={`person-avatar ${person.tone}`}>{person.initials}</div><div className="person-identity"><h3>{person.name}</h3><p>{person.role}</p></div><button className={`save-button ${saved.includes(person.id) ? "is-saved" : ""}`} aria-label={saved.includes(person.id) ? "Unsave profile" : "Save profile"} onClick={() => setSaved((prev) => prev.includes(person.id) ? prev.filter((id) => id !== person.id) : [...prev, person.id])}><Bookmark size={17} fill={saved.includes(person.id) ? "currentColor" : "none"} /></button></div>
              <div className="compatibility"><span><Sparkles size={11} /> {person.match}% compatibility</span><div className="compatibility-track"><i style={{ width: `${person.match}%` }} /></div></div>
              <div className="skill-block"><small>CAN TEACH</small><div className="skill-tags">{person.teaches.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
              <div className="learn-block"><span className="learn-icon"><ArrowUpRight size={15} /></span><div><small>HOPING TO LEARN</small><b>{person.learns}</b></div></div>
              <button className={`button ${requested.includes(person.id) ? "button-secondary" : "button-primary"} swap-button`} onClick={() => startRequest(person)}>{requested.includes(person.id) ? "Request prepared" : "Propose a skill swap"} <ArrowUpRight size={14} /></button>
            </article>)}
          </div>
          {people.length === 0 && <div className="empty-state"><Search size={28} /><h3>No matches just yet</h3><p>Try another skill or clear your filters.</p><button className="button button-outline" onClick={() => { setSearch(""); setCategory("All skills"); }}>Clear filters</button></div>}
          {people.length > 4 && <div className="view-all-row"><button className="button button-outline" onClick={() => setShowAll((v) => !v)}>{showAll ? "Show fewer profiles" : "Explore all skill partners"} <ChevronRight size={15} /></button></div>}
          <p className="demo-note">The profiles above are illustrative demo data. Sign-in, saved profiles, and exchange requests require backend integration.</p>
        </section>

        <section id="how" className="how-section">
          <div className="how-inner section-wrap">
            <div className="how-intro"><div className="eyebrow">SIMPLE BY DESIGN</div><h2>Give a little.<br /><em>Gain a lot.</em></h2><p>Your time and knowledge are valuable. SkillSync makes sharing them feel natural.</p><a className="text-link" href="#discover">Find your first match <ArrowRight size={15} /></a></div>
            <div className="how-steps">
              <article><span className="step-number">01</span><div className="step-icon"><GraduationCap size={21} /></div><h3>Build your skill profile</h3><p>Tell the community what you can teach and what you're curious to learn.</p></article>
              <article><span className="step-number">02</span><div className="step-icon"><Compass size={21} /></div><h3>Find your match</h3><p>Discover students whose skills and learning goals complement yours.</p></article>
              <article><span className="step-number">03</span><div className="step-icon"><Users size={21} /></div><h3>Swap, learn, repeat</h3><p>Arrange sessions, share resources, and celebrate each other's progress.</p></article>
            </div>
          </div>
        </section>

        <section id="community" className="cta-section section-wrap">
          <span className="cta-decoration">✳</span>
          <div><div className="eyebrow">YOUR SKILLS HAVE VALUE</div><h2>What if learning was<br /><em>a two-way street?</em></h2><p>Bring what you know. Leave knowing more.</p></div>
          <a className="button button-light" href="#discover">Join the community <ArrowUpRight size={16} /></a>
        </section>
        <section id="join" className="join-note"><Laptop size={16} /><span>Student-first learning, built one skill swap at a time.</span><span className="join-note-divider">•</span><span>Free to explore.</span></section>
      </main>

      <footer className="site-footer"><Brand /><span>Knowledge grows when it moves.</span><span>Made for curious minds. © 2026 SkillSync</span></footer>
      {notice && <div className="toast" role="status"><Sparkles size={16} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={15} /></button></div>}
    </div>
  );
}

export default App;

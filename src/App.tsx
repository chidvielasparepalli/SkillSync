import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowDownRight, ArrowRight, Bookmark, Check, CheckCircle2, ChevronDown,
  Compass, Handshake, Inbox, LoaderCircle, LogIn, LogOut, Mail, Menu,
  MessageCircle, RefreshCw, Search, Send, ShieldCheck, Sparkles, UserRound,
  Users, X,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { backendConfigured, supabase, type ChatMessage, type ExchangeRequest, type Profile } from "./lib/supabase";

type Section = "discover" | "profile" | "requests" | "messages";
type AuthMode = "signin" | "signup" | "reset";
type RequestMode = "all" | "incoming" | "sent";
type ProfileDraft = { full_name: string; headline: string; college: string; bio: string; skills_teach: string; skills_learn: string };

const blankDraft: ProfileDraft = { full_name: "", headline: "", college: "", bio: "", skills_teach: "", skills_learn: "" };
const sections: { id: Section; label: string; icon: typeof Compass }[] = [
  { id: "discover", label: "Discover students", icon: Compass },
  { id: "profile", label: "My profile", icon: UserRound },
  { id: "requests", label: "Skill exchanges", icon: Handshake },
  { id: "messages", label: "Messages", icon: MessageCircle },
];
const categories = ["All skills", "Development", "Design", "Data & AI", "Communication"];

function parseSkills(value: string) {
  const unique = new Map<string, string>();
  value.split(",").map((item) => item.trim()).filter(Boolean).forEach((item) => unique.set(item.toLowerCase(), item));
  return Array.from(unique.values()).slice(0, 20);
}
function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S";
}
function profileCategory(profile: Profile) {
  const all = [...profile.skills_teach, ...profile.skills_learn, profile.headline].join(" ").toLowerCase();
  if (/figma|design|illustrat|canva|ui\/ux|ux|visual|brand|wireframe|prototype|motion/.test(all)) return "Design";
  if (/data|ai|machine learning|ml|python|numpy|pandas|analytics|model|prompt/.test(all)) return "Data & AI";
  if (/speak|communication|english|writing|presentation|leadership|story/.test(all)) return "Communication";
  if (/code|program|react|javascript|typescript|java|html|css|web|git|github|node|sql|develop|algorithm|dsa/.test(all)) return "Development";
  return "Other";
}
function relativeDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
function statusLabel(status: ExchangeRequest["status"]) {
  const labels: Record<ExchangeRequest["status"], string> = {
    pending: "Waiting for response", accepted: "Accepted", rejected: "Declined", cancelled: "Cancelled", completed: "Completed",
  };
  return labels[status];
}
function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={"brand " + (compact ? "brand-compact" : "")}><span className="brand-symbol"><i /><i /><i /></span><span>skill<span className="brand-accent">sync</span><sup>✳</sup></span></div>;
}

function AuthScreen(props: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  feedback: { kind: "error" | "success" | "info"; text: string } | null;
  setFeedback: (value: { kind: "error" | "success" | "info"; text: string } | null) => void;
}) {
  const { mode, setMode, onSubmit, busy, feedback, setFeedback } = props;
  const isSignup = mode === "signup";
  const isReset = mode === "reset";
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand"><Brand /></div>
        <div className="auth-hero">
          <div className="eyebrow"><span className="eyebrow-dot" /> LEARN TOGETHER, GROW TOGETHER</div>
          <h1>Share a skill.<br /><em>Find your people.</em></h1>
          <p>SkillSync connects students who can teach each other. Build your profile, meet learning partners, and make every skill count.</p>
          <div className="auth-benefits">
            <div><span className="benefit-icon"><Users size={17} /></span><span><b>A real student community</b><small>Discover profiles created by members.</small></span></div>
            <div><span className="benefit-icon"><Handshake size={17} /></span><span><b>Two-way skill exchange</b><small>Send requests, agree on a swap, and track progress.</small></span></div>
            <div><span className="benefit-icon"><ShieldCheck size={17} /></span><span><b>Your account, your data</b><small>Secure sign-in and private conversations.</small></span></div>
          </div>
        </div>
        <div className="auth-bottom-note">Built for curious minds. <span>✳</span></div>
      </div>
      <div className="auth-right">
        <div className="auth-mobile-brand"><Brand /></div>
        <div className="auth-card">
          <div className="auth-card-mark"><Sparkles size={19} /></div>
          <div className="eyebrow">{isReset ? "ACCOUNT RECOVERY" : isSignup ? "GET STARTED" : "WELCOME BACK"}</div>
          <h2>{isReset ? "Reset your password" : isSignup ? "Create your account" : "Let's keep growing."}</h2>
          <p className="auth-description">{isReset ? "Enter your email and we’ll send a password reset link." : isSignup ? "Join the community and start exchanging skills." : "Sign in to your SkillSync student account."}</p>
          {feedback && <div className={"feedback feedback-" + feedback.kind} role={feedback.kind === "error" ? "alert" : "status"}>
            {feedback.kind === "error" ? <X size={16} /> : <CheckCircle2 size={16} />}
            <span>{feedback.text}</span>
            <button aria-label="Dismiss message" onClick={() => setFeedback(null)}><X size={14} /></button>
          </div>}
          <form className="auth-form" onSubmit={onSubmit}>
            {isSignup && <label>Full name<input name="name" autoComplete="name" placeholder="e.g. Chidvielas Parepalli" required maxLength={80} /></label>}
            <label>Email address<span className="input-with-icon"><Mail size={16} /><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></span></label>
            {!isReset && <label>Password<input name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "At least 8 characters" : "Enter your password"} minLength={8} required /></label>}
            {!isSignup && !isReset && <button type="button" className="text-action forgot-link" onClick={() => { setMode("reset"); setFeedback(null); }}>Forgot password?</button>}
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? <LoaderCircle size={17} className="spin" /> : isReset ? <Mail size={17} /> : isSignup ? <ArrowDownRight size={17} /> : <LogIn size={17} />}
              {busy ? "Please wait..." : isReset ? "Send reset link" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>
          <div className="auth-switch">
            {isReset ? <button className="text-action" onClick={() => { setMode("signin"); setFeedback(null); }}>Back to sign in</button>
              : isSignup ? <>Already a member? <button className="text-action" onClick={() => { setMode("signin"); setFeedback(null); }}>Sign in</button></>
              : <>New to SkillSync? <button className="text-action" onClick={() => { setMode("signup"); setFeedback(null); }}>Create an account</button></>}
          </div>
          <div className="auth-secure-note"><ShieldCheck size={14} /> Authentication is handled securely by Supabase.</div>
        </div>
        <p className="auth-footnote">Be respectful, share honestly, and protect your learning partners' privacy.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authBusy, setAuthBusy] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<{ kind: "error" | "success" | "info"; text: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [section, setSection] = useState<Section>("discover");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All skills");
  const [savedOnly, setSavedOnly] = useState(false);
  const [requestMode, setRequestMode] = useState<RequestMode>("incoming");
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(blankDraft);
  const [savingProfile, setSavingProfile] = useState(false);
  const [requestTarget, setRequestTarget] = useState<Profile | null>(null);
  const [requestDraft, setRequestDraft] = useState({ teachSkill: "", learnSkill: "", message: "" });
  const [sendingRequest, setSendingRequest] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const user = session?.user ?? null;
  const myProfile = profiles.find((profile) => profile.id === user?.id) ?? null;
  const incomingPending = requests.filter((request) => request.recipient_id === user?.id && request.status === "pending").length;
  const activeCount = requests.filter((request) => request.status === "accepted").length;
  const chatRequests = requests.filter((request) => request.status === "accepted" || request.status === "completed");
  const activeConversation = chatRequests.find((request) => request.id === activeConversationId) ?? null;
  const activePeer = activeConversation && myProfile
    ? profiles.find((profile) => profile.id === (activeConversation.sender_id === user?.id ? activeConversation.recipient_id : activeConversation.sender_id)) ?? null
    : null;

  const notify = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3500);
  };

  useEffect(() => {
    const client = supabase;
    if (!client) { setAuthReady(true); return; }
    let alive = true;
    void client.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      setSession(data.session);
      if (error) setAuthError(error.message);
      setAuthReady(true);
    }).catch((error: unknown) => {
      if (!alive) return;
      setAuthError(error instanceof Error ? error.message : "Unable to check your session.");
      setAuthReady(true);
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setAuthFeedback(null);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const client = supabase;
    const userId = user?.id;
    if (!authReady || !client || !userId) {
      setProfiles([]); setRequests([]); setSavedIds([]); setDataLoading(false); return;
    }
    let cancelled = false;
    const loadData = async () => {
      setDataLoading(true);
      setPageError("");
      try {
        const [profileResult, requestResult, savedResult] = await Promise.all([
          client.from("profiles").select("*").order("updated_at", { ascending: false }),
          client.from("exchange_requests").select("*").or("sender_id.eq." + userId + ",recipient_id.eq." + userId).order("created_at", { ascending: false }),
          client.from("saved_profiles").select("profile_id").eq("user_id", userId),
        ]);
        if (cancelled) return;
        if (profileResult.error) throw new Error("Could not load student profiles: " + profileResult.error.message);
        if (requestResult.error) throw new Error("Could not load your exchange requests: " + requestResult.error.message);
        if (savedResult.error) throw new Error("Could not load saved profiles: " + savedResult.error.message);
        let rows = (profileResult.data ?? []) as Profile[];
        if (!rows.some((profile) => profile.id === userId)) {
          const { data: created, error: createError } = await client.from("profiles")
            .insert({ id: userId, full_name: user?.user_metadata?.full_name || "New student" }).select("*").single();
          if (cancelled) return;
          if (createError) throw new Error("Could not prepare your profile: " + createError.message);
          rows = [created as Profile, ...rows];
        }
        setProfiles(rows);
        setRequests((requestResult.data ?? []) as ExchangeRequest[]);
        setSavedIds((savedResult.data ?? []).map((row: { profile_id: string }) => row.profile_id));
      } catch (error) {
        if (!cancelled) setPageError(error instanceof Error ? error.message : "Something went wrong while loading SkillSync.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };
    void loadData();
    return () => { cancelled = true; };
  }, [authReady, user?.id]);

  useEffect(() => {
    if (myProfile) {
      setProfileDraft({
        full_name: myProfile.full_name ?? "", headline: myProfile.headline ?? "", college: myProfile.college ?? "",
        bio: myProfile.bio ?? "", skills_teach: (myProfile.skills_teach ?? []).join(", "),
        skills_learn: (myProfile.skills_learn ?? []).join(", "),
      });
    } else setProfileDraft(blankDraft);
  }, [myProfile?.id, myProfile?.updated_at]);

  useEffect(() => {
    if (!chatRequests.length) { setActiveConversationId(""); setMessages([]); return; }
    if (!chatRequests.some((request) => request.id === activeConversationId)) setActiveConversationId(chatRequests[0].id);
  }, [requests, activeConversationId]);

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    return profiles.filter((profile) => {
      if (profile.id === user?.id) return false;
      if (savedOnly && !savedIds.includes(profile.id)) return false;
      if (category !== "All skills" && profileCategory(profile) !== category) return false;
      const searchable = [profile.full_name, profile.headline, profile.college, profile.bio, ...(profile.skills_teach ?? []), ...(profile.skills_learn ?? [])].join(" ").toLowerCase();
      return !term || searchable.includes(term);
    });
  }, [profiles, user?.id, savedOnly, savedIds, category, search]);

  const visibleRequests = requests.filter((request) => {
    if (requestMode === "incoming") return request.recipient_id === user?.id;
    if (requestMode === "sent") return request.sender_id === user?.id;
    return true;
  });

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = supabase;
    if (!client) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    setAuthBusy(true); setAuthFeedback(null);
    try {
      if (authMode === "signup") {
        if (password.length < 8) throw new Error("Choose a password with at least 8 characters.");
        if (!name) throw new Error("Please enter your full name.");
        const { data, error } = await client.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) notify("Your account is ready. Start by completing your profile.");
        else {
          setAuthFeedback({ kind: "success", text: "Account created. Check your inbox and confirm your email, then return here to sign in." });
          setAuthMode("signin");
        }
      } else if (authMode === "reset") {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setAuthFeedback({ kind: "success", text: "If an account uses that email, a password reset link has been sent." });
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setAuthFeedback({ kind: "error", text: error instanceof Error ? error.message : "We could not complete that request. Please try again." });
    } finally { setAuthBusy(false); }
  };

  const signOut = async () => {
    const client = supabase;
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) setPageError(error.message);
    else {
      setSection("discover"); setAuthMode("signin"); setNotice(""); setPageError(""); notify("You have signed out.");
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = supabase;
    if (!client || !user) return;
    const fullName = profileDraft.full_name.trim();
    if (!fullName) { setPageError("Please enter your name."); return; }
    setSavingProfile(true); setPageError("");
    try {
      const update = {
        full_name: fullName, headline: profileDraft.headline.trim(), college: profileDraft.college.trim(),
        bio: profileDraft.bio.trim(), skills_teach: parseSkills(profileDraft.skills_teach),
        skills_learn: parseSkills(profileDraft.skills_learn), updated_at: new Date().toISOString(),
      };
      const { data, error } = await client.from("profiles").update(update).eq("id", user.id).select("*").single();
      if (error) throw error;
      const updated = data as Profile;
      setProfiles((current) => current.map((profile) => profile.id === user.id ? updated : profile));
      notify("Profile saved. Your updates are now visible to signed-in students.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Your profile could not be saved.");
    } finally { setSavingProfile(false); }
  };

  const toggleSaved = async (profile: Profile) => {
    const client = supabase;
    if (!client || !user) return;
    const isSaved = savedIds.includes(profile.id);
    const result = isSaved
      ? await client.from("saved_profiles").delete().eq("user_id", user.id).eq("profile_id", profile.id)
      : await client.from("saved_profiles").insert({ user_id: user.id, profile_id: profile.id });
    if (result.error) { setPageError("Could not update saved profiles: " + result.error.message); return; }
    setSavedIds((current) => isSaved ? current.filter((id) => id !== profile.id) : [...current, profile.id]);
    notify(isSaved ? "Profile removed from saved students." : "Profile saved for later.");
  };

  const openRequest = (profile: Profile) => {
    if (!myProfile || myProfile.skills_teach.length === 0 || profile.skills_teach.length === 0) {
      setSection("profile"); setPageError("Add at least one skill you can teach to your profile before sending an exchange request."); return;
    }
    const reciprocalTeach = myProfile.skills_teach.find((skill) => profile.skills_learn.some((wanted) => wanted.toLowerCase() === skill.toLowerCase()));
    const reciprocalLearn = profile.skills_teach.find((skill) => myProfile.skills_learn.some((wanted) => wanted.toLowerCase() === skill.toLowerCase()));
    setRequestTarget(profile);
    setRequestDraft({
      teachSkill: reciprocalTeach ?? myProfile.skills_teach[0],
      learnSkill: reciprocalLearn ?? profile.skills_teach[0],
      message: "Hi " + profile.full_name.split(" ")[0] + ", I'd like to exchange skills with you!",
    });
    setPageError("");
  };

  const sendRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = supabase;
    if (!client || !user || !requestTarget) return;
    if (!requestDraft.teachSkill || !requestDraft.learnSkill) { setPageError("Choose the skill you can teach and the skill you would like to learn."); return; }
    setSendingRequest(true); setPageError("");
    try {
      const { data, error } = await client.from("exchange_requests").insert({
        sender_id: user.id, recipient_id: requestTarget.id, teach_skill: requestDraft.teachSkill,
        learn_skill: requestDraft.learnSkill, message: requestDraft.message.trim(), status: "pending",
      }).select("*").single();
      if (error) {
        if (error.code === "23505") throw new Error("You already have a pending request with this student.");
        throw error;
      }
      setRequests((current) => [data as ExchangeRequest, ...current]);
      setRequestTarget(null); setSection("requests"); setRequestMode("sent"); notify("Skill-exchange request sent.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "The exchange request could not be sent.");
    } finally { setSendingRequest(false); }
  };

  const changeRequestStatus = async (request: ExchangeRequest, status: ExchangeRequest["status"]) => {
    const client = supabase;
    if (!client) return;
    setPageError("");
    const { data, error } = await client.from("exchange_requests").update({ status }).eq("id", request.id).select("*").single();
    if (error) { setPageError(error.message); return; }
    setRequests((current) => current.map((row) => row.id === request.id ? data as ExchangeRequest : row));
    notify(status === "accepted" ? "Request accepted. You can now message your learning partner."
      : status === "rejected" ? "Request declined."
      : status === "cancelled" ? "Request cancelled."
      : "Exchange marked as completed. Great work!");
  };

  const fetchMessages = async (requestId: string, silent = false) => {
    const client = supabase;
    if (!client) return;
    if (!silent) setMessagesLoading(true);
    const { data, error } = await client.from("messages").select("*").eq("request_id", requestId).order("created_at", { ascending: true });
    if (error) setPageError("Could not load messages: " + error.message);
    else setMessages((data ?? []) as ChatMessage[]);
    if (!silent) setMessagesLoading(false);
  };

  useEffect(() => {
    if (!activeConversationId || section !== "messages") return;
    void fetchMessages(activeConversationId);
    // Messages refresh when a conversation is opened or when the Refresh button is used.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, section]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = supabase;
    const body = newMessage.trim();
    if (!client || !user || !activeConversation || activeConversation.status !== "accepted" || !body) return;
    setSendingMessage(true); setPageError("");
    try {
      const { data, error } = await client.from("messages").insert({
        request_id: activeConversation.id, sender_id: user.id, body,
      }).select("*").single();
      if (error) throw error;
      setMessages((current) => [...current, data as ChatMessage]); setNewMessage("");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Message could not be sent.");
    } finally { setSendingMessage(false); }
  };

  if (!backendConfigured || !supabase) {
    return <div className="config-page"><div className="config-card"><Brand /><div className="config-icon"><ShieldCheck size={22} /></div><h1>Finish connecting SkillSync</h1><p>The site needs its Supabase public URL and publishable key to enable accounts and save real data. Add these environment variables in Vercel, then redeploy.</p><div className="config-vars"><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_PUBLISHABLE_KEY</code></div><a className="button button-primary" href="https://vercel.com" target="_blank" rel="noreferrer">Open Vercel settings <ArrowRight size={16} /></a></div></div>;
  }
  if (!authReady) return <div className="loading-screen"><div className="loader-mark"><LoaderCircle size={25} className="spin" /></div><Brand /><p>Preparing your learning space...</p></div>;
  if (!session) return <AuthScreen mode={authMode} setMode={(mode) => { setAuthMode(mode); setAuthFeedback(null); }} onSubmit={handleAuthSubmit} busy={authBusy} feedback={authFeedback ?? (authError ? { kind: "error", text: authError } : null)} setFeedback={(value) => { setAuthFeedback(value); setAuthError(null); }} />;

  const sectionTitle: Record<Section, { title: string; subtitle: string }> = {
    discover: { title: "Discover students", subtitle: "Find a learning partner whose skills complement yours." },
    profile: { title: "My profile", subtitle: "Tell the community what you know and what you want to learn." },
    requests: { title: "Skill exchanges", subtitle: "Manage requests and keep track of your learning commitments." },
    messages: { title: "Messages", subtitle: "Coordinate accepted exchanges with your learning partners." },
  };

  return (
    <div className="dashboard-shell">
      <aside className={"sidebar " + (mobileNavOpen ? "sidebar-open" : "")}>
        <div className="sidebar-brand"><Brand /></div>
        <div className="sidebar-label">YOUR LEARNING SPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {sections.map(({ id, label, icon: Icon }) => <button key={id} className={"nav-item " + (section === id ? "nav-item-active" : "")} onClick={() => { setSection(id); setMobileNavOpen(false); setPageError(""); }}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === "requests" && incomingPending > 0 && <b className="nav-count">{incomingPending}</b>}
          </button>)}
        </nav>
        <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={16} /></div><b>Small steps add up.</b><p>Update your skills and send one thoughtful exchange request to get started.</p><button className="text-action" onClick={() => { setSection("profile"); setMobileNavOpen(false); }}>Complete my profile <ArrowRight size={14} /></button></div>
        <div className="sidebar-user"><div className="avatar avatar-small">{initials(myProfile?.full_name || (session.user.email ?? "Student") || "Student")}</div><div className="sidebar-user-meta"><b>{myProfile?.full_name || "Student"}</b><small>{(session.user.email ?? "Student")}</small></div><button className="icon-button sidebar-logout" onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button></div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <button className="icon-button mobile-menu-toggle" onClick={() => setMobileNavOpen((value) => !value)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="topbar-heading"><div className="breadcrumbs">SkillSync <span>/</span> {sectionTitle[section].title}</div><h1>{sectionTitle[section].title}</h1></div>
          <div className="topbar-right"><div className="connection-status"><span /> Database connected</div><button className="topbar-avatar" title="Open my profile" onClick={() => setSection("profile")}>{initials(myProfile?.full_name || "Student")}</button></div>
        </header>

        <main className="dashboard-content">
          {pageError && <div className="page-alert" role="alert"><span>{pageError}</span><button onClick={() => setPageError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
          {dataLoading && <div className="inline-loading"><LoaderCircle size={17} className="spin" /> Loading your SkillSync data...</div>}

          {section === "discover" && <>
            <section className="welcome-row"><div><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>Hello, {myProfile?.full_name?.split(" ")[0] || "learner"} <span>✳</span></h2><p>Share what you know. Discover what you can learn next.</p></div><button className="button button-primary" onClick={() => setSection("profile")}><UserRound size={16} /> Update my skills</button></section>
            <section className="stats-grid" aria-label="Your SkillSync summary">
              <article className="stat-card"><div className="stat-icon stat-purple"><Users size={18} /></div><div><span>Students to explore</span><strong>{profiles.filter((profile) => profile.id !== session.session.user.id).length}</strong></div><small>Real member profiles</small></article>
              <article className="stat-card"><div className="stat-icon stat-green"><Inbox size={18} /></div><div><span>Waiting for you</span><strong>{incomingPending}</strong></div><small>Incoming requests</small></article>
              <article className="stat-card"><div className="stat-icon stat-orange"><Handshake size={18} /></div><div><span>Active exchanges</span><strong>{activeCount}</strong></div><small>Accepted skill swaps</small></article>
              <article className="stat-card"><div className="stat-icon stat-blue"><Bookmark size={18} /></div><div><span>Saved students</span><strong>{savedIds.length}</strong></div><small>Keep track of partners</small></article>
            </section>
            <section className="section-panel discovery-panel">
              <div className="panel-heading"><div><h2>Find your skill partner</h2><p>Search profiles and send a real request to start an exchange.</p></div><button className={"button " + (savedOnly ? "button-primary" : "button-outline") + " saved-filter"} onClick={() => setSavedOnly((value) => !value)}><Bookmark size={15} fill={savedOnly ? "currentColor" : "none"} /> {savedOnly ? "Showing saved" : "Saved only"}</button></div>
              <label className="search-field"><Search size={18} /><input aria-label="Search students by name or skill" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, skill, or college..." />{search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={15} /></button>}</label>
              <div className="filter-row" aria-label="Filter skills category">{categories.map((item) => <button key={item} className={category === item ? "filter-chip filter-chip-active" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>
              {!dataLoading && filteredProfiles.length === 0 ? <div className="empty-state"><div className="empty-icon"><Users size={24} /></div><h3>{savedOnly ? "No saved students match" : search || category !== "All skills" ? "No students found" : "You're one of the first students here"}</h3><p>{savedOnly ? "Turn off Saved only or bookmark a profile to see it here." : search || category !== "All skills" ? "Try a different search or category." : "Complete your profile and invite a classmate to join. New members appear here automatically."}</p>{(savedOnly || search || category !== "All skills") && <button className="button button-outline" onClick={() => { setSearch(""); setCategory("All skills"); setSavedOnly(false); }}>Clear filters</button>}{!savedOnly && !search && category === "All skills" && <button className="button button-primary" onClick={() => setSection("profile")}>Complete my profile <ArrowRight size={15} /></button>}</div> :
                <div className="student-grid">{filteredProfiles.map((profile) => {
                  const alreadyPending = requests.some((request) => request.status === "pending" && ((request.sender_id === session.session.user.id && request.recipient_id === profile.id) || (request.sender_id === profile.id && request.recipient_id === session.session.user.id)));
                  const learnOverlap = (myProfile?.skills_learn ?? []).filter((skill) => profile.skills_teach.some((candidate) => candidate.toLowerCase() === skill.toLowerCase()));
                  const teachOverlap = (myProfile?.skills_teach ?? []).filter((skill) => profile.skills_learn.some((candidate) => candidate.toLowerCase() === skill.toLowerCase()));
                  return <article className="student-card" key={profile.id}>
                    <div className="student-card-top"><div className="avatar avatar-large">{initials(profile.full_name)}</div><div className="student-identity"><h3>{profile.full_name}</h3><p>{profile.headline || "SkillSync student"}</p>{profile.college && <small>{profile.college}</small>}</div><button className={"save-button " + (savedIds.includes(profile.id) ? "is-saved" : "")} aria-label={savedIds.includes(profile.id) ? "Remove saved student" : "Save student"} title={savedIds.includes(profile.id) ? "Remove saved student" : "Save student"} onClick={() => void toggleSaved(profile)}><Bookmark size={17} fill={savedIds.includes(profile.id) ? "currentColor" : "none"} /></button></div>
                    {profile.bio && <p className="student-bio">{profile.bio}</p>}
                    <div className="student-skills"><div><span className="skill-label"><span className="skill-dot dot-purple" /> CAN TEACH</span><div className="skill-tags">{profile.skills_teach.length ? profile.skills_teach.map((skill) => <span key={skill}>{skill}</span>) : <em>Not added yet</em>}</div></div><div><span className="skill-label"><span className="skill-dot dot-green" /> WANTS TO LEARN</span><div className="skill-tags learn-tags">{profile.skills_learn.length ? profile.skills_learn.map((skill) => <span key={skill}>{skill}</span>) : <em>Not added yet</em>}</div></div></div>
                    <div className="match-note">{learnOverlap.length > 0 && teachOverlap.length > 0 ? <><CheckCircle2 size={14} /><span>Two-way match: you can teach {teachOverlap[0]} and learn {learnOverlap[0]}.</span></> : <><Sparkles size={14} /><span>Find a skill you can share and one you want to learn.</span></>}</div>
                    <button className="button button-primary card-request-button" disabled={alreadyPending} onClick={() => openRequest(profile)}>{alreadyPending ? "Request already pending" : "Propose an exchange"} <ArrowDownRight size={15} /></button>
                  </article>;
                })}</div>}
              <div className="panel-footnote"><ShieldCheck size={14} /> Only signed-in students can view profiles. Your email address is never shown on profile cards.</div>
            </section>
          </>}

          {section === "profile" && <section className="profile-layout">
            <div className="profile-main section-panel"><div className="panel-heading"><div><h2>Your student profile</h2><p>A clear profile helps students know how you can exchange skills.</p></div><div className="profile-avatar-large">{initials(profileDraft.full_name || "Student")}</div></div>
              <form className="profile-form" onSubmit={saveProfile}>
                <div className="form-grid">
                  <label>Full name<input value={profileDraft.full_name} onChange={(event) => setProfileDraft((draft) => ({ ...draft, full_name: event.target.value }))} maxLength={80} required /></label>
                  <label>Headline<input value={profileDraft.headline} onChange={(event) => setProfileDraft((draft) => ({ ...draft, headline: event.target.value }))} placeholder="e.g. CSE student learning AI" maxLength={120} /></label>
                  <label className="form-span-two">College / university<input value={profileDraft.college} onChange={(event) => setProfileDraft((draft) => ({ ...draft, college: event.target.value }))} placeholder="Your college name" maxLength={120} /></label>
                  <label className="form-span-two">A little about you<textarea rows={4} value={profileDraft.bio} onChange={(event) => setProfileDraft((draft) => ({ ...draft, bio: event.target.value }))} placeholder="What are you building, exploring, or working towards?" maxLength={700} /></label>
                  <label className="form-span-two">Skills I can teach <span className="field-hint">Separate skills with commas. Example: HTML, CSS, Java</span><input value={profileDraft.skills_teach} onChange={(event) => setProfileDraft((draft) => ({ ...draft, skills_teach: event.target.value }))} placeholder="HTML, CSS, Java" /></label>
                  <label className="form-span-two">Skills I want to learn <span className="field-hint">Separate skills with commas. Example: React, Figma, Python</span><input value={profileDraft.skills_learn} onChange={(event) => setProfileDraft((draft) => ({ ...draft, skills_learn: event.target.value }))} placeholder="React, Figma, Python" /></label>
                </div>
                <div className="form-help"><Sparkles size={16} /><span>List skills you are comfortable sharing and skills you are genuinely interested in learning.</span></div>
                <div className="form-actions"><span>Changes are saved to your account.</span><button className="button button-primary" disabled={savingProfile}>{savingProfile ? <LoaderCircle size={16} className="spin" /> : <Check size={16} />} {savingProfile ? "Saving..." : "Save profile"}</button></div>
              </form>
            </div>
            <aside className="profile-side"><div className="section-panel profile-preview"><div className="preview-kicker">PROFILE PREVIEW</div><div className="avatar avatar-preview">{initials(profileDraft.full_name || "Student")}</div><h3>{profileDraft.full_name || "Your name"}</h3><p>{profileDraft.headline || "Your student headline"}</p>{profileDraft.college && <small>{profileDraft.college}</small>}{profileDraft.bio && <p className="preview-bio">{profileDraft.bio}</p>}
              <div className="preview-skill-block"><b>CAN TEACH</b><div className="skill-tags">{parseSkills(profileDraft.skills_teach).map((skill) => <span key={skill}>{skill}</span>)}{!parseSkills(profileDraft.skills_teach).length && <em>Add a skill to get started</em>}</div></div>
              <div className="preview-skill-block"><b>WANTS TO LEARN</b><div className="skill-tags learn-tags">{parseSkills(profileDraft.skills_learn).map((skill) => <span key={skill}>{skill}</span>)}{!parseSkills(profileDraft.skills_learn).length && <em>Add a learning goal</em>}</div></div>
            </div><div className="privacy-note"><ShieldCheck size={17} /><div><b>Your information stays protected</b><p>Your profile is visible to signed-in members. Email and password are managed by Supabase Auth and never appear on your profile.</p></div></div></aside>
          </section>}

          {section === "requests" && <section className="section-panel requests-panel">
            <div className="panel-heading"><div><h2>Your skill exchanges</h2><p>Accept a request to open the conversation, then mark the swap complete when you finish.</p></div><div className="request-summary"><b>{requests.length}</b><span>total requests</span></div></div>
            <div className="request-tabs" role="tablist" aria-label="Filter exchange requests">
              {([{ id: "incoming", label: "Incoming", count: requests.filter((item) => item.recipient_id === session.session.user.id).length }, { id: "sent", label: "Sent by me", count: requests.filter((item) => item.sender_id === session.session.user.id).length }, { id: "all", label: "All requests", count: requests.length }] as {id: RequestMode; label: string; count: number}[]).map((item) => <button key={item.id} role="tab" aria-selected={requestMode === item.id} className={requestMode === item.id ? "request-tab request-tab-active" : "request-tab"} onClick={() => setRequestMode(item.id)}>{item.label}<span>{item.count}</span></button>)}
            </div>
            {!dataLoading && visibleRequests.length === 0 ? <div className="empty-state requests-empty"><div className="empty-icon"><Handshake size={24} /></div><h3>{requestMode === "incoming" ? "No incoming requests" : requestMode === "sent" ? "You haven't sent a request yet" : "No exchanges yet"}</h3><p>When you send or receive a request, it will appear here with its current status.</p><button className="button button-primary" onClick={() => setSection("discover")}>Find a student <Compass size={15} /></button></div> :
              <div className="request-list">{visibleRequests.map((request) => {
                const incoming = request.recipient_id === session.session.user.id;
                const peer = profiles.find((profile) => profile.id === (incoming ? request.sender_id : request.recipient_id));
                return <article className="request-card" key={request.id}>
                  <div className="avatar avatar-medium">{initials(peer?.full_name || "Student")}</div>
                  <div className="request-body">
                    <div className="request-title-row"><h3>{incoming ? peer?.full_name || "Student" : "You → " + (peer?.full_name || "student")}</h3><span className={"status-pill status-" + request.status}>{statusLabel(request.status)}</span></div>
                    <p className="request-subtitle">{incoming ? "Would like to exchange skills with you" : "You proposed a skill exchange"}</p>
                    <div className="exchange-detail"><span><small>{incoming ? "THEY CAN TEACH YOU" : "YOU OFFER TO TEACH"}</small><b>{incoming ? request.teach_skill : request.teach_skill}</b></span><ArrowRight size={16} /><span><small>{incoming ? "YOU WOULD TEACH" : "YOU WANT TO LEARN"}</small><b>{request.learn_skill}</b></span></div>
                    {request.message && <p className="request-message">“{request.message}”</p>}
                    <small className="request-date">Sent {relativeDate(request.created_at)}</small>
                    <div className="request-actions">
                      {request.status === "pending" && incoming && <><button className="button button-primary button-compact" onClick={() => void changeRequestStatus(request, "accepted")}><Check size={14} /> Accept</button><button className="button button-outline button-compact" onClick={() => void changeRequestStatus(request, "rejected")}>Decline</button></>}
                      {request.status === "pending" && !incoming && <button className="button button-outline button-compact" onClick={() => void changeRequestStatus(request, "cancelled")}>Cancel request</button>}
                      {(request.status === "accepted" || request.status === "completed") && <button className="button button-primary button-compact" onClick={() => { setActiveConversationId(request.id); setSection("messages"); }}><MessageCircle size={14} /> Open messages</button>}
                      {request.status === "accepted" && <button className="button button-outline button-compact" onClick={() => void changeRequestStatus(request, "completed")}><CheckCircle2 size={14} /> Mark complete</button>}
                    </div>
                  </div>
                </article>;
              })}</div>}
          </section>}

          {section === "messages" && <section className="messages-layout section-panel">
            <aside className="conversation-list"><div className="conversation-list-heading"><div><h2>Conversations</h2><p>Accepted skill exchanges</p></div><span>{chatRequests.length}</span></div>
              {chatRequests.length === 0 ? <div className="conversation-empty"><MessageCircle size={24} /><b>No conversations yet</b><p>Accept a request to message your partner.</p><button className="text-action" onClick={() => setSection("requests")}>View requests <ArrowRight size={14} /></button></div> :
                chatRequests.map((request) => {
                  const incoming = request.recipient_id === session.session.user.id;
                  const peer = profiles.find((profile) => profile.id === (incoming ? request.sender_id : request.recipient_id));
                  return <button key={request.id} className={"conversation-item " + (activeConversationId === request.id ? "conversation-item-active" : "")} onClick={() => setActiveConversationId(request.id)}>
                    <div className="avatar avatar-medium">{initials(peer?.full_name || "Student")}</div><span className="conversation-meta"><b>{peer?.full_name || "Student"}</b><small>{request.teach_skill} ↔ {request.learn_skill}</small><small>{request.status === "completed" ? "Exchange completed" : "Active exchange"}</small></span><ChevronDown size={15} className="conversation-chevron" />
                  </button>;
                })}
            </aside>
            <div className="chat-pane">
              {!activeConversation || !activePeer ? <div className="chat-empty"><div className="empty-icon"><MessageCircle size={24} /></div><h3>Select a conversation</h3><p>Choose an accepted exchange to coordinate your skill swap.</p></div> : <>
                <div className="chat-header"><div className="avatar avatar-medium">{initials(activePeer.full_name)}</div><div><b>{activePeer.full_name}</b><small>{activeConversation.teach_skill} ↔ {activeConversation.learn_skill}</small></div><button className="icon-button" onClick={() => void fetchMessages(activeConversation.id)} title="Refresh messages" aria-label="Refresh messages"><RefreshCw size={16} /></button></div>
                <div className="chat-message-area">
                  {messagesLoading ? <div className="inline-loading"><LoaderCircle size={17} className="spin" /> Loading messages...</div> : messages.length === 0 ? <div className="chat-empty chat-empty-compact"><div className="empty-icon"><Mail size={22} /></div><h3>Say hello to {activePeer.full_name.split(" ")[0]}</h3><p>Agree on a time, share resources, or decide what you will cover in your first session.</p></div> :
                    messages.map((message) => <div key={message.id} className={"chat-message-row " + (message.sender_id === session.session.user.id ? "chat-message-mine" : "")}><div className="chat-message-bubble"><p>{message.body}</p><small>{new Date(message.created_at).toLocaleString(undefined, { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" })}</small></div></div>)}
                </div>
                {activeConversation.status === "accepted" ? <form className="chat-compose" onSubmit={sendMessage}><textarea value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="Write a message..." aria-label="Message text" rows={2} maxLength={2000} required /><button className="button button-primary" disabled={sendingMessage || !newMessage.trim()} aria-label="Send message">{sendingMessage ? <LoaderCircle size={17} className="spin" /> : <Send size={17} />} Send</button></form> :
                  <div className="chat-completed-note"><CheckCircle2 size={15} /> This exchange is marked complete, so messaging is read-only.</div>}
              </>}
            </div>
          </section>}

          <footer className="dashboard-footer"><span>SkillSync · Learn together, grow together.</span><span><ShieldCheck size={13} /> Profile and exchange access is protected by account-level policies.</span></footer>
        </main>
      </div>

      {requestTarget && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRequestTarget(null); }}>
        <section className="request-modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
          <div className="modal-header"><div className="modal-icon"><Handshake size={20} /></div><button className="icon-button" onClick={() => setRequestTarget(null)} aria-label="Close request form"><X size={18} /></button></div>
          <div className="eyebrow">START A SKILL EXCHANGE</div><h2 id="request-modal-title">Connect with {requestTarget.full_name.split(" ")[0]}.</h2><p className="modal-description">Choose what you will share and what you hope to learn. Your request is saved so they can respond.</p>
          <form className="request-form" onSubmit={sendRequest}>
            <label>Skill you will teach<select value={requestDraft.teachSkill} onChange={(event) => setRequestDraft((draft) => ({ ...draft, teachSkill: event.target.value }))} required>{myProfile?.skills_teach.map((skill) => <option key={skill} value={skill}>{skill}</option>)}</select></label>
            <label>Skill you want to learn<select value={requestDraft.learnSkill} onChange={(event) => setRequestDraft((draft) => ({ ...draft, learnSkill: event.target.value }))} required>{requestTarget.skills_teach.map((skill) => <option key={skill} value={skill}>{skill}</option>)}</select></label>
            <label>Personal message <span className="field-hint">A short note helps the other student respond.</span><textarea rows={4} value={requestDraft.message} onChange={(event) => setRequestDraft((draft) => ({ ...draft, message: event.target.value }))} maxLength={500} placeholder="Hi! I'd love to exchange skills..." /></label>
            <div className="form-help"><ShieldCheck size={16} /> Your request will only be visible to you and the student you contact.</div>
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setRequestTarget(null)}>Cancel</button><button type="submit" className="button button-primary" disabled={sendingRequest}>{sendingRequest ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />} {sendingRequest ? "Sending..." : "Send request"}</button></div>
          </form>
        </section>
      </div>}

      {notice && <div className="toast" role="status"><CheckCircle2 size={16} /><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={15} /></button></div>}
    </div>
  );
}

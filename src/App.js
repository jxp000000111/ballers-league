import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const Card = ({ children }) => (
  <div
    style={{
      background: "#111",
      border: "1px solid #333",
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
    }}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, disabled = false, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "10px 16px",
      margin: "5px",
      background: disabled ? "#555" : "#2563eb",
      color: "white",
      border: "none",
      borderRadius: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 700,
      ...style
    }}
  >
    {children}
  </button>
);

const Input = (props) => (
  <input
    {...props}
    style={{
      padding: 10,
      width: props.width || 100,
      margin: 5,
      borderRadius: 8,
      border: "1px solid #ccc",
      ...props.style
    }}
  />
);

const fixtures = [
  ["Red Devilz", "Timeless Titans"],
  ["Amigos FC", "Beast FC"],
  ["Blue Lock FC", "Men in Black"],
  ["Red Devilz", "Galacticos 7"],
  ["Timeless Titans", "Amigos FC"],
  ["Beast FC", "Blue Lock FC"],
  ["Men in Black", "Galacticos 7"],
  ["Red Devilz", "Amigos FC"],
  ["Timeless Titans", "Blue Lock FC"],
  ["Beast FC", "Galacticos 7"],
  ["Red Devilz", "Men in Black"],
  ["Amigos FC", "Blue Lock FC"],
  ["Timeless Titans", "Galacticos 7"],
  ["Beast FC", "Men in Black"],
  ["Red Devilz", "Blue Lock FC"],
  ["Amigos FC", "Galacticos 7"],
  ["Timeless Titans", "Men in Black"],
  ["Red Devilz", "Beast FC"],
  ["Blue Lock FC", "Galacticos 7"],
  ["Amigos FC", "Men in Black"],
  ["Timeless Titans", "Beast FC"]
];

const playoffStages = [
  { key: "qualifier1", label: "Qualifier 1" },
  { key: "eliminator", label: "Eliminator" },
  { key: "qualifier2", label: "Qualifier 2" },
  { key: "final", label: "Grand Final" }
];

function sortTeams(teams) {
  return [...teams].sort(
    (a, b) =>
      b.pts - a.pts ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      b.off - a.off
  );
}

function LoginScreen({ email, setEmail, password, setPassword, onLogin, loading }) {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 420, maxWidth: "100%" }}>
        <Card>
          <h1 style={{ marginTop: 0 }}>Ballers League Admin Login</h1>
          <p style={{ color: "#bbb" }}>Viewer mode is public. Admin mode requires Supabase login.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} width="100%" style={{ width: "100%" }} />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} width="100%" style={{ width: "100%" }} />
            <Button onClick={onLogin} disabled={loading} style={{ width: "100%", marginLeft: 0, marginRight: 0 }}>
              {loading ? "Logging in..." : "Login as Admin"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [teams, setTeams] = useState([]);
  const [matchState, setMatchState] = useState({ match_index: 0, score1: 0, score2: 0, ticker: "Welcome to Ballers League Vol. II" });
  const [screen, setScreen] = useState("control");
  const [selectedTeam, setSelectedTeam] = useState("Amigos FC");
  const [bonusPoints, setBonusPoints] = useState(10);
  const [recentResults, setRecentResults] = useState([]);
  const [playoffs, setPlayoffs] = useState({
    qualifier1: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
    eliminator: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
    qualifier2: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
    final: { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
  });
  const [showGoalFlash, setShowGoalFlash] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "admin" ? "admin" : "viewer";

  const fetchData = async () => {
    const [{ data: teamsData }, { data: stateData }, { data: resultData }, { data: playoffData }] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("match_state").select("*").eq("id", 1).single(),
      supabase.from("results").select("*").order("match_no", { ascending: false }),
      supabase.from("playoffs").select("*")
    ]);

    if (teamsData) {
      setTeams(teamsData);
      if (teamsData.length && !selectedTeam) setSelectedTeam(teamsData[0].name);
    }
    if (stateData) setMatchState(stateData);
    if (resultData) setRecentResults(resultData);
    if (playoffData) {
      const next = { ...playoffs };
      playoffData.forEach((row) => {
        next[row.stage] = {
          team1: row.team1 || "",
          team2: row.team2 || "",
          score1: row.score1 || 0,
          score2: row.score2 || 0,
          winner: row.winner || ""
        };
      });
      setPlayoffs(next);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setAuthReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session || null);
      setAuthReady(true);
    });

    fetchData();

    const channel = supabase
      .channel("ballers-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_state" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "results" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "playoffs" }, fetchData)
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const sorted = useMemo(() => sortTeams(teams), [teams]);
  const top4 = sorted.slice(0, 4);

  const stats = useMemo(() => {
    const goals = teams.reduce((sum, t) => sum + (t.gf || 0), 0);
    const matches = recentResults.length;
    const avgGoals = matches ? (goals / matches).toFixed(2) : "0.00";
    const bestAttack = [...teams].sort((a, b) => (b.gf || 0) - (a.gf || 0))[0];
    const bestDefense = [...teams].sort((a, b) => (a.ga || 0) - (b.ga || 0))[0];
    return { goals, matches, avgGoals, bestAttack, bestDefense };
  }, [teams, recentResults]);

  const handleLogin = async () => {
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    setLoginLoading(false);
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const updateScore = async () => {
    if (mode !== "admin" || !session) return;
    if (matchState.match_index >= fixtures.length) return;

    const [t1, t2] = fixtures[matchState.match_index];
    const s1 = Number(matchState.score1 || 0);
    const s2 = Number(matchState.score2 || 0);

    const updated = teams.map((t) => {
      if (t.name !== t1 && t.name !== t2) return t;
      const gf = t.name === t1 ? s1 : s2;
      const ga = t.name === t1 ? s2 : s1;
      let pts = t.pts;
      if (s1 === s2) pts += 1;
      else if ((t.name === t1 && s1 > s2) || (t.name === t2 && s2 > s1)) pts += 3;
      return {
        ...t,
        pts,
        played: (t.played || 0) + 1,
        gf: (t.gf || 0) + gf,
        ga: (t.ga || 0) + ga,
        gd: (t.gd || 0) + (gf - ga)
      };
    });

    for (const team of updated) {
      await supabase
        .from("teams")
        .update({ pts: team.pts, played: team.played, gf: team.gf, ga: team.ga, gd: team.gd, off: team.off })
        .eq("id", team.id);
    }

    await supabase.from("results").insert({
      match_no: matchState.match_index + 1,
      team1: t1,
      team2: t2,
      score1: s1,
      score2: s2,
      result_text: s1 === s2 ? "Draw" : s1 > s2 ? `${t1} won` : `${t2} won`
    });

    await supabase
      .from("match_state")
      .update({
        match_index: matchState.match_index + 1,
        score1: 0,
        score2: 0,
        ticker: `FT • ${t1} ${s1}-${s2} ${t2}`
      })
      .eq("id", 1);

    setShowGoalFlash(true);
    setTimeout(() => setShowGoalFlash(false), 1600);
  };

  const addOffPitch = async () => {
    if (mode !== "admin" || !session) return;
    const team = teams.find((t) => t.name === selectedTeam);
    if (!team) return;

    await supabase
      .from("teams")
      .update({ pts: (team.pts || 0) + Number(bonusPoints), off: (team.off || 0) + Number(bonusPoints) })
      .eq("id", team.id);

    await supabase.from("match_state").update({ ticker: `${selectedTeam} earned ${bonusPoints} off-pitch points` }).eq("id", 1);
  };

  const seedPlayoffs = async () => {
    if (mode !== "admin" || !session) return;
    if (top4.length < 4) return;
    const q1 = { stage: "qualifier1", team1: top4[0].name, team2: top4[1].name, score1: 0, score2: 0, winner: "" };
    const el = { stage: "eliminator", team1: top4[2].name, team2: top4[3].name, score1: 0, score2: 0, winner: "" };
    await supabase.from("playoffs").upsert([q1, el], { onConflict: "stage" });
    await supabase.from("match_state").update({ ticker: "Playoffs seeded from top 4 league table" }).eq("id", 1);
  };

  const updatePlayoffField = (stage, field, value) => {
    setPlayoffs((prev) => ({
      ...prev,
      [stage]: { ...prev[stage], [field]: value }
    }));
  };

  const savePlayoff = async (stage) => {
    if (mode !== "admin" || !session) return;
    const row = playoffs[stage];
    const winner = Number(row.score1) >= Number(row.score2) ? row.team1 : row.team2;
    await supabase.from("playoffs").upsert([{ ...row, stage, winner }], { onConflict: "stage" });

    if (stage === "qualifier1" && playoffs.eliminator.winner) {
      const loser = Number(row.score1) >= Number(row.score2) ? row.team2 : row.team1;
      await supabase.from("playoffs").upsert([
        { stage: "qualifier2", team1: loser, team2: playoffs.eliminator.winner, score1: 0, score2: 0, winner: "" }
      ], { onConflict: "stage" });
    }

    if (stage === "eliminator" && playoffs.qualifier1.winner) {
      const q1 = playoffs.qualifier1;
      const loser = Number(q1.score1) >= Number(q1.score2) ? q1.team2 : q1.team1;
      await supabase.from("playoffs").upsert([
        { stage: "qualifier2", team1: loser, team2: winner, score1: 0, score2: 0, winner: "" }
      ], { onConflict: "stage" });
    }

    if (stage === "qualifier2") {
      const finalTeam1 = playoffs.qualifier1.winner || (Number(playoffs.qualifier1.score1) >= Number(playoffs.qualifier1.score2) ? playoffs.qualifier1.team1 : playoffs.qualifier1.team2);
      await supabase.from("playoffs").upsert([
        { stage: "final", team1: finalTeam1, team2: winner, score1: 0, score2: 0, winner: "" }
      ], { onConflict: "stage" });
    }

    if (stage === "final") {
      await supabase.from("match_state").update({ ticker: `🏆 Champions: ${winner}` }).eq("id", 1);
    } else {
      await supabase.from("match_state").update({ ticker: `${stage} completed • ${winner} advanced` }).eq("id", 1);
    }
  };

  if (mode === "admin" && !authReady) {
    return <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading admin...</div>;
  }

  if (mode === "admin" && !session) {
    return (
      <LoginScreen
        email={adminEmail}
        setEmail={setAdminEmail}
        password={adminPassword}
        setPassword={setAdminPassword}
        onLogin={handleLogin}
        loading={loginLoading}
      />
    );
  }

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20, fontFamily: "Arial, sans-serif", paddingBottom: 110 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>BALLERS LEAGUE MATCHDAY SYSTEM</h1>
          <div style={{ color: "#aaa" }}>{mode === "admin" ? "Admin Control Room" : "Viewer Broadcast Mode"}</div>
        </div>
        <div>
          <Button onClick={() => setScreen("control")} style={{ background: screen === "control" ? "#2563eb" : "#222" }}>Control Room</Button>
          <Button onClick={() => setScreen("stats")} style={{ background: screen === "stats" ? "#2563eb" : "#222" }}>Stats Screen</Button>
          {mode === "admin" && <Button onClick={handleLogout} style={{ background: "#b91c1c" }}>Logout</Button>}
        </div>
      </div>

      {showGoalFlash && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontSize: 56, fontWeight: 900, color: "#facc15", letterSpacing: 2 }}>
          GOAL UPDATE ⚽
        </div>
      )}

      {screen === "control" && (
        <>
          <Card>
            <h2>Current Match</h2>
            {matchState.match_index < fixtures.length ? (
              <>
                <h3>{fixtures[matchState.match_index][0]} vs {fixtures[matchState.match_index][1]}</h3>
                <Input type="number" value={matchState.score1} onChange={(e) => setMatchState((p) => ({ ...p, score1: Number(e.target.value) }))} />
                <Input type="number" value={matchState.score2} onChange={(e) => setMatchState((p) => ({ ...p, score2: Number(e.target.value) }))} />
                <br />
                {mode === "admin" ? <Button onClick={updateScore}>Submit Result</Button> : <div style={{ color: "#999" }}>Viewer mode cannot edit scores.</div>}
              </>
            ) : (
              <h3>League Stage Completed</h3>
            )}
          </Card>

          <Card>
            <h2>Off-Pitch Points</h2>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} style={{ padding: 10, borderRadius: 8, marginRight: 10 }} disabled={mode !== "admin"}>
              {teams.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
            <Input type="number" value={bonusPoints} onChange={(e) => setBonusPoints(Number(e.target.value))} disabled={mode !== "admin"} />
            <br />
            {mode === "admin" ? <Button onClick={addOffPitch}>Add Off-Pitch Points</Button> : <div style={{ color: "#999" }}>Viewer mode is read-only.</div>}
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ margin: 0 }}>Leaderboard</h2>
              {mode === "admin" && <Button onClick={seedPlayoffs}>Seed Playoffs From Top 4</Button>}
            </div>
            {sorted.map((t, i) => (
              <div key={t.name} style={{ marginBottom: 8, padding: "8px 0", borderBottom: "1px solid #1f1f1f" }}>
                {i + 1}. {t.name} — {t.pts} pts | MP {t.played} | GF {t.gf} | GA {t.ga} | GD {t.gd} | Off {t.off}
              </div>
            ))}
          </Card>

          <Card>
            <h2>IPL-Style Playoffs</h2>
            {playoffStages.map(({ key, label }) => (
              <div key={key} style={{ borderTop: "1px solid #222", paddingTop: 12, marginTop: 12 }}>
                <h3>{label}</h3>
                <div style={{ marginBottom: 8 }}>{playoffs[key].team1 || "TBD"} vs {playoffs[key].team2 || "TBD"}</div>
                <Input type="number" value={playoffs[key].score1} onChange={(e) => updatePlayoffField(key, "score1", Number(e.target.value))} disabled={mode !== "admin"} />
                <Input type="number" value={playoffs[key].score2} onChange={(e) => updatePlayoffField(key, "score2", Number(e.target.value))} disabled={mode !== "admin"} />
                {mode === "admin" && playoffs[key].team1 && playoffs[key].team2 && <Button onClick={() => savePlayoff(key)}>Save {label}</Button>}
                <div style={{ color: "#aaa", marginTop: 6 }}>Winner: {playoffs[key].winner || "TBD"}</div>
              </div>
            ))}
          </Card>
        </>
      )}

      {screen === "stats" && (
        <>
          <Card>
            <h2>Tournament Stats</h2>
            <p>Total Matches Played: {stats.matches}</p>
            <p>Total Goals: {stats.goals}</p>
            <p>Average Goals per Match: {stats.avgGoals}</p>
            <p>Best Attack: {stats.bestAttack?.name || "TBD"}</p>
            <p>Best Defense: {stats.bestDefense?.name || "TBD"}</p>
          </Card>

          <Card>
            <h2>Recent Results</h2>
            {recentResults.length === 0 ? <div>No results yet.</div> : recentResults.map((r) => (
              <div key={r.id} style={{ marginBottom: 8 }}>
                Match {r.match_no}: {r.team1} {r.score1}-{r.score2} {r.team2} • {r.result_text}
              </div>
            ))}
          </Card>

          <Card>
            <h2>Top 4 Snapshot</h2>
            {top4.map((t, i) => <div key={t.name}>{i + 1}. {t.name}</div>)}
          </Card>
        </>
      )}

      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", background: "#111", borderTop: "1px solid #333", padding: "12px 16px", fontWeight: "bold", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          {matchState.match_index < fixtures.length
            ? `${fixtures[matchState.match_index][0]} ${matchState.score1}-${matchState.score2} ${fixtures[matchState.match_index][1]}`
            : "League Stage Completed"}
        </div>
        <div style={{ color: "#facc15" }}>{matchState.ticker}</div>
      </div>
    </div>
  );
}

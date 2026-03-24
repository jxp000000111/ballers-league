import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

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

const TEAM_LOGOS = {
  "Amigos FC": "/logos/amigos.png",
  "Beast FC": "/logos/beast.png",
  "Blue Lock FC": "/logos/bluelock.png",
  "Galacticos 7": "/logos/galacticos7.png",
  "Men in Black": "/logos/meninblack.png",
  "Red Devilz": "/logos/reddevilz.png",
  "Timeless Titans": "/logos/timelesstitans.png"
};

const shell = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #163b78 0%, #0a1e45 34%, #04112a 65%, #020816 100%)",
  color: "#fff",
  padding: 20,
  fontFamily: "Arial, sans-serif",
  paddingBottom: 120
};

const cardStyle = {
  background:
    "linear-gradient(180deg, rgba(18,31,66,0.94) 0%, rgba(8,16,38,0.96) 100%)",
  border: "1px solid rgba(120,170,255,0.18)",
  borderRadius: 18,
  padding: 18,
  marginBottom: 16,
  boxShadow: "0 14px 34px rgba(0,0,0,0.28)",
  backdropFilter: "blur(10px)"
};

function injectStyles() {
  if (document.getElementById("ballers-animated-styles")) return;

  const style = document.createElement("style");
  style.id = "ballers-animated-styles";
  style.innerHTML = `
    @keyframes floatLogo {
      0% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-8px) scale(1.03); }
      100% { transform: translateY(0px) scale(1); }
    }
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 rgba(92,146,255,0.15); }
      50% { box-shadow: 0 0 28px rgba(92,146,255,0.28); }
      100% { box-shadow: 0 0 0 rgba(92,146,255,0.15); }
    }
    @keyframes tickerScroll {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    @keyframes goalFlash {
      0% { opacity: 0; transform: scale(0.8); }
      20% { opacity: 1; transform: scale(1.03); }
      80% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.08); }
    }
    @keyframes scorePop {
      0% { transform: scale(1); opacity: 0.7; }
      40% { transform: scale(1.35); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fullTimeReveal {
      0% { opacity: 0; transform: scale(0.92); }
      20% { opacity: 1; transform: scale(1.02); }
      80% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.06); }
    }
    .ballers-logo-card {
      animation: floatLogo 4.8s ease-in-out infinite, pulseGlow 3.6s ease-in-out infinite;
      transition: transform .25s ease, border-color .25s ease;
    }
    .ballers-logo-card:hover {
      transform: translateY(-6px) scale(1.03);
      border-color: rgba(135,188,255,0.35);
    }
    .ballers-ticker-track {
      white-space: nowrap;
      display: inline-block;
      animation: tickerScroll 16s linear infinite;
      padding-right: 40px;
    }
    .ballers-table-row {
      transition: background .2s ease, transform .2s ease;
    }
    .ballers-table-row:hover {
      background: rgba(255,255,255,0.03);
      transform: translateX(3px);
    }
    .score-pop {
      animation: scorePop 0.6s ease;
    }
  `;
  document.head.appendChild(style);
}

const Card = ({ children, style = {} }) => (
  <div style={{ ...cardStyle, ...style }}>{children}</div>
);

const Button = ({ children, onClick, disabled = false, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "10px 16px",
      margin: "5px",
      background: disabled
        ? "#4d5f87"
        : "linear-gradient(180deg, #3e7cff 0%, #2159d1 100%)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 700,
      boxShadow: disabled ? "none" : "0 10px 20px rgba(30,79,196,0.25)",
      ...style
    }}
  >
    {children}
  </button>
);

const Input = ({ width, style, ...props }) => (
  <input
    {...props}
    style={{
      padding: 10,
      width: width || 100,
      margin: 5,
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.96)",
      ...style
    }}
  />
);

function TeamLogo({ name, size = 54, rounded = 16 }) {
  const src = TEAM_LOGOS[name];
  return src ? (
    <img
      src={src}
      alt={name}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: rounded,
        background: "rgba(255,255,255,0.06)",
        padding: 4
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,0.08)",
        fontWeight: 700,
        fontSize: 12
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function LoginScreen({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  loading
}) {
  return (
    <div
      style={{
        ...shell,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div style={{ width: 440, maxWidth: "100%" }}>
        <Card>
          <h1 style={{ marginTop: 0 }}>Ballers League Admin Login</h1>
          <p style={{ color: "#b6c3e7" }}>
            Viewer mode stays public. Admin mode requires secure login.
          </p>
          <Input
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            width="100%"
            style={{ width: "100%", display: "block" }}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            width="100%"
            style={{ width: "100%", display: "block" }}
          />
          <Button
            onClick={onLogin}
            disabled={loading}
            style={{ width: "100%", marginLeft: 0, marginRight: 0 }}
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

function getFixtureStatus(matchNo, matchState, resultsMap) {
  if (resultsMap[matchNo]) return "FT";
  if (matchState.match_index + 1 === matchNo) return "LIVE";
  return "YET";
}

function getFixtureScore(matchNo, matchState, resultsMap) {
  if (resultsMap[matchNo]) {
    return `${resultsMap[matchNo].score1}-${resultsMap[matchNo].score2}`;
  }
  if (matchState.match_index + 1 === matchNo) {
    return `${matchState.score1}-${matchState.score2}`;
  }
  return "vs";
}

function getStatusPill(status) {
  if (status === "LIVE") {
    return {
      label: "LIVE",
      bg: "rgba(239,68,68,0.18)",
      color: "#ff8f8f",
      border: "1px solid rgba(239,68,68,0.35)"
    };
  }
  if (status === "FT") {
    return {
      label: "FULL TIME",
      bg: "rgba(34,197,94,0.16)",
      color: "#91f0b0",
      border: "1px solid rgba(34,197,94,0.28)"
    };
  }
  return {
    label: "YET TO PLAY",
    bg: "rgba(255,255,255,0.08)",
    color: "#d8e4ff",
    border: "1px solid rgba(255,255,255,0.12)"
  };
}

export default function App() {
  const [teams, setTeams] = useState([]);
  const [matchState, setMatchState] = useState({
    match_index: 0,
    score1: 0,
    score2: 0,
    ticker: "Welcome to Ballers League Vol. II"
  });
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
  const [goalPulse, setGoalPulse] = useState({ team: null, visible: false });
  const [fullTimeFlash, setFullTimeFlash] = useState(false);
  const [prevLiveScore, setPrevLiveScore] = useState({
    score1: 0,
    score2: 0,
    match_index: 0
  });
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "admin" ? "admin" : "viewer";

  useEffect(() => {
    injectStyles();
  }, []);

  const fetchData = async () => {
    const [
      { data: teamsData },
      { data: stateData },
      { data: resultData },
      { data: playoffData }
    ] = await Promise.all([
      supabase.from("teams").select("*").order("pts", { ascending: false }),
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
      const next = {
        qualifier1: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        eliminator: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        qualifier2: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        final: { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
      };

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
  let mounted = true;

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    if (!mounted) return;
    setSession(data.session || null);
    setAuthReady(true);
    await fetchData();
  };

  init();

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession || null);
      setAuthReady(true);
    }
  );

  const channel = supabase
    .channel("ballers-live-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "match_state" },
      async (payload) => {
        console.log("match_state changed", payload);
        if (!mounted) return;
        await fetchData();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "results" },
      async (payload) => {
        console.log("results changed", payload);
        if (!mounted) return;
        await fetchData();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "teams" },
      async (payload) => {
        console.log("teams changed", payload);
        if (!mounted) return;
        await fetchData();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "playoffs" },
      async (payload) => {
        console.log("playoffs changed", payload);
        if (!mounted) return;
        await fetchData();
      }
    )
    .subscribe((status) => {
      console.log("Realtime status:", status);
    });

  return () => {
    mounted = false;
    authListener?.subscription?.unsubscribe();
    supabase.removeChannel(channel);
  };
}, []);

  useEffect(() => {
    const prev = prevLiveScore;
    const curr = {
      score1: Number(matchState.score1 || 0),
      score2: Number(matchState.score2 || 0),
      match_index: Number(matchState.match_index || 0)
    };

    if (curr.match_index === prev.match_index) {
      if (curr.score1 > prev.score1) {
        setGoalPulse({ team: 1, visible: true });
        setTimeout(() => setGoalPulse({ team: null, visible: false }), 700);
      } else if (curr.score2 > prev.score2) {
        setGoalPulse({ team: 2, visible: true });
        setTimeout(() => setGoalPulse({ team: null, visible: false }), 700);
      }
    }

    if (curr.match_index > prev.match_index) {
      setFullTimeFlash(true);
      setTimeout(() => setFullTimeFlash(false), 1800);
    }

    setPrevLiveScore(curr);
  }, [matchState.score1, matchState.score2, matchState.match_index]);

  const sorted = useMemo(() => {
    return [...teams].sort(
      (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || b.off - a.off
    );
  }, [teams]);

  const top4 = sorted.slice(0, 4);

  const resultsMap = useMemo(() => {
    const map = {};
    recentResults.forEach((r) => {
      map[r.match_no] = r;
    });
    return map;
  }, [recentResults]);

  const fixtureRows = useMemo(() => {
    return fixtures.map((fixture, index) => {
      const matchNo = index + 1;
      const status = getFixtureStatus(matchNo, matchState, resultsMap);
      const score = getFixtureScore(matchNo, matchState, resultsMap);

      return {
        matchNo,
        team1: fixture[0],
        team2: fixture[1],
        status,
        score
      };
    });
  }, [matchState, resultsMap]);

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

  const adjustLiveScore = async (teamIndex, delta) => {
    if (mode !== "admin" || !session) return;

    const nextScore1 = Math.max(
      0,
      Number(matchState.score1 || 0) + (teamIndex === 1 ? delta : 0)
    );
    const nextScore2 = Math.max(
      0,
      Number(matchState.score2 || 0) + (teamIndex === 2 ? delta : 0)
    );

    await supabase
      .from("match_state")
      .update({
        score1: nextScore1,
        score2: nextScore2,
        ticker:
          matchState.match_index < fixtures.length
            ? `LIVE • ${fixtures[matchState.match_index][0]} ${nextScore1}-${nextScore2} ${fixtures[matchState.match_index][1]}`
            : matchState.ticker
      })
      .eq("id", 1);

    await fetchData();
  };

  const resetLiveScore = async () => {
    if (mode !== "admin" || !session) return;

    await supabase
      .from("match_state")
      .update({
        score1: 0,
        score2: 0,
        ticker:
          matchState.match_index < fixtures.length
            ? `LIVE • ${fixtures[matchState.match_index][0]} 0-0 ${fixtures[matchState.match_index][1]}`
            : "Welcome to Ballers League Vol. II"
      })
      .eq("id", 1);

    await fetchData();
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
      else if (
        (t.name === t1 && s1 > s2) ||
        (t.name === t2 && s2 > s1)
      ) {
        pts += 3;
      }

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
        .update({
          pts: team.pts,
          played: team.played,
          gf: team.gf,
          ga: team.ga,
          gd: team.gd,
          off: team.off
        })
        .eq("id", team.id);
    }

    await supabase
      .from("results")
      .upsert(
        {
          match_no: matchState.match_index + 1,
          team1: t1,
          team2: t2,
          score1: s1,
          score2: s2,
          result_text:
            s1 === s2 ? "Draw" : s1 > s2 ? `${t1} won` : `${t2} won`
        },
        { onConflict: "match_no" }
      );

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
    setTimeout(() => setShowGoalFlash(false), 1200);
    await fetchData();
  };

  const addOffPitch = async () => {
    if (mode !== "admin" || !session) return;
    const team = teams.find((t) => t.name === selectedTeam);
    if (!team) return;

    await supabase
      .from("teams")
      .update({
        pts: (team.pts || 0) + Number(bonusPoints),
        off: (team.off || 0) + Number(bonusPoints)
      })
      .eq("id", team.id);

    await supabase
      .from("match_state")
      .update({
        ticker: `${selectedTeam} earned ${bonusPoints} off-pitch points`
      })
      .eq("id", 1);

    await fetchData();
  };

  const seedPlayoffs = async () => {
    if (mode !== "admin" || !session || top4.length < 4) return;

    await supabase.from("playoffs").upsert(
      [
        {
          stage: "qualifier1",
          team1: top4[0].name,
          team2: top4[1].name,
          score1: 0,
          score2: 0,
          winner: ""
        },
        {
          stage: "eliminator",
          team1: top4[2].name,
          team2: top4[3].name,
          score1: 0,
          score2: 0,
          winner: ""
        }
      ],
      { onConflict: "stage" }
    );

    await supabase
      .from("match_state")
      .update({ ticker: "Playoffs seeded from top 4" })
      .eq("id", 1);

    await fetchData();
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

    await supabase
      .from("playoffs")
      .upsert([{ ...row, stage, winner }], { onConflict: "stage" });

    if (stage === "qualifier1" && playoffs.eliminator.winner) {
      const loser = Number(row.score1) >= Number(row.score2) ? row.team2 : row.team1;
      await supabase.from("playoffs").upsert(
        [
          {
            stage: "qualifier2",
            team1: loser,
            team2: playoffs.eliminator.winner,
            score1: 0,
            score2: 0,
            winner: ""
          }
        ],
        { onConflict: "stage" }
      );
    }

    if (stage === "eliminator") {
      const q1 = playoffs.qualifier1;
      if (q1.team1 && q1.team2) {
        const q1Winner =
          q1.winner ||
          (Number(q1.score1) >= Number(q1.score2) ? q1.team1 : q1.team2);
        const q1Loser = q1Winner === q1.team1 ? q1.team2 : q1.team1;

        await supabase.from("playoffs").upsert(
          [
            {
              stage: "qualifier2",
              team1: q1Loser,
              team2: winner,
              score1: 0,
              score2: 0,
              winner: ""
            }
          ],
          { onConflict: "stage" }
        );
      }
    }

    if (stage === "qualifier2") {
      const q1 = playoffs.qualifier1;
      const finalTeam1 =
        q1.winner ||
        (Number(q1.score1) >= Number(q1.score2) ? q1.team1 : q1.team2);

      await supabase.from("playoffs").upsert(
        [
          {
            stage: "final",
            team1: finalTeam1,
            team2: winner,
            score1: 0,
            score2: 0,
            winner: ""
          }
        ],
        { onConflict: "stage" }
      );
    }

    await supabase
      .from("match_state")
      .update({
        ticker:
          stage === "final"
            ? `🏆 Champions: ${winner}`
            : `${
                playoffStages.find((s) => s.key === stage)?.label
              } completed • ${winner} advanced`
      })
      .eq("id", 1);

    await fetchData();
  };

  if (mode === "admin" && !authReady) {
    return (
      <div style={{ ...shell, display: "grid", placeItems: "center" }}>
        Loading admin...
      </div>
    );
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
    <div style={shell}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 18
          }}
        >
          <div>
            <h1 style={{ margin: 0, letterSpacing: 1 }}>
              BALLERS LEAGUE MATCHDAY SYSTEM
            </h1>
            <div style={{ color: "#b6c3e7", marginTop: 6 }}>
              {mode === "admin" ? "Admin Control Room" : "Viewer Broadcast Mode"}
            </div>
          </div>

          <div>
            <Button
              onClick={() => setScreen("control")}
              style={{
                background:
                  screen === "control"
                    ? "linear-gradient(180deg, #4a8fff 0%, #2563eb 100%)"
                    : "#173563"
              }}
            >
              Control Room
            </Button>
            <Button
              onClick={() => setScreen("stats")}
              style={{
                background:
                  screen === "stats"
                    ? "linear-gradient(180deg, #4a8fff 0%, #2563eb 100%)"
                    : "#173563"
              }}
            >
              Stats Screen
            </Button>
            <Button
              onClick={() => setScreen("fixtures")}
              style={{
                background:
                  screen === "fixtures"
                    ? "linear-gradient(180deg, #4a8fff 0%, #2563eb 100%)"
                    : "#173563"
              }}
            >
              All Fixtures
            </Button>
            {mode === "admin" && (
              <Button
                onClick={handleLogout}
                style={{
                  background:
                    "linear-gradient(180deg, #dc2626 0%, #991b1b 100%)"
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </div>

        <Card style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap"
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: "#aac3ff",
                  textTransform: "uppercase",
                  letterSpacing: 1.5
                }}
              >
                League Identities
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                Animated Team Logo Strip
              </div>
            </div>
            <div style={{ color: "#c9d8ff" }}>
              Dark blue broadcast theme enabled
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 14,
              marginTop: 18
            }}
          >
            {Object.keys(TEAM_LOGOS).map((team, idx) => (
              <div
                key={team}
                className="ballers-logo-card"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 18,
                  padding: 14,
                  textAlign: "center",
                  animationDelay: `${idx * 0.18}s`
                }}
              >
                <div style={{ display: "grid", placeItems: "center", minHeight: 88 }}>
                  <TeamLogo name={team} size={78} rounded={20} />
                </div>
                <div style={{ marginTop: 10, fontWeight: 700, color: "#e6eeff" }}>
                  {team}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {showGoalFlash && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2,9,28,0.78)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              fontSize: 58,
              fontWeight: 900,
              color: "#ffe16b",
              letterSpacing: 2,
              animation: "goalFlash 1.2s ease-out forwards"
            }}
          >
            GOAL UPDATE ⚽
          </div>
        )}

        {fullTimeFlash && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2,9,28,0.82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1001,
              fontSize: 56,
              fontWeight: 900,
              color: "#ffe16b",
              letterSpacing: 2,
              animation: "fullTimeReveal 1.8s ease-out forwards"
            }}
          >
            FULL TIME
          </div>
        )}

        {screen === "control" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16
              }}
            >
              <Card>
                <h2 style={{ marginTop: 0 }}>Current Match</h2>

                {matchState.match_index < fixtures.length ? (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 14
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <TeamLogo name={fixtures[matchState.match_index][0]} size={56} />
                        <div style={{ fontWeight: 800 }}>
                          {fixtures[matchState.match_index][0]}
                        </div>
                      </div>

                      <div style={{ color: "#8eb0ff", fontWeight: 800 }}>VS</div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          justifyContent: "flex-end"
                        }}
                      >
                        <div style={{ fontWeight: 800, textAlign: "right" }}>
                          {fixtures[matchState.match_index][1]}
                        </div>
                        <TeamLogo name={fixtures[matchState.match_index][1]} size={56} />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: 12,
                        alignItems: "center",
                        maxWidth: 520,
                        marginTop: 10
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          className={goalPulse.visible && goalPulse.team === 1 ? "score-pop" : ""}
                          style={{
                            fontSize: 34,
                            fontWeight: 900,
                            color: "#ffffff",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          {matchState.score1}
                        </div>
                        {goalPulse.visible && goalPulse.team === 1 && (
                          <div
                            style={{
                              color: "#91f0b0",
                              fontWeight: 900,
                              fontSize: 14
                            }}
                          >
                            +1 GOAL
                          </div>
                        )}
                        {mode === "admin" && (
                          <div>
                            <Button
                              onClick={() => adjustLiveScore(1, 1)}
                              style={{ minWidth: 52 }}
                            >
                              +1
                            </Button>
                            <Button
                              onClick={() => adjustLiveScore(1, -1)}
                              style={{ minWidth: 52, background: "#173563" }}
                            >
                              -1
                            </Button>
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          textAlign: "center",
                          color: "#8eb0ff",
                          fontWeight: 800
                        }}
                      >
                        LIVE
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div
                          className={goalPulse.visible && goalPulse.team === 2 ? "score-pop" : ""}
                          style={{
                            fontSize: 34,
                            fontWeight: 900,
                            color: "#ffffff",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          {matchState.score2}
                        </div>
                        {goalPulse.visible && goalPulse.team === 2 && (
                          <div
                            style={{
                              color: "#91f0b0",
                              fontWeight: 900,
                              fontSize: 14
                            }}
                          >
                            +1 GOAL
                          </div>
                        )}
                        {mode === "admin" && (
                          <div>
                            <Button
                              onClick={() => adjustLiveScore(2, 1)}
                              style={{ minWidth: 52 }}
                            >
                              +1
                            </Button>
                            <Button
                              onClick={() => adjustLiveScore(2, -1)}
                              style={{ minWidth: 52, background: "#173563" }}
                            >
                              -1
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <br />

                    {mode === "admin" ? (
                      <>
                        <Button
                          onClick={resetLiveScore}
                          style={{ background: "#173563" }}
                        >
                          Reset Live Score
                        </Button>
                        <Button onClick={updateScore}>Submit Full Time Score</Button>
                      </>
                    ) : (
                      <div style={{ color: "#9bb3e4" }}>
                        Viewer mode cannot edit scores.
                      </div>
                    )}
                  </>
                ) : (
                  <h3>League Stage Completed</h3>
                )}
              </Card>

              <Card>
                <h2 style={{ marginTop: 0 }}>Off-Pitch Points</h2>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    marginRight: 10,
                    background: "#fff"
                  }}
                  disabled={mode !== "admin"}
                >
                  {teams.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(Number(e.target.value))}
                  disabled={mode !== "admin"}
                />
                <br />
                {mode === "admin" ? (
                  <Button onClick={addOffPitch}>Add Off-Pitch Points</Button>
                ) : (
                  <div style={{ color: "#9bb3e4" }}>Viewer mode is read-only.</div>
                )}
              </Card>
            </div>

            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10
                }}
              >
                <h2 style={{ margin: 0 }}>Leaderboard</h2>
                {mode === "admin" && (
                  <Button onClick={seedPlayoffs}>Seed Playoffs From Top 4</Button>
                )}
              </div>

              {sorted.map((t, i) => (
                <div
                  key={t.name}
                  className="ballers-table-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "42px 62px 1fr auto",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)"
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      color: i < 4 ? "#7bb0ff" : "#cbd8ff"
                    }}
                  >
                    {i + 1}
                  </div>
                  <TeamLogo name={t.name} size={48} rounded={14} />
                  <div>
                    <div style={{ fontWeight: 800 }}>{t.name}</div>
                    <div style={{ color: "#9bb3e4", fontSize: 13 }}>
                      MP {t.played} • GF {t.gf} • GA {t.ga} • GD {t.gd} • Off {t.off}
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{t.pts} pts</div>
                </div>
              ))}
            </Card>

            <Card>
              <h2 style={{ marginTop: 0 }}>IPL-Style Playoffs</h2>
              {playoffStages.map(({ key, label }) => (
                <div
                  key={key}
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: 12,
                    marginTop: 12
                  }}
                >
                  <h3>{label}</h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 8
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {playoffs[key].team1 ? (
                        <TeamLogo name={playoffs[key].team1} size={42} />
                      ) : null}
                      <span>{playoffs[key].team1 || "TBD"}</span>
                    </div>

                    <span style={{ color: "#8eb0ff" }}>VS</span>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "flex-end"
                      }}
                    >
                      <span>{playoffs[key].team2 || "TBD"}</span>
                      {playoffs[key].team2 ? (
                        <TeamLogo name={playoffs[key].team2} size={42} />
                      ) : null}
                    </div>
                  </div>

                  <Input
                    type="number"
                    value={playoffs[key].score1}
                    onChange={(e) =>
                      updatePlayoffField(key, "score1", Number(e.target.value))
                    }
                    disabled={mode !== "admin"}
                  />
                  <Input
                    type="number"
                    value={playoffs[key].score2}
                    onChange={(e) =>
                      updatePlayoffField(key, "score2", Number(e.target.value))
                    }
                    disabled={mode !== "admin"}
                  />

                  {mode === "admin" &&
                    playoffs[key].team1 &&
                    playoffs[key].team2 && (
                      <Button onClick={() => savePlayoff(key)}>
                        Save {label}
                      </Button>
                    )}

                  <div style={{ color: "#aac3ff", marginTop: 6 }}>
                    Winner: {playoffs[key].winner || "TBD"}
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        {screen === "stats" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16
              }}
            >
              <Card>
                <h2 style={{ marginTop: 0 }}>Tournament Stats</h2>
                <p>Total Matches Played: {stats.matches}</p>
                <p>Total Goals: {stats.goals}</p>
                <p>Average Goals per Match: {stats.avgGoals}</p>
                <p>Best Attack: {stats.bestAttack?.name || "TBD"}</p>
                <p>Best Defense: {stats.bestDefense?.name || "TBD"}</p>
              </Card>

              <Card>
                <h2 style={{ marginTop: 0 }}>Top 4 Snapshot</h2>
                {top4.map((t, i) => (
                  <div
                    key={t.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10
                    }}
                  >
                    <strong>{i + 1}.</strong>
                    <TeamLogo name={t.name} size={40} />
                    <span>{t.name}</span>
                  </div>
                ))}
              </Card>
            </div>

            <Card>
              <h2 style={{ marginTop: 0 }}>Recent Results</h2>
              {recentResults.length === 0 ? (
                <div>No results yet.</div>
              ) : (
                recentResults.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "30px 48px 1fr auto 1fr 48px",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                      paddingBottom: 10,
                      borderBottom: "1px solid rgba(255,255,255,0.06)"
                    }}
                  >
                    <div>{r.match_no}</div>
                    <TeamLogo name={r.team1} size={38} />
                    <div>{r.team1}</div>
                    <div style={{ fontWeight: 900 }}>
                      {r.score1}-{r.score2}
                    </div>
                    <div style={{ textAlign: "right" }}>{r.team2}</div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <TeamLogo name={r.team2} size={38} />
                    </div>
                  </div>
                ))
              )}
            </Card>
          </>
        )}

        {screen === "fixtures" && (
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 14
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>All Fixtures Tracker</h2>
                <div style={{ color: "#aac3ff", marginTop: 6 }}>
                  Shows live score, full-time result, or yet-to-play status for every match.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[getStatusPill("LIVE"), getStatusPill("FT"), getStatusPill("YET")].map(
                  (pill) => (
                    <div
                      key={pill.label}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: pill.bg,
                        color: pill.color,
                        border: pill.border,
                        fontSize: 12,
                        fontWeight: 800
                      }}
                    >
                      {pill.label}
                    </div>
                  )
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {fixtureRows.map((row) => {
                const pill = getStatusPill(row.status);

                return (
                  <div
                    key={row.matchNo}
                    className="ballers-table-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "76px 1fr auto 1fr 170px",
                      gap: 12,
                      alignItems: "center",
                      padding: 14,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "#d8e4ff" }}>
                      Match {row.matchNo}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <TeamLogo name={row.team1} size={44} rounded={14} />
                      <div style={{ fontWeight: 700 }}>{row.team1}</div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          color: row.status === "LIVE" ? "#ffb4b4" : "#ffffff"
                        }}
                      >
                        {row.score}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "flex-end"
                      }}
                    >
                      <div style={{ fontWeight: 700, textAlign: "right" }}>
                        {row.team2}
                      </div>
                      <TeamLogo name={row.team2} size={44} rounded={14} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          padding: "9px 12px",
                          borderRadius: 999,
                          background: pill.bg,
                          color: pill.color,
                          border: pill.border,
                          fontSize: 12,
                          fontWeight: 900,
                          minWidth: 120,
                          textAlign: "center"
                        }}
                      >
                        {pill.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background:
            "linear-gradient(180deg, rgba(7,19,45,0.98) 0%, rgba(2,8,22,0.98) 100%)",
          borderTop: "1px solid rgba(130,175,255,0.18)",
          padding: "12px 16px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 800, color: "#e7eeff" }}>
            {matchState.match_index < fixtures.length
              ? `${fixtures[matchState.match_index][0]} ${matchState.score1}-${matchState.score2} ${fixtures[matchState.match_index][1]}`
              : "League Stage Completed"}
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 260,
              overflow: "hidden",
              color: "#ffe16b"
            }}
          >
            <div className="ballers-ticker-track">{matchState.ticker}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

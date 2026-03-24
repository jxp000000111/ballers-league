import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const Card = ({ children }) => (
  <div
    style={{
      background: "#111",
      border: "1px solid #333",
      borderRadius: "16px",
      padding: "16px",
      marginBottom: "12px",
    }}
  >
    {children}
  </div>
);

const Button = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 16px",
      margin: "5px",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const Input = (props) => (
  <input
    {...props}
    style={{
      padding: "10px",
      width: "90px",
      margin: "5px",
      borderRadius: "8px",
      border: "1px solid #ccc",
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
  ["Timeless Titans", "Beast FC"],
];

export default function App() {
  const [teams, setTeams] = useState([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [screen, setScreen] = useState("control");
  const [ticker, setTicker] = useState("Welcome to Ballers League Vol. II");
  const [selectedTeam, setSelectedTeam] = useState("Amigos FC");
  const [bonusPoints, setBonusPoints] = useState(10);

  const fetchData = async () => {
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("*");

    const { data: stateData, error: stateError } = await supabase
      .from("match_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (!teamsError && teamsData) setTeams(teamsData);
    if (!stateError && stateData) {
      setMatchIndex(stateData.match_index);
      setS1(stateData.score1);
      setS2(stateData.score2);
      setTicker(stateData.ticker);
    }
  };

  useEffect(() => {
    fetchData();

    const teamsChannel = supabase
      .channel("teams-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => fetchData()
      )
      .subscribe();

    const stateChannel = supabase
      .channel("state-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_state" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(stateChannel);
    };
  }, []);

  const sorted = useMemo(() => {
    return [...teams].sort(
      (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || b.off - a.off
    );
  }, [teams]);

  const updateScore = async () => {
    if (matchIndex >= fixtures.length) return;

    const [t1, t2] = fixtures[matchIndex];

    const updated = teams.map((t) => {
      if (t.name !== t1 && t.name !== t2) return t;

      const gf = t.name === t1 ? s1 : s2;
      const ga = t.name === t1 ? s2 : s1;

      let pts = t.pts;
      if (s1 === s2) pts += 1;
      else if ((t.name === t1 && s1 > s2) || (t.name === t2 && s2 > s1)) {
        pts += 3;
      }

      return {
        ...t,
        pts,
        played: t.played + 1,
        gf: t.gf + gf,
        ga: t.ga + ga,
        gd: t.gd + (gf - ga),
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
          off: team.off,
        })
        .eq("id", team.id);
    }

    await supabase
      .from("match_state")
      .update({
        match_index: matchIndex + 1,
        score1: 0,
        score2: 0,
        ticker: `FT • ${t1} ${s1}-${s2} ${t2}`,
      })
      .eq("id", 1);

    setS1(0);
    setS2(0);
  };

  const addOffPitch = async () => {
    const team = teams.find((t) => t.name === selectedTeam);
    if (!team) return;

    await supabase
      .from("teams")
      .update({
        pts: team.pts + bonusPoints,
        off: team.off + bonusPoints,
      })
      .eq("id", team.id);

    await supabase
      .from("match_state")
      .update({
        ticker: `${selectedTeam} earned ${bonusPoints} off-pitch points`,
      })
      .eq("id", 1);
  };

  const stats = {
    goals: teams.reduce((sum, t) => sum + t.gf, 0),
    matches: matchIndex,
    avgGoals:
      matchIndex > 0
        ? (teams.reduce((sum, t) => sum + t.gf, 0) / matchIndex).toFixed(2)
        : "0.00",
  };

  const top4 = sorted.slice(0, 4);

  return (
    <div
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "90px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        BALLERS LEAGUE MATCHDAY SYSTEM
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Button onClick={() => setScreen("control")}>Control Room</Button>
        <Button onClick={() => setScreen("stats")}>Stats Screen</Button>
      </div>

      {screen === "control" && (
        <>
          <Card>
            <h2>Current Match</h2>
            {matchIndex < fixtures.length ? (
              <>
                <h3>
                  {fixtures[matchIndex][0]} vs {fixtures[matchIndex][1]}
                </h3>
                <Input
                  type="number"
                  value={s1}
                  onChange={(e) => setS1(Number(e.target.value))}
                />
                <Input
                  type="number"
                  value={s2}
                  onChange={(e) => setS2(Number(e.target.value))}
                />
                <br />
                <Button onClick={updateScore}>Submit Result</Button>
              </>
            ) : (
              <h3>League Stage Completed</h3>
            )}
          </Card>

          <Card>
            <h2>Off-Pitch Points</h2>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                marginRight: "10px",
              }}
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
            />
            <br />
            <Button onClick={addOffPitch}>Add Off-Pitch Points</Button>
          </Card>

          <Card>
            <h2>Leaderboard</h2>
            {sorted.map((t, i) => (
              <div key={t.name} style={{ marginBottom: "8px" }}>
                {i + 1}. {t.name} — {t.pts} pts | MP {t.played} | GF {t.gf} | GA{" "}
                {t.ga} | GD {t.gd} | Off {t.off}
              </div>
            ))}
          </Card>

          <Card>
            <h2>Top 4 Playoff Zone</h2>
            {top4.map((t, i) => (
              <div key={t.name}>
                {i + 1}. {t.name}
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
          </Card>

          <Card>
            <h2>Recent Standings Snapshot</h2>
            {sorted.map((t, i) => (
              <div key={t.name}>
                {i + 1}. {t.name} - {t.pts} pts
              </div>
            ))}
          </Card>
        </>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#111",
          borderTop: "1px solid #333",
          padding: "12px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {ticker}
      </div>
    </div>
  );
}

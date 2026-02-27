"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function StatisticsClient({
  role,
  departments,
  initialMembers,
  initialAttendance
}) {
  const [stats, setStats] = useState(null);
  const [memberStats, setMemberStats] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
  if (!initialMembers || !initialAttendance) return;

  let filteredMembers = initialMembers;
  let filteredAttendance = initialAttendance;

  if (selectedDepartment !== "all") {
    filteredMembers = initialMembers.filter(
      m => m.department_id === selectedDepartment
    );

    const memberIds = filteredMembers.map(m => m.id);

    filteredAttendance = initialAttendance.filter(a =>
      memberIds.includes(a.member_id)
    );
  }

  buildStats(filteredMembers, filteredAttendance);

}, [selectedDepartment, initialMembers, initialAttendance]);

  function buildStats(members, attendance) {
    const memberResults = members.map(member => {
      const entries = attendance.filter(a => a.member_id === member.id);

      const present = entries.filter(e => e.status === "present").length;
      const excused = entries.filter(e => e.status === "excused").length;
      const unexcused = entries.filter(e => e.status === "unexcused").length;

      const totalHours =
        entries.reduce((sum, e) => sum + (e.hours || 0), 0);

      const totalEntries = present + excused + unexcused;

      const attendanceRate =
        totalEntries > 0
          ? Math.round((present / totalEntries) * 100)
          : 0;

      return {
        id: member.id,
        name: member.first_name + " " + member.last_name,
        type: member.type,
        present,
        excused,
        unexcused,
        totalHours,
        attendanceRate
      };
    });

    const totalServices =
      new Set(attendance.map(a => a.service_id)).size;

    const totalHours =
      attendance.reduce((sum, a) => sum + (a.hours || 0), 0);

    const avgRate =
      memberResults.length > 0
        ? Math.round(
            memberResults.reduce((s, m) => s + m.attendanceRate, 0)
            / memberResults.length
          )
        : 0;

    setStats({
      totalServices,
      totalHours,
      attendanceRate: avgRate
    });

    setMemberStats(memberResults);
  }

  if (!stats)
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        Lade Statistik...
      </div>
    );

  const topYouth = memberStats
    .filter(m => m.type === "child")
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 3);

  const topLeaders = memberStats
    .filter(m => m.type !== "child")
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 sm:px-8 py-10 space-y-10">

      <h1 className="text-2xl font-bold text-[#d9ff00]">
        Statistik
      </h1>

      {role === "city_admin" && (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4">
          <div className="text-sm text-slate-400 mb-2">
            Ortswehr auswählen
          </div>

          <select
  value={selectedDepartment}
  onChange={(e) => setSelectedDepartment(e.target.value)}
  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-sm"
>
            <option value="all">Gesamt Stadt</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Dienste" value={stats.totalServices} />
        <StatCard title="Gesamtstunden" value={stats.totalHours.toFixed(1)} />
        <StatCard title="Teilnahmequote" value={`${stats.attendanceRate}%`} />
      </div>

      <TopSection title="🏆 Top 3 Jugendlicher" data={topYouth} />
      <TopSection title="🏆 Top 3 Betreuer" data={topLeaders} />

      <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-5 space-y-5">
        <h2 className="text-lg font-semibold text-[#d9ff00]">
          Mitglieder Übersicht
        </h2>

        {memberStats.map(m => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>
    </div>
  );
  /* ================= COMPONENTS ================= */

function StatCard({ title, value }) {
  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 text-center">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-3xl font-bold text-[#d9ff00] mt-2">
        {value}
      </div>
    </div>
  );
}

function TopSection({ title, data }) {
  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-[#d9ff00]">
        {title}
      </h2>

      {data.length === 0 && (
        <div className="text-slate-400 text-sm">
          Keine Daten vorhanden
        </div>
      )}

      {data.map((m, index) => (
        <div
          key={m.id}
          className="bg-[#0f172a] border border-slate-700 rounded-xl p-4 flex justify-between items-center"
        >
          <div>
            <div className="font-semibold">
              {index + 1}. {m.name}
            </div>
            <div className="text-xs text-slate-400">
              {m.attendanceRate}%
            </div>
          </div>
          <div className="text-[#d9ff00] font-bold">
            {m.totalHours.toFixed(1)} h
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberCard({ member }) {
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-4 space-y-3">

      <div className="flex justify-between items-center">
        <div className="font-semibold">{member.name}</div>
        <div className="text-sm font-bold">{member.attendanceRate}%</div>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            member.attendanceRate >= 80
              ? "bg-green-500"
              : member.attendanceRate >= 50
              ? "bg-yellow-400"
              : "bg-red-500"
          }`}
          style={{ width: `${member.attendanceRate}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-3 text-xs text-center">
        <div className="text-green-400">{member.present}</div>
        <div className="text-yellow-400">{member.excused}</div>
        <div className="text-red-400">{member.unexcused}</div>
        <div>{member.totalHours.toFixed(1)} h</div>
      </div>

    </div>
  );
}
}
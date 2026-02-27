"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import MembersDesktopView from "./MembersDesktopView";
import MembersMobileView from "./MembersMobileView";
import EditMemberModal from "./EditMemberModal";

export default function MembersClient({
  role,
  departmentId,
  departments,
  initialMembers
}) {

  // ✅ initialMembers vom Server
  const [members, setMembers] = useState(initialMembers);
  const [isMobile, setIsMobile] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [type, setType] = useState("child");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [editingMember, setEditingMember] = useState(null);

  const [showDeleted, setShowDeleted] = useState(false);

  /* ================= MOBILE DETECTION ================= */

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= RELOAD ================= */

  async function reload(customShowDeleted = showDeleted) {

  let query = supabase
    .from("members")
    .select(`*, departments:department_id (id, name)`)
    .order("last_name", { ascending: true });

  if (customShowDeleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (role !== "city_admin") {
    query = query.eq("department_id", departmentId);
  }

  const { data } = await query;
  setMembers(data || []);
}

  /* ================= CREATE ================= */

  async function createMember() {

    if (!firstName || !lastName) {
      setMessage("Vor- und Nachname sind Pflicht.");
      return;
    }

    const finalDepartment =
      role === "city_admin"
        ? selectedDepartment
        : departmentId;

    if (!finalDepartment) {
      setMessage("Bitte Ortswehr wählen.");
      return;
    }

    const { error } = await supabase.from("members").insert([{
      first_name: firstName,
      last_name: lastName,
      type,
      birthdate: birthdate || null,
      phone: phone || null,
      parent_name: type === "child" ? parentName : null,
      parent_phone: type === "child" ? parentPhone : null,
      department_id: finalDepartment,
      active: true
    }]);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Mitglied gespeichert!");
      setFirstName("");
      setLastName("");
      setBirthdate("");
      setPhone("");
      setParentName("");
      setParentPhone("");
      setSelectedDepartment("");
      reload();
    }
  }

  /* ================= UPDATE ================= */

  async function updateMember(updatedMember) {

    const { error } = await supabase
      .from("members")
      .update({
        first_name: updatedMember.first_name,
        last_name: updatedMember.last_name,
        type: updatedMember.type,
        birthdate: updatedMember.birthdate || null,
        phone: updatedMember.phone || null,
        parent_name: updatedMember.type === "child"
          ? updatedMember.parent_name
          : null,
        parent_phone: updatedMember.type === "child"
          ? updatedMember.parent_phone
          : null,
        active: updatedMember.active
      })
      .eq("id", updatedMember.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingMember(null);
    await reload();
  }

  async function restoreMember(memberId) {
  const { error } = await supabase
    .from("members")
    .update({ deleted_at: null })
    .eq("id", memberId);

  if (error) {
    alert(error.message);
    return;
  }

  await reload(false);
}

async function permanentlyDelete(memberId) {
  const confirmDelete = confirm(
    "Dieses Mitglied wird endgültig gelöscht. Fortfahren?"
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId);

  if (error) {
    alert(error.message);
    return;
  }

  await reload(true);
}

  /* ================= FILTER ================= */

  const filteredMembers = useMemo(() => {

    let result = members;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((m) =>
        `${m.first_name} ${m.last_name}`
          .toLowerCase()
          .includes(search)
      );
    }

    if (typeFilter !== "all") {
      result = result.filter(m => m.type === typeFilter);
    }

    if (role === "city_admin" && departmentFilter !== "all") {
      result = result.filter(
        m => m.department_id === departmentFilter
      );
    }

    return result;

  }, [members, searchTerm, typeFilter, departmentFilter, role]);

  /* ================= RENDER ================= */

  const viewProps = {
    members: filteredMembers,
    role,
    departments,
    departmentId,
    reload,

    searchTerm,
    setSearchTerm,

    typeFilter,
    setTypeFilter,
    departmentFilter,
    setDepartmentFilter,

    firstName,
    setFirstName,
    lastName,
    setLastName,
    type,
    setType,
    birthdate,
    setBirthdate,
    phone,
    setPhone,
    parentName,
    setParentName,
    parentPhone,
    setParentPhone,
    selectedDepartment,
    setSelectedDepartment,
    message,
    createMember,
    editingMember,
    setEditingMember,
    updateMember,
    restoreMember,
permanentlyDelete,
showDeleted
  };

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-12 space-y-8 text-white">

    {/* HEADER */}
    <div className="flex items-center justify-between">

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#d9ff00]">
        Mitgliederverwaltung
      </h1>

      {role === "city_admin" && (
        <button
          onClick={async () => {
  const newValue = !showDeleted;
  setShowDeleted(newValue);

  let query = supabase
    .from("members")
    .select(`*, departments:department_id (id, name)`)
    .order("last_name", { ascending: true });

  if (newValue) {
    // Archiv anzeigen
    query = query.not("deleted_at", "is", null);
  } else {
    // Aktive anzeigen
    query = query.is("deleted_at", null);
  }

  if (role !== "city_admin") {
    query = query.eq("department_id", departmentId);
  }

  const { data } = await query;
  setMembers(data || []);
}}
          className="
            bg-[#1e293b]
            border border-slate-700
            px-4 py-2
            rounded-xl
            text-sm
            hover:border-[#d9ff00]
            transition
          "
        >
          {showDeleted ? "aktuell: Archiv" : "aktuell: Aktive"}
        </button>
      )}

    </div>

    {/* VIEW */}
    {isMobile
      ? <MembersMobileView {...viewProps} />
      : <MembersDesktopView {...viewProps} />
    }

    {/* MODAL */}
    {editingMember && (
      <EditMemberModal
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={updateMember}
      />
    )}

  </div>
);
}
import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { useAuth } from "../../context/AuthContext";
import { getPatient, updatePatient } from "../../services/patients";
import { AREAS } from "../../utils/helpers";

export default function PatientProfile() {
  const { user } = useAuth();
  const [form,    setForm]    = useState({ name:"", phone:"", address:"", area:"" });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!user) return;
    getPatient(user.uid).then(p => {
      if (p) setForm({ name:p.name||"", phone:p.phone||"", address:p.address||"", area:p.area||"" });
      setLoading(false);
    });
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await updatePatient(user.uid, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  }

  const inp = {
    width:"100%", padding:"11px 14px",
    border:"1.5px solid var(--border)", borderRadius:8,
    fontSize:14, color:"var(--text-dark)", background:"white",
    outline:"none", fontFamily:"inherit",
  };

  return (
    <Layout type="patient" title="My Profile">
      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--text-light)" }}>Loading...</div>
      ) : (
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          {/* Header card */}
          <div style={{
            background:"linear-gradient(135deg, var(--teal-dark), var(--teal))",
            borderRadius:14, padding:"20px 24px", marginBottom:20,
            display:"flex", alignItems:"center", gap:16,
          }}>
            <div style={{
              width:52, height:52, borderRadius:"50%",
              background:"var(--gold)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:20, fontWeight:700, color:"var(--teal-dark)", flexShrink:0,
            }}>
              {form.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "P"}
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:"white" }}>
                {form.name || "Complete your profile"}
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", marginTop:2 }}>
                ✉️ {user?.email || "—"}
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(26,95,122,0.06)" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)" }}>Personal Information</h3>
            </div>
            <form onSubmit={handleSave} style={{ padding:24 }}>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Full Name *</label>
                <input style={inp} type="text" placeholder="Your full name"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} required />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Email</label>
                <input style={{ ...inp, background:"#f8f8f8", color:"var(--text-light)" }}
                  type="email" value={user?.email || ""} disabled />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Mobile Number</label>
                  <input style={inp} type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm(p => ({ ...p, phone:e.target.value }))} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Area</label>
                  <select style={inp} value={form.area} onChange={e => setForm(p => ({ ...p, area:e.target.value }))}>
                    <option value="">Select area</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Home Address</label>
                <textarea style={{ ...inp, resize:"vertical", minHeight:72 }}
                  placeholder="Your full home address"
                  value={form.address} onChange={e => setForm(p => ({ ...p, address:e.target.value }))} />
              </div>

              {error && <p style={{ color:"var(--danger)", fontSize:13, marginBottom:16 }}>{error}</p>}
              {saved && (
                <div style={{ background:"#e8f5e9", color:"#2e7d32", border:"1px solid #a5d6a7", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:600, marginBottom:16, textAlign:"center" }}>
                  ✅ Profile saved!
                </div>
              )}

              <button type="submit" disabled={saving} style={{
                width:"100%", padding:"12px", background:"var(--teal)", color:"white",
                border:"none", borderRadius:8, fontSize:15, fontWeight:600,
                cursor:saving?"not-allowed":"pointer", opacity:saving?0.7:1, fontFamily:"inherit",
              }}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
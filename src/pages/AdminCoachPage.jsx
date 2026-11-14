import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Button from "../components/ui/Button";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all bg-white";

const AdminCoachPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [students, setStudents] = useState([]);
  const [headCoaches, setHeadCoaches] = useState([]);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    description: "",
    imageFile: null,
    headCoachUserId: "",
  });
  const [assigningCoach, setAssigningCoach] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const fetchCoaches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/coaches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoaches(res.data);
    } catch (err) {
      console.error("Koçlar alınamadı:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.filter((user) => user.role === "student"));
      // Ana Koç dropdown'u için — ayrı bir backend endpoint'i gerekmiyor,
      // zaten çekilen tüm kullanıcı listesinden client-side filtreleniyor.
      setHeadCoaches(res.data.filter((user) => user.role === "head_coach"));
    } catch (err) {
      console.error("Öğrenci listesi alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchCoaches();
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("subject", formData.subject);
      data.append("description", formData.description);
      if (formData.imageFile) {
        data.append("image", formData.imageFile);
      }
      if (editingCoach) {
        // "" (Yok seçili) backend'de headCoachUserId'yi null'a çeker.
        data.append("headCoachUserId", formData.headCoachUserId || "");
      }

      if (editingCoach) {
        await axios.put(`/api/admin/coaches/${editingCoach.id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Koç başarıyla güncellendi.");
      } else {
        await axios.post("/api/admin/coaches", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Koç başarıyla oluşturuldu, giriş bilgileri e-postayla gönderildi.");
      }

      setFormData({ name: "", email: "", subject: "", description: "", imageFile: null, headCoachUserId: "" });
      setEditingCoach(null);
      fetchCoaches();
    } catch (err) {
      console.error("Koç işlemi hatası:", err.response?.data || err.message);
      alert("Koç işlemi sırasında bir hata oluştu.");
    }
  };

  const handleEdit = (coach) => {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      email: coach.email,
      subject: coach.subject,
      description: coach.description,
      imageFile: null,
      headCoachUserId: coach.headCoach?.id ? String(coach.headCoach.id) : "",
    });
  };

  const handleDelete = async (coach) => {
    if (!window.confirm(`"${coach.name}" koçunu silmek istediğinize emin misiniz?`)) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/admin/coaches/${coach.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCoaches();
    } catch (err) {
      console.error("Koç silinemedi:", err);
      alert("Koç silinemedi.");
    }
  };

  // "Atanmış Öğrenciler" listesinden bir öğrenciyi kaldırır — yeni bir
  // backend uç noktası gerekmiyor, mevcut assign-coach endpoint'i zaten
  // coachId:null ile "koçu kaldır" anlamına geliyor (adminCoach.controller.js
  // #assignCoachToUser). Öğrencinin kendi hesabı SİLİNMİYOR, sadece bu
  // koçtan ayrılıyor.
  const handleRemoveStudent = async (coach, student) => {
    if (!window.confirm(`${student.name} adlı öğrenciyi "${coach.name}" koçundan kaldırmak istediğinize emin misiniz?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/admin/assign-coach",
        { userId: student.id, coachId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCoaches();
    } catch (error) {
      console.error("Öğrenci kaldırma hatası:", error);
      alert("Öğrenci kaldırılamadı.");
    }
  };

  const handleAssignCoach = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/admin/assign-coach",
        {
          userId: parseInt(selectedStudentId),
          coachId: assigningCoach.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Koç başarıyla atandı.");
      setAssigningCoach(null);
      setSelectedStudentId("");
      fetchCoaches();
    } catch (error) {
      console.error("Koç atama hatası:", error);
      alert("Koç atama işlemi başarısız oldu.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const coachesPerPage = 6;

  const indexOfLastCoach = currentPage * coachesPerPage;
  const indexOfFirstCoach = indexOfLastCoach - coachesPerPage;
  const currentCoaches = coaches.slice(indexOfFirstCoach, indexOfLastCoach);
  const totalPages = Math.ceil(coaches.length / coachesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-1">
      <h2 className="text-lg font-black text-[#0f172a] mb-4">{editingCoach ? "Koçu Düzenle" : "Yeni Koç Ekle"}</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 mb-6 bg-white p-5 rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        encType="multipart/form-data"
      >
        <input
          type="text"
          placeholder="Kullanıcı Adı (Ad Soyad)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputCls}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputCls}
          required
        />
        <input
          type="text"
          placeholder="Branş (Matematik vb.)"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className={inputCls}
        />
        <textarea
          placeholder="Açıklama"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={inputCls}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, imageFile: e.target.files[0] })}
          className={inputCls}
        />
        {editingCoach && (
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">Ana Koç</label>
            <select
              className={inputCls}
              value={formData.headCoachUserId}
              onChange={(e) => setFormData({ ...formData, headCoachUserId: e.target.value })}
            >
              <option value="">— Yok —</option>
              {headCoaches.map((hc) => (
                <option key={hc.id} value={hc.id}>{hc.name}</option>
              ))}
            </select>
          </div>
        )}
        {!editingCoach && (
          <p className="text-xs text-[#64748b]">
            Kaydedince hesap rastgele bir şifreyle oluşturulur — koça mail gönderilmez, giriş yapmak isterse "Şifremi Unuttum" akışını kullanabilir.
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">
            {editingCoach ? "Güncelle" : "Ekle"}
          </Button>
          {editingCoach && (
            <Button
              type="button"
              variant="neutral"
              onClick={() => {
                setEditingCoach(null);
                setFormData({ name: "", email: "", subject: "", description: "", imageFile: null, headCoachUserId: "" });
              }}
            >
              İptal
            </Button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-3 gap-5 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
        {currentCoaches.map((coach) => (
          <div key={coach.id} className="bg-white border border-[#f1f5f9] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
            <img src={coach.image} alt={coach.name} className="w-full h-[200px] object-cover" />
            <div className="p-4">
              <h3 className="text-base font-black text-[#0f172a] mb-1">{coach.name}</h3>
              <p className="text-sm text-[#475569] mb-1">{coach.subject}</p>
              <p className="text-xs text-[#64748b] mb-3">{coach.description}</p>
              <div className="flex flex-wrap justify-end gap-2">
                <Button onClick={() => handleEdit(coach)} variant="info" size="sm">Düzenle</Button>
                <Button onClick={() => handleDelete(coach)} variant="danger" size="sm">Sil</Button>
                <Button onClick={() => setAssigningCoach(coach)} variant="success" size="sm">Öğrenciye Ata</Button>
              </div>
              {coach.assignedTo && coach.assignedTo.length > 0 && (
                <div className="mt-3 bg-[#f8fafc] p-2.5 rounded-xl border border-[#f1f5f9]">
                  <strong className="text-xs text-[#0f172a]">Atanmış Öğrenciler:</strong>
                  <ul className="text-xs text-[#475569] mt-1 space-y-1">
                    {coach.assignedTo.map((student) => (
                      <li key={student.id} className="flex items-center justify-between gap-2">
                        <span>{student.name} ({student.email})</span>
                        <button
                          onClick={() => handleRemoveStudent(coach, student)}
                          className="flex-shrink-0 text-[#dc2626] hover:underline font-bold"
                          title="Bu öğrenciyi koçtan kaldır"
                        >
                          Kaldır
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1.5 flex-wrap">
          <Button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} variant="neutral" size="sm">
            ‹ Önceki
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              onClick={() => paginate(i + 1)}
              variant={currentPage === i + 1 ? "secondary" : "neutral"}
              size="sm"
            >
              {i + 1}
            </Button>
          ))}
          <Button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} variant="neutral" size="sm">
            Sonraki ›
          </Button>
        </div>
      )}

      {/* Öğrenciye Ata Modal */}
      {assigningCoach && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[999]"
            onClick={() => {
              setAssigningCoach(null);
              setSelectedStudentId("");
            }}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl z-[1000] w-[90%] max-w-[400px]">
            <h3 className="text-base font-black text-[#0f172a] mb-3">
              {assigningCoach.name} koçunu öğrenciye ata
            </h3>
            <label className="text-xs font-bold text-[#475569] mb-1.5 block">Öğrenci Seç:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={inputCls}
            >
              <option value="">-- Öğrenci seçin --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleAssignCoach} disabled={!selectedStudentId} variant="secondary" size="sm">
                Ata
              </Button>
              <Button
                onClick={() => {
                  setAssigningCoach(null);
                  setSelectedStudentId("");
                }}
                variant="neutral"
                size="sm"
              >
                İptal
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCoachPage;

import { useEffect, useState } from "react";
import axios from "../utils/axios";

const AdminCoachPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "default123",
  subject: "",
  description: "",
  imageFile: null,
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
      const studentList = res.data.filter((user) => user.role === "student");
      setStudents(studentList);
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
      // GÜNCELLEME
      await axios.put(`/api/admin/coaches/${editingCoach.id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Koç başarıyla güncellendi.");
    } else {
      // YENİ OLUŞTURMA
      await axios.post("/api/admin/coaches", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Koç başarıyla oluşturuldu.");
    }

    // Temizle ve listeyi güncelle
    setFormData({
      name: "",
      email: "",
      subject: "",
      description: "",
      imageFile: null,
    });
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
    });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/admin/coaches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCoaches();
    } catch (err) {
      console.error("Koç silinemedi:", err);
    }
  };

  // Koç atama API çağrısı
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
    } catch (error) {
      console.error("Koç atama hatası:", error);
      alert("Koç atama işlemi başarısız oldu.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const coachesPerPage = 6;

  // Koçları sayfalara böl
  const indexOfLastCoach = currentPage * coachesPerPage;
  const indexOfFirstCoach = indexOfLastCoach - coachesPerPage;
  const currentCoaches = coaches.slice(indexOfFirstCoach, indexOfLastCoach);

  // Toplam sayfa sayısı
  const totalPages = Math.ceil(coaches.length / coachesPerPage);

  // Sayfa değiştirici
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const paginationBtnCls = "border-0 mx-1 py-1.5 px-3 rounded-md cursor-pointer font-bold transition-colors bg-[#ee3c05] text-white disabled:opacity-50 disabled:cursor-default hover:enabled:bg-[#ddd]";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Koç Yönetimi</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-6 bg-white p-4 rounded shadow"
        encType="multipart/form-data"
      >
        <input
          type="text"
          placeholder="Kullanıcı Adı (Ad Soyad)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Branş (Matematik vb.)"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="Açıklama"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFormData({ ...formData, imageFile: e.target.files[0] })
          }
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingCoach ? "Güncelle" : "Ekle"}
        </button>
      </form>

      <div className="grid grid-cols-3 gap-5 mt-5 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
        {currentCoaches.map((coach) => (
          <div key={coach.id} className="bg-white border border-[#ddd] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
            <img
              src={coach.image}
              alt={coach.name}
              className="w-full h-[200px] object-cover"
            />
            <div className="p-4">
              <h3 className="text-[18px] font-bold mb-1.5 text-[#333]">{coach.name}</h3>
              <p className="text-sm text-[#555] mb-1">{coach.subject}</p>
              <p className="text-[13px] text-[#666] mb-3">{coach.description}</p>
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => handleEdit(coach)}
                  className="py-1.5 px-3 text-[13px] border-0 cursor-pointer rounded-md transition-colors bg-[#e0f0ff] text-[#0066cc] hover:bg-[#cce7ff]"
                >
                  ✏️ Düzenle
                </button>
                <button
                  onClick={() => handleDelete(coach.id)}
                  className="py-1.5 px-3 text-[13px] border-0 cursor-pointer rounded-md transition-colors bg-[#ffe6e6] text-[#cc0000] hover:bg-[#ffcccc]"
                >
                  🗑 Sil
                </button>
                <button
                  onClick={() => setAssigningCoach(coach)}
                  className="py-1.5 px-3 text-[13px] border-0 cursor-pointer rounded-md transition-colors bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9]"
                >
                  👥 Öğrenciye Ata
                </button>
               {coach.assignedTo && coach.assignedTo.length > 0 && (
                <div className="mt-2 bg-[#f7f7f7] p-2 rounded-md">
                  <strong>Atanmış Öğrenciler:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {coach.assignedTo.map((student) => (
                      <li key={student.id}>
                        {student.name} ({student.email})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-center">
        <button
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
          className={paginationBtnCls}
        >
          ‹ Önceki
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`${paginationBtnCls} ${currentPage === i + 1 ? "bg-[#ddd] text-black" : ""}`}
            onClick={() => paginate(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => paginate(currentPage + 1)}
          className={paginationBtnCls}
        >
          Sonraki ›
        </button>
      </div>

      {/* Öğrenciye Ata Modal */}
      {assigningCoach && (
        <>
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] z-[999]"
            onClick={() => {
              setAssigningCoach(null);
              setSelectedStudentId("");
            }}
          ></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgb(24,49,192)] p-6 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.2)] z-[1000] w-[90%] max-w-[400px] text-white">
            <h3 className="mb-3">
              {assigningCoach.name} koçunu öğrenciye ata
            </h3>
            <label>Öğrenci Seç:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2 mt-2 text-black"
            >
              <option value="">-- Öğrenci seçin --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2.5 mt-4">
              <button
                onClick={handleAssignCoach}
                disabled={!selectedStudentId}
                className="py-1.5 px-3 bg-green-600 text-white border-0 rounded-md cursor-pointer font-bold disabled:opacity-50"
              >
                💾 Ata
              </button>
              <button
                onClick={() => {
                  setAssigningCoach(null);
                  setSelectedStudentId("");
                }}
                className="py-1.5 px-3 bg-gray-200 text-black border-0 rounded-md cursor-pointer font-bold"
              >
                İptal
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCoachPage;
